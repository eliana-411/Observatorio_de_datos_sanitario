import os
from typing import TypedDict, List

from langchain_cohere import ChatCohere
from langchain.schema import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from rag.chroma_store import get_vector_store

COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")

SYSTEM_PROMPT = """Eres un asistente especializado en salud pública y normativas sanitarias \
del departamento de Caldas, Colombia. Responde preguntas sobre protocolos de atención, \
normativas del Ministerio de Salud, guías clínicas y datos epidemiológicos, basándote \
exclusivamente en los documentos recuperados.

Si la información no está en el contexto, indícalo claramente. No inventes datos. \
Responde siempre en español.

Contexto recuperado:
{context}"""

_prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{question}"),
])


class RAGResponse(TypedDict):
    answer: str
    sources: List[dict]
    retrieval_confidence: float


def _format_context(docs_with_scores: List[tuple]) -> str:
    return "\n\n---\n\n".join(
        f"[{doc.metadata.get('source_file', 'Documento')}]\n{doc.page_content}"
        for doc, _ in docs_with_scores
    )


def _build_sources(docs_with_scores: List[tuple]) -> List[dict]:
    seen = set()
    sources = []
    for doc, score in docs_with_scores:
        key = (doc.metadata.get("source_file", ""), doc.metadata.get("page", ""))
        if key in seen:
            continue
        seen.add(key)
        sources.append({
            "title": doc.metadata.get("source_file", "Documento"),
            "page": doc.metadata.get("page", ""),
            "score": round(float(score), 4),
            "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
        })
    return sources


def ask(question: str, k: int = 4) -> RAGResponse:
    """Ejecuta la cadena RAG: recupera contexto y genera respuesta con Cohere."""
    vector_store = get_vector_store(for_query=True)
    docs_with_scores = vector_store.similarity_search_with_relevance_scores(question, k=k)
    context = _format_context(docs_with_scores)

    llm = ChatCohere(
        model="command-a-03-2025",
        cohere_api_key=COHERE_API_KEY,
        temperature=0.2,
        max_tokens=1024,
    )

    chain = _prompt | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": question})

    confidence = round(sum(s for _, s in docs_with_scores) / len(docs_with_scores), 4) if docs_with_scores else 0.0
    return RAGResponse(answer=answer, sources=_build_sources(docs_with_scores), retrieval_confidence=confidence)
