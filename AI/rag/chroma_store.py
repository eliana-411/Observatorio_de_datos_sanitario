"""
Vector store basado en SKLearnVectorStore + Cohere embeddings.
Sin dependencias nativas (no chromadb, no onnxruntime, no torch).
"""
import os
from pathlib import Path
from langchain_community.vectorstores import SKLearnVectorStore
from langchain_cohere import CohereEmbeddings

COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")

STORE_PATH = str(Path(__file__).parent.parent / "data" / "vector_store.parquet")


def get_embeddings() -> CohereEmbeddings:
    return CohereEmbeddings(
        model="embed-multilingual-v3.0",
        cohere_api_key=COHERE_API_KEY,
    )


def get_vector_store(for_query: bool = False) -> SKLearnVectorStore:
    return SKLearnVectorStore(
        embedding=get_embeddings(),
        persist_path=STORE_PATH,
        serializer="parquet",
    )


def collection_count() -> int:
    path = Path(STORE_PATH)
    if not path.exists():
        return 0
    try:
        import pandas as pd
        df = pd.read_parquet(path)
        return len(df)
    except Exception:
        return 0
