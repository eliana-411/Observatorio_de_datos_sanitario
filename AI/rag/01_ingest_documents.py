# AI/rag/01_ingest_documents.py
"""
Fase 1 — Ingesta de documentos al RAG
Carga PDFs desde rag/documents/, los divide en chunks,
genera embeddings con Voyage AI y los persiste en ChromaDB.

Ejecutar UNA SOLA VEZ (o cuando agregues nuevos documentos):
    python -m rag.01_ingest_documents

Para limpiar y reingestar todo desde cero:
    python -m rag.01_ingest_documents --reset
"""

import os
import sys
import argparse
import hashlib
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

import chromadb
from chromadb.config import Settings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_voyageai import VoyageAIEmbeddings


# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────

CHROMA_HOST     = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT     = int(os.getenv("CHROMA_PORT", 8001))
COLLECTION_NAME = "observatorio_sanitario_caldas"
DOCS_DIR        = Path(__file__).parent / "documents"
VOYAGE_API_KEY  = os.getenv("VOYAGE_API_KEY")

# Parámetros de chunking optimizados para documentos normativos en español
CHUNK_SIZE    = 1200
CHUNK_OVERLAP = 200

# ─────────────────────────────────────────────
# METADATOS POR CARPETA
# Los PDFs deben organizarse en subcarpetas según su tipo:
#   rag/documents/normativa/      → leyes, resoluciones, decretos
#   rag/documents/protocolo/      → protocolos INS, fichas SIVIGILA
#   rag/documents/guia_clinica/   → guías de práctica clínica, mhGAP
#   rag/documents/informe/        → boletines, ASIS, informes epidemiológicos
#   rag/documents/plan/           → planes territoriales, PDSP
# ─────────────────────────────────────────────

TIPO_POR_CARPETA = {
    "normativa":    "normativa",
    "protocolo":    "protocolo",
    "guia_clinica": "guia_clinica",
    "informe":      "informe",
    "plan":         "plan",
}

# Metadatos adicionales por nombre de archivo (fragmento del nombre → año y alcance)
METADATOS_ARCHIVO = {
    "1616":             {"año": "2013", "alcance": "nacional"},
    "2460":             {"año": "2025", "alcance": "nacional"},
    "3280":             {"año": "2018", "alcance": "nacional"},
    "0729":             {"año": "2025", "alcance": "nacional"},
    "4886":             {"año": "2018", "alcance": "nacional"},
    "3202":             {"año": "2016", "alcance": "nacional"},
    "089":              {"año": "2019", "alcance": "nacional"},
    "3992":             {"año": "2020", "alcance": "nacional"},
    "pdsp":             {"año": "2022", "alcance": "nacional"},
    "vivir_la_vida":    {"año": "2014", "alcance": "internacional"},
    "mhgap":            {"año": "2016", "alcance": "internacional"},
    "caldas":           {"año": "2023", "alcance": "departamental"},
    "protocolo_356":    {"año": "2023", "alcance": "nacional"},
    "conducta_suicida": {"año": "2023", "alcance": "nacional"},
}


def get_chroma_client() -> chromadb.HttpClient:
    """Conecta al ChromaDB que ya está corriendo en Docker."""
    client = chromadb.HttpClient(
        host=CHROMA_HOST,
        port=CHROMA_PORT,
        settings=Settings(anonymized_telemetry=False)
    )
    client.heartbeat()
    return client


def get_embeddings() -> VoyageAIEmbeddings:
    """Inicializa el modelo de embeddings de Voyage AI."""
    if not VOYAGE_API_KEY:
        raise EnvironmentError(
            "No se encontró VOYAGE_API_KEY en las variables de entorno.\n"
            "   Agrégala en el archivo .env: VOYAGE_API_KEY=tu_key_aqui"
        )
    return VoyageAIEmbeddings(
        voyage_api_key=VOYAGE_API_KEY,
        model="voyage-multilingual-2",  # Excelente para español
    )


def extraer_metadatos(pdf_path: Path) -> dict:
    """
    Extrae metadatos de un PDF basándose en su ruta y nombre de archivo.
    La carpeta padre determina el tipo; el nombre del archivo determina año y alcance.
    """
    carpeta = pdf_path.parent.name.lower()
    nombre  = pdf_path.stem.lower()

    tipo = TIPO_POR_CARPETA.get(carpeta, "general")

    año     = "desconocido"
    alcance = "nacional"
    for fragmento, meta in METADATOS_ARCHIVO.items():
        if fragmento in nombre:
            año     = meta.get("año", año)
            alcance = meta.get("alcance", alcance)
            break

    return {
        "fuente":    pdf_path.name,
        "tipo":      tipo,
        "año":       año,
        "alcance":   alcance,
        "ruta":      str(pdf_path),
        "ingestado": datetime.now().isoformat(),
    }


def generar_id_chunk(texto: str, fuente: str, indice: int) -> str:
    """Genera un ID único y reproducible para cada chunk."""
    contenido = f"{fuente}_{indice}_{texto[:100]}"
    return hashlib.md5(contenido.encode()).hexdigest()


def ingestar_pdf(
    pdf_path: Path,
    splitter: RecursiveCharacterTextSplitter,
    embeddings: VoyageAIEmbeddings,
    collection: chromadb.Collection,
    ids_existentes: set,
) -> tuple[int, int]:
    """
    Procesa un PDF: carga → divide → embeds → guarda en ChromaDB.
    Retorna (chunks_nuevos, chunks_omitidos).
    """
    print(f"\n  Procesando: {pdf_path.name}")

    try:
        loader  = PyPDFLoader(str(pdf_path))
        paginas = loader.load()
    except Exception as e:
        print(f"  Error cargando {pdf_path.name}: {e}")
        return 0, 0

    if not paginas:
        print(f"  El PDF está vacío o no tiene capa de texto: {pdf_path.name}")
        return 0, 0

    metadatos_base = extraer_metadatos(pdf_path)
    chunks = splitter.split_documents(paginas)

    nuevos   = 0
    omitidos = 0

    # Voyage AI permite lotes de hasta 128 documentos
    LOTE = 50
    for i in range(0, len(chunks), LOTE):
        lote_chunks = chunks[i:i + LOTE]

        textos    = []
        meta_list = []
        ids       = []

        for j, chunk in enumerate(lote_chunks):
            chunk_id = generar_id_chunk(chunk.page_content, pdf_path.name, i + j)

            if chunk_id in ids_existentes:
                omitidos += 1
                continue

            meta = {
                **metadatos_base,
                "pagina": chunk.metadata.get("page", 0) + 1,
            }

            textos.append(chunk.page_content)
            meta_list.append(meta)
            ids.append(chunk_id)

        if not textos:
            continue

        try:
            vectores = embeddings.embed_documents(textos)
            collection.add(
                ids        = ids,
                embeddings = vectores,
                documents  = textos,
                metadatas  = meta_list,
            )
            nuevos += len(textos)
            print(f" Lote {i // LOTE + 1}: {len(textos)} chunks agregados")
        except Exception as e:
            print(f" Error en lote {i // LOTE + 1}: {e}")

    return nuevos, omitidos


def main(reset: bool = False):
    print("=" * 60)
    print("  INGESTA DE DOCUMENTOS — Observatorio Sanitario Caldas")
    print("  Embeddings: Voyage AI (voyage-multilingual-2)")
    print("=" * 60)

    # 1. Verificar carpeta de documentos
    if not DOCS_DIR.exists():
        print(f"\n No se encontró: {DOCS_DIR}")
        print("   Organiza tus PDFs así:")
        print("   rag/documents/normativa/")
        print("   rag/documents/protocolo/")
        print("   rag/documents/guia_clinica/")
        print("   rag/documents/informe/")
        print("   rag/documents/plan/")
        sys.exit(1)

    # 2. Recolectar PDFs
    pdfs = list(DOCS_DIR.rglob("*.pdf"))
    if not pdfs:
        print(f"\n No se encontraron PDFs en {DOCS_DIR}")
        sys.exit(1)

    print(f"\n Carpeta: {DOCS_DIR}")
    print(f" PDFs encontrados: {len(pdfs)}")
    for pdf in pdfs:
        carpeta_rel = pdf.relative_to(DOCS_DIR).parent
        print(f"   [{carpeta_rel}] {pdf.name}")

    # 3. Conectar ChromaDB
    print(f"\n🔌 Conectando a ChromaDB en {CHROMA_HOST}:{CHROMA_PORT}...")
    try:
        client = get_chroma_client()
        print("  Conexión exitosa")
    except Exception as e:
        print(f"  No se pudo conectar: {e}")
        sys.exit(1)

    # 4. Preparar colección
    if reset:
        print(f"\n  Eliminando colección '{COLLECTION_NAME}'...")
        try:
            client.delete_collection(COLLECTION_NAME)
            print("  Eliminada")
        except Exception:
            pass

    collection = client.get_or_create_collection(
        name     = COLLECTION_NAME,
        metadata = {"hnsw:space": "cosine"},
    )

    ids_existentes = set(collection.get()["ids"]) if not reset else set()
    print(f"\n Chunks ya en la colección: {len(ids_existentes)}")

    # 5. Inicializar embeddings y splitter
    print("\n Inicializando Voyage AI embeddings...")
    embeddings = get_embeddings()
    print("  Listo (voyage-multilingual-2)")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size    = CHUNK_SIZE,
        chunk_overlap = CHUNK_OVERLAP,
        separators    = ["\n\n", "\n", ". ", " ", ""],
    )

    # 6. Procesar PDFs
    print("\n Iniciando ingesta...\n" + "-" * 60)
    total_nuevos   = 0
    total_omitidos = 0
    errores        = []

    for pdf in pdfs:
        nuevos, omitidos = ingestar_pdf(
            pdf, splitter, embeddings, collection, ids_existentes
        )
        total_nuevos   += nuevos
        total_omitidos += omitidos
        if nuevos == 0 and omitidos == 0:
            errores.append(pdf.name)

    # 7. Resumen
    total_en_coleccion = collection.count()
    print("\n" + "=" * 60)
    print("  RESUMEN DE INGESTA")
    print("=" * 60)
    print(f"  Chunks nuevos        : {total_nuevos}")
    print(f"  Chunks omitidos      : {total_omitidos}")
    print(f"  Total en ChromaDB    : {total_en_coleccion}")
    print(f"  Archivos con error   : {len(errores)}")
    if errores:
        for e in errores:
            print(f"     - {e}")

    if total_en_coleccion >= 500:
        print(f"\n ¡Objetivo cumplido! {total_en_coleccion} chunks (≥500 requeridos)")
    else:
        faltantes = 500 - total_en_coleccion
        print(f"\n Faltan {faltantes} chunks para llegar a 500.")
        print("     Agrega más documentos y vuelve a ejecutar.")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true",
                        help="Elimina la colección y reingesta todo")
    args = parser.parse_args()
    main(reset=args.reset)