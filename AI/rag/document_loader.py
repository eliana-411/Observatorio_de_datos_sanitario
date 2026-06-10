import os
from pathlib import Path
from typing import List

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

DOCUMENTS_DIR = Path(__file__).parent.parent / "data" / "documents"

# Chunks de ~500 tokens con 50 de overlap para mantener contexto entre fragmentos
_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""],
)


def load_documents(directory: Path = DOCUMENTS_DIR) -> List[Document]:
    """Carga todos los PDF y TXT del directorio y los divide en chunks."""
    if not directory.exists():
        directory.mkdir(parents=True, exist_ok=True)
        return []

    docs: List[Document] = []
    for path in directory.iterdir():
        if path.suffix.lower() == ".pdf":
            loader = PyPDFLoader(str(path))
            pages = loader.load()
        elif path.suffix.lower() == ".txt":
            loader = TextLoader(str(path), encoding="utf-8")
            pages = loader.load()
        else:
            continue

        # Añadir nombre del archivo como metadato
        for page in pages:
            page.metadata["source_file"] = path.name

        chunks = _splitter.split_documents(pages)
        docs.extend(chunks)

    return docs
