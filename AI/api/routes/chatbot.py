# AI/api/routes/chatbot.py

from fastapi import APIRouter, HTTPException
from api.schemas.chatbot_schemas import (
    ConsultaRequest,
    ConsultaResponse,
    FeedbackRequest,
    FeedbackResponse,
    ResumenEjecutivoRequest,
    ResumenEjecutivoResponse,
)
from rag.rag_chain import rag_chain  

router = APIRouter(prefix="/api/v1/chatbot", tags=["Chatbot RAG"])


@router.post("/consulta", response_model=ConsultaResponse)
async def consultar(request: ConsultaRequest):
    """
    Consulta al chatbot RAG sobre normativa, protocolos
    y guías clínicas del evento de intento de suicidio.
    """
    try:
        historial = [
            {"rol": m.rol, "contenido": m.contenido}
            for m in request.historial
        ]
        resultado = rag_chain.consultar(
            pregunta=request.pregunta,
            historial=historial,
        )
        return ConsultaResponse(**resultado)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en consulta RAG: {str(e)}")


@router.post("/feedback", response_model=FeedbackResponse)
async def registrar_feedback(request: FeedbackRequest):
    """
    Registra la calificación del usuario sobre una respuesta del chatbot.
    """
    try:
        import logging
        logger = logging.getLogger("chatbot.feedback")
        logger.info(
            f"Feedback | id={request.id_consulta} | "
            f"util={request.util} | comentario={request.comentario}"
        )
        return FeedbackResponse(
            mensaje="Feedback registrado correctamente. ¡Gracias!",
            id_consulta=request.id_consulta,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registrando feedback: {str(e)}")


@router.post("/resumen-ejecutivo", response_model=ResumenEjecutivoResponse)
async def generar_resumen(request: ResumenEjecutivoRequest):
    """
    Genera un resumen ejecutivo narrativo combinando datos
    del modelo predictivo con contexto normativo del RAG.
    """
    try:
        resumen = rag_chain.generar_resumen_ejecutivo(
            municipio=request.municipio,
            periodo=request.periodo,
            nivel_alerta=request.nivel_alerta,
            casos_predichos=request.casos_predichos,
            variacion_porcentual=request.variacion_porcentual,
        )
        return ResumenEjecutivoResponse(
            municipio=request.municipio,
            periodo=request.periodo,
            resumen=resumen,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando resumen: {str(e)}")


@router.get("/health")
async def health():
    """Verifica que el chatbot RAG está operativo."""
    try:
        collection = rag_chain._get_collection()
        total_chunks = collection.count()
        return {
            "status": "ok",
            "chunks_en_chromadb": total_chunks,
            "modelo_embeddings": "voyage-multilingual-2",
            "modelo_generacion": "claude-sonnet-4-5",
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"RAG no disponible: {str(e)}")