"""
Script para indexar los documentos de AI/data/documents/ en el vector store.

Uso:
    python -m scripts.ingest_documents

Corre una vez al montar el proyecto y cada vez que se añadan documentos nuevos.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from langchain_community.vectorstores import SKLearnVectorStore
from rag.document_loader import load_documents, DOCUMENTS_DIR
from rag.chroma_store import get_embeddings, STORE_PATH


def main():
    print(f"[ingest] Buscando documentos en: {DOCUMENTS_DIR}")
    docs = load_documents()

    if not docs:
        print("[ingest] No se encontraron documentos. Coloca PDFs o TXTs en AI/data/documents/")
        return

    print(f"[ingest] {len(docs)} chunks listos para indexar.")
    print("[ingest] Generando embeddings con Cohere (puede tardar unos segundos)...")

    store = SKLearnVectorStore.from_documents(
        documents=docs,
        embedding=get_embeddings(),
        persist_path=STORE_PATH,
        serializer="parquet",
    )
    store.persist()

    # Verificar
    import pandas as pd
    total = len(pd.read_parquet(STORE_PATH))
    print(f"[ingest] Indexación completada. Total guardado: {total} chunks en {STORE_PATH}")


if __name__ == "__main__":
    main()
