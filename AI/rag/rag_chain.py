# AI/rag/02_rag_chain.py
"""
Fase 2 — Cadena RAG
Conecta ChromaDB + Voyage AI (retrieval) + Claude (generación).
Se importa desde los endpoints de FastAPI.

Uso directo para pruebas:
    python -m rag.02_rag_chain
"""

import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

import chromadb
from chromadb.config import Settings
from langchain_voyageai import VoyageAIEmbeddings
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from functools import lru_cache
import hashlib

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────

CHROMA_HOST      = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT      = int(os.getenv("CHROMA_PORT", 8001))
COLLECTION_NAME  = "observatorio_sanitario_caldas"
VOYAGE_API_KEY   = os.getenv("VOYAGE_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Número de chunks a recuperar por consulta
K_RETRIEVAL = 3

# Palabras clave que activan el protocolo de crisis
PALABRAS_CRISIS = [
    "quiero morir", "no quiero vivir", "hacerme daño", "quitarme la vida",
    "suicidarme", "no puedo más", "acabar con todo", "matarme",
    "no vale la pena vivir", "mejor muerto", "mejor muerta",
    "pensamientos de suicidio", "quiero suicidarme",
]

PROMPT_SISTEMA = Path(__file__).parent.parent / "prompts" / "system_prompt.txt"

# Caché simple en memoria — guarda las últimas 50 consultas
_cache_consultas: dict[str, dict] = {}
MAX_CACHE = 50

def _clave_cache(pregunta: str) -> str:
    return hashlib.md5(pregunta.strip().lower().encode()).hexdigest()

def cargar_prompt_sistema() -> str:
    """Carga el prompt del sistema desde el archivo."""
    try:
        return PROMPT_SISTEMA.read_text(encoding="utf-8")
    except FileNotFoundError:
        return (
            "Eres un asistente especializado del Observatorio de Datos Sanitarios "
            "de Caldas. Responde únicamente con base en el contexto proporcionado "
            "y cita siempre las fuentes."
        )


def detectar_crisis(texto: str) -> bool:
    """Detecta si el mensaje contiene indicadores de crisis personal."""
    texto_lower = texto.lower()
    return any(palabra in texto_lower for palabra in PALABRAS_CRISIS)


def formatear_fuentes(metadatos: list[dict]) -> list[str]:
    """
    Extrae y deduplica las fuentes de los chunks recuperados.
    Retorna lista de strings legibles.
    """
    fuentes_vistas = set()
    fuentes = []
    for meta in metadatos:
        fuente = meta.get("fuente", "Documento desconocido")
        tipo   = meta.get("tipo", "")
        año    = meta.get("año", "")

        etiqueta = fuente
        if año and año != "desconocido":
            etiqueta = f"{fuente} ({año})"

        if etiqueta not in fuentes_vistas:
            fuentes_vistas.add(etiqueta)
            fuentes.append(etiqueta)

    return fuentes


class RAGChain:
    """
    Cadena RAG principal.
    Se instancia una sola vez al arrancar FastAPI (singleton).
    """

    def __init__(self):
        self._client     = None
        self._collection = None
        self._embeddings = None
        self._llm        = None
        self._prompt_sistema = cargar_prompt_sistema()

    def _get_client(self) -> chromadb.HttpClient:
        if self._client is None:
            self._client = chromadb.HttpClient(
                host=CHROMA_HOST,
                port=CHROMA_PORT,
                settings=Settings(anonymized_telemetry=False)
            )
        return self._client

    def _get_collection(self) -> chromadb.Collection:
        if self._collection is None:
            self._collection = self._get_client().get_collection(COLLECTION_NAME)
        return self._collection

    def _get_embeddings(self) -> VoyageAIEmbeddings:
        if self._embeddings is None:
            self._embeddings = VoyageAIEmbeddings(
                voyage_api_key=VOYAGE_API_KEY,
                model="voyage-multilingual-2",
            )
        return self._embeddings

    def _get_llm(self) -> ChatAnthropic:
        if self._llm is None:
            self._llm = ChatAnthropic(
                model="claude-sonnet-4-5",
                anthropic_api_key=ANTHROPIC_API_KEY,
                max_tokens=800,
                temperature=0,  # Bajo para respuestas precisas y consistentes
            )
        return self._llm

    def recuperar_contexto(
        self,
        pregunta: str,
        tipo_filtro: str | None = None,
    ) -> tuple[str, list[dict]]:
        """
        Busca los K chunks más relevantes en ChromaDB.
        Retorna (texto_contexto, lista_metadatos).
        """
        embeddings = self._get_embeddings()
        collection = self._get_collection()

        vector_pregunta = embeddings.embed_query(pregunta)

        # Filtro opcional por tipo de documento
        where = {"tipo": tipo_filtro} if tipo_filtro else None

        resultados = collection.query(
            query_embeddings=[vector_pregunta],
            n_results=K_RETRIEVAL,
            include=["documents", "metadatas", "distances"],
            where=where,
        )

        documentos = resultados["documents"][0]
        metadatos  = resultados["metadatas"][0]

        # Construir bloque de contexto para el prompt
        bloques = []
        for i, (doc, meta) in enumerate(zip(documentos, metadatos)):
            fuente  = meta.get("fuente", "Fuente desconocida")
            pagina  = meta.get("pagina", "?")
            tipo    = meta.get("tipo", "")
            bloque  = f"[Fuente {i+1}: {fuente}, p.{pagina}, tipo:{tipo}]\n{doc}"
            bloques.append(bloque)

        contexto = "\n\n---\n\n".join(bloques)
        return contexto, metadatos

    def consultar(
        self,
        pregunta: str,
        historial: list[dict] | None = None,
    ) -> dict:
        """
        Punto de entrada principal.
        Retorna dict con: id_consulta, respuesta, fuentes, mensaje_crisis.
        """
        historial = historial or []

        # ── Caché solo para preguntas sin historial ──────────────
        if not historial:
            clave = hashlib.md5(pregunta.strip().lower().encode()).hexdigest()
            if clave in _cache_consultas:
                # Retornar copia con nuevo id para no repetir el mismo UUID
                cached = _cache_consultas[clave].copy()
                cached["id_consulta"] = str(uuid.uuid4())
                return cached

        id_consulta = str(uuid.uuid4())
        es_crisis   = detectar_crisis(pregunta)

        # ── Recuperar contexto ───────────────────────────────────
        contexto, metadatos = self.recuperar_contexto(pregunta)
        fuentes = formatear_fuentes(metadatos)

        # ── Construir mensajes ───────────────────────────────────
        mensajes = [SystemMessage(content=self._prompt_sistema)]

        # Historial (máx últimos 6 turnos — reducido para velocidad)
        for turno in historial[-6:]:
            rol      = turno.get("rol", "usuario")
            contenido = turno.get("contenido", "")
            if rol == "usuario":
                mensajes.append(HumanMessage(content=contenido))
            else:
                mensajes.append(AIMessage(content=contenido))

        # Prompt final — instrucción de brevedad explícita
        prompt_con_contexto = (
            f"CONTEXTO:\n{contexto}\n\n"
            f"---\n\n"
            f"PREGUNTA: {pregunta}\n\n"
            f"Responde en máximo 300 palabras, usando listas cuando sea posible. "
            f"Basa tu respuesta ÚNICAMENTE en el contexto. "
            f"Cita la fuente en una sola línea al final."
        )
        mensajes.append(HumanMessage(content=prompt_con_contexto))

        # ── Llamar a Claude ──────────────────────────────────────
        respuesta = self._get_llm().invoke(mensajes)
        texto     = respuesta.content

        resultado = {
            "id_consulta":    id_consulta,
            "respuesta":      texto,
            "fuentes":        fuentes,
            "mensaje_crisis": es_crisis,
        }

        # ── Guardar en caché si no hay historial ─────────────────
        if not historial:
            if len(_cache_consultas) >= MAX_CACHE:
                # Eliminar la entrada más antigua
                _cache_consultas.pop(next(iter(_cache_consultas)))
            _cache_consultas[clave] = resultado

        return resultado

    def generar_resumen_ejecutivo(
        self,
        municipio: str,
        periodo: str,
        nivel_alerta: str | None = None,
        casos_predichos: int | None = None,
        variacion_porcentual: float | None = None,
    ) -> str:
        """
        Genera un resumen ejecutivo narrativo combinando datos
        del modelo predictivo con contexto normativo del RAG.
        """
        # Buscar contexto relevante sobre el municipio/periodo
        query_contexto = (
            f"indicadores conducta suicida municipio {municipio} "
            f"plan territorial salud mental Caldas alertas"
        )
        contexto, _ = self.recuperar_contexto(query_contexto, tipo_filtro=None)

        # Construir datos del modelo
        datos_modelo = f"Municipio: {municipio}\nPeriodo: {periodo}"
        if nivel_alerta:
            datos_modelo += f"\nNivel de alerta: {nivel_alerta}"
        if casos_predichos is not None:
            datos_modelo += f"\nCasos predichos: {casos_predichos}"
        if variacion_porcentual is not None:
            signo = "+" if variacion_porcentual > 0 else ""
            datos_modelo += f"\nVariación vs periodo anterior: {signo}{variacion_porcentual:.1f}%"

        prompt = (
            f"Con base en los siguientes datos del modelo predictivo y el contexto "
            f"normativo, genera un resumen ejecutivo conciso (máx 250 palabras) "
            f"para tomadores de decisiones del sector salud de Caldas.\n\n"
            f"DATOS DEL MODELO:\n{datos_modelo}\n\n"
            f"CONTEXTO NORMATIVO Y DE REFERENCIA:\n{contexto}\n\n"
            f"El resumen debe incluir: situación actual, tendencia, nivel de alerta "
            f"y una recomendación de acción basada en la normativa vigente."
        )

        llm      = self._get_llm()
        respuesta = llm.invoke([
            SystemMessage(content=self._prompt_sistema),
            HumanMessage(content=prompt),
        ])
        return respuesta.content


# Singleton — se reutiliza en todos los endpoints
rag_chain = RAGChain()
