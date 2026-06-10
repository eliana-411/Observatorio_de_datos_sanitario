# AI/rag/test_chroma_connection.py
"""
Test de conexión y estado de ChromaDB
Ejecutar desde la raíz del proyecto AI/:
    python -m rag.test_chroma_connection
"""

import os
import sys
from dotenv import load_dotenv
load_dotenv()

import chromadb
from chromadb.config import Settings

CHROMA_HOST     = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT     = int(os.getenv("CHROMA_PORT", 8001))
COLLECTION_NAME = "observatorio_sanitario_caldas"

def separador(titulo: str):
    print(f"\n{'─' * 50}")
    print(f"  {titulo}")
    print('─' * 50)

def test_conexion(client: chromadb.HttpClient) -> bool:
    separador("TEST 1 — Conexión a ChromaDB")
    try:
        ms = client.heartbeat()
        print(f"  ✅ Conectado exitosamente")
        print(f"  🏠 Host    : {CHROMA_HOST}:{CHROMA_PORT}")
        print(f"  💓 Heartbeat: {ms} ns")
        return True
    except Exception as e:
        print(f"  ❌ No se pudo conectar: {e}")
        print(f"\n  💡 Verifica que el contenedor Docker esté corriendo:")
        print(f"     docker ps | grep chroma")
        print(f"     docker start <nombre_del_contenedor>")
        return False

def test_colecciones(client: chromadb.HttpClient):
    separador("TEST 2 — Colecciones existentes")
    colecciones = client.list_collections()
    if not colecciones:
        print("  ⚠️  No hay colecciones creadas todavía.")
        print("  💡 Ejecuta primero: python -m rag.01_ingest_documents")
        return None

    print(f"  📦 Colecciones encontradas: {len(colecciones)}")
    for col in colecciones:
        count = client.get_collection(col.name).count()
        marcador = "👉" if col.name == COLLECTION_NAME else "  "
        print(f"  {marcador} '{col.name}' → {count} chunks")

    # Retornar la colección del proyecto si existe
    nombres = [c.name for c in colecciones]
    if COLLECTION_NAME in nombres:
        return client.get_collection(COLLECTION_NAME)
    else:
        print(f"\n  ⚠️  La colección '{COLLECTION_NAME}' no existe aún.")
        print(f"  💡 Ejecuta: python -m rag.01_ingest_documents")
        return None

def test_conteo(collection: chromadb.Collection):
    separador("TEST 3 — Conteo de chunks")
    total = collection.count()
    print(f"  📊 Total de chunks: {total}")

    if total == 0:
        print("  ⚠️  La colección está vacía.")
        print("  💡 Ejecuta: python -m rag.01_ingest_documents")
    elif total < 500:
        faltantes = 500 - total
        print(f"  ⚠️  Faltan {faltantes} chunks para cumplir el requisito (≥500)")
    else:
        print(f"  ✅ Requisito cumplido (≥500 chunks)")

def test_metadatos(collection: chromadb.Collection):
    separador("TEST 4 — Distribución por tipo de documento")
    try:
        todos = collection.get(include=["metadatas"])
        metadatos = todos.get("metadatas", [])

        if not metadatos:
            print("  ⚠️  No hay metadatos disponibles.")
            return

        # Contar por tipo
        por_tipo    = {}
        por_fuente  = {}
        por_alcance = {}

        for m in metadatos:
            tipo    = m.get("tipo", "desconocido")
            fuente  = m.get("fuente", "desconocida")
            alcance = m.get("alcance", "desconocido")

            por_tipo[tipo]       = por_tipo.get(tipo, 0) + 1
            por_fuente[fuente]   = por_fuente.get(fuente, 0) + 1
            por_alcance[alcance] = por_alcance.get(alcance, 0) + 1

        print("  📂 Por tipo de documento:")
        for tipo, count in sorted(por_tipo.items(), key=lambda x: -x[1]):
            barra = "█" * (count // 5)
            print(f"     {tipo:<15} {count:>4} chunks  {barra}")

        print("\n  🌍 Por alcance:")
        for alcance, count in sorted(por_alcance.items(), key=lambda x: -x[1]):
            print(f"     {alcance:<15} {count:>4} chunks")

        print(f"\n  📄 Documentos únicos: {len(por_fuente)}")
        for fuente, count in sorted(por_fuente.items(), key=lambda x: -x[1]):
            print(f"     [{count:>3} chunks]  {fuente}")

    except Exception as e:
        print(f"  ❌ Error leyendo metadatos: {e}")

def test_muestra(collection: chromadb.Collection):
    separador("TEST 5 — Muestra de un chunk")
    try:
        muestra = collection.peek(limit=1)
        ids       = muestra.get("ids", [])
        docs      = muestra.get("documents", [])
        metas     = muestra.get("metadatas", [])

        if not ids:
            print("  ⚠️  No hay chunks para mostrar.")
            return

        print(f"  🆔 ID     : {ids[0][:32]}...")
        print(f"  📁 Fuente : {metas[0].get('fuente', 'N/A')}")
        print(f"  🏷️  Tipo   : {metas[0].get('tipo', 'N/A')}")
        print(f"  📅 Año    : {metas[0].get('año', 'N/A')}")
        print(f"  📃 Texto  :")
        texto = docs[0][:300].replace('\n', ' ')
        print(f"     \"{texto}...\"")

    except Exception as e:
        print(f"  ❌ Error obteniendo muestra: {e}")

def test_busqueda_simple(collection: chromadb.Collection):
    separador("TEST 6 — Búsqueda semántica simple (sin embeddings)")
    try:
        # Búsqueda por metadato: trae chunks de tipo 'protocolo'
        resultado = collection.get(
            where={"tipo": "protocolo"},
            limit=3,
            include=["documents", "metadatas"]
        )
        docs  = resultado.get("documents", [])
        metas = resultado.get("metadatas", [])

        if not docs:
            print("  ⚠️  No hay chunks de tipo 'protocolo' aún.")
            print("  💡 Asegúrate de tener PDFs en rag/documents/protocolo/")
            return

        print(f"  ✅ Búsqueda por metadato tipo='protocolo': {len(docs)} resultado(s)")
        for i, (doc, meta) in enumerate(zip(docs, metas)):
            print(f"\n  Resultado {i+1}:")
            print(f"    Fuente : {meta.get('fuente', 'N/A')}")
            print(f"    Texto  : \"{doc[:200].replace(chr(10), ' ')}...\"")

    except Exception as e:
        print(f"  ❌ Error en búsqueda: {e}")

def main():
    print("\n" + "═" * 50)
    print("  DIAGNÓSTICO CHROMADB — Observatorio Caldas")
    print("═" * 50)
    print(f"  Host: {CHROMA_HOST}:{CHROMA_PORT}")
    print(f"  Colección objetivo: '{COLLECTION_NAME}'")

    # Crear cliente
    client = chromadb.HttpClient(
        host=CHROMA_HOST,
        port=CHROMA_PORT,
        settings=Settings(anonymized_telemetry=False)
    )

    # Test 1 — Conexión
    if not test_conexion(client):
        print("\n❌ No se puede continuar sin conexión. Abortando.\n")
        sys.exit(1)

    # Test 2 — Colecciones
    collection = test_colecciones(client)

    if collection is None:
        print("\n" + "═" * 50)
        print("  ⚠️  Sin colección. Ejecuta la ingesta primero.")
        print("═" * 50 + "\n")
        sys.exit(0)

    # Tests 3-6 solo si la colección existe
    test_conteo(collection)
    test_metadatos(collection)
    test_muestra(collection)
    test_busqueda_simple(collection)

    print("\n" + "═" * 50)
    print("  ✅ Diagnóstico completado")
    print("═" * 50 + "\n")

if __name__ == "__main__":
    main()