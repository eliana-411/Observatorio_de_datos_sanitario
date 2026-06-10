import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

router = APIRouter(prefix="/chat", tags=["chatbot"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = Field(default="default")

    model_config = {
        "json_schema_extra": {
            "example": {"message": "¿Cuáles son los protocolos para atención de crisis por autolesión?"}
        }
    }


class SourceItem(BaseModel):
    title: str
    page: str | int
    score: float = 0.0
    content: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceItem]
    docs_indexed: int
    retrieval_confidence: float = 0.0
    response_time_ms: int = 0


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest):
    """
    Recibe una pregunta y retorna una respuesta generada con RAG
    (contexto recuperado de ChromaDB + OpenAI como LLM).
    """
    # Import lazy para que el servidor arranque aunque onnxruntime/chromadb fallen al cargar
    try:
        from rag.chain import ask
        from rag.chroma_store import collection_count
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Módulo RAG no disponible: {str(e)}")

    indexed = collection_count()
    if indexed == 0:
        raise HTTPException(
            status_code=503,
            detail="La base de conocimientos está vacía. Ejecuta el script de ingesta primero.",
        )

    t0 = time.perf_counter()
    result = ask(payload.message)
    elapsed_ms = int((time.perf_counter() - t0) * 1000)

    return ChatResponse(
        answer=result["answer"],
        sources=[SourceItem(**s) for s in result["sources"]],
        docs_indexed=indexed,
        retrieval_confidence=result["retrieval_confidence"],
        response_time_ms=elapsed_ms,
    )


@router.get("/status")
def chat_status():
    """Retorna el número de documentos indexados en ChromaDB."""
    try:
        from rag.chroma_store import collection_count
        return {"docs_indexed": collection_count(), "status": "ok"}
    except Exception as e:
        return {"docs_indexed": 0, "status": "unavailable", "detail": str(e)}
