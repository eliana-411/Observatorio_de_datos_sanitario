# AI/rag/telegram_bot.py
"""
Fase 4 — Bot de Telegram con streaming
Conecta el chatbot RAG con Telegram usando python-telegram-bot 20.x.

Ejecutar:
    python -m rag.telegram_bot
"""

import os
import logging
from dotenv import load_dotenv
load_dotenv()

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)
from telegram.constants import ParseMode
from rag.rag_chain import rag_chain

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Historial por usuario { chat_id: [{rol, contenido}] }
historiales: dict[int, list[dict]] = {}

MENSAJE_BIENVENIDA = (
    "👋 *Bienvenido al Observatorio de Datos Sanitarios de Caldas*\n\n"
    "Soy un asistente especializado en el evento de *intento de suicidio* "
    "\\(código SIVIGILA 356\\)\\.\n\n"
    "Puedo ayudarte con:\n"
    "📋 Normativa vigente \\(Ley 2460/2025, Ley 1616/2013, Res\\. 3280/2018\\)\n"
    "🔬 Protocolos de vigilancia epidemiológica del INS\n"
    "🏥 Rutas de atención y guías clínicas\n"
    "📊 Planes territoriales de salud mental de Caldas\n\n"
    "*¿En qué puedo ayudarte hoy?*\n\n"
    "⚠️ _Este asistente es para uso exclusivo de personal del sistema de salud\\._\n\n"
    "Comandos: /start \\| /limpiar \\| /ayuda"
)

MENSAJE_AYUDA = (
    "*Comandos disponibles:*\n\n"
    "/start — Iniciar o reiniciar la conversación\n"
    "/limpiar — Borrar el historial\n"
    "/ayuda — Mostrar esta ayuda\n\n"
    "*Ejemplos de preguntas:*\n"
    "• ¿Cuáles son los criterios de notificación del evento 356?\n"
    "• ¿Qué dice la Ley 2460 de 2025 sobre salud mental?\n"
    "• ¿Cuál es la ruta de atención en primer nivel?\n"
    "• ¿Cómo se diligencia la ficha SIVIGILA del evento 356?"
)

MENSAJE_CRISIS = (
    "🆘 *Si estás en una situación de crisis o tienes pensamientos "
    "de hacerte daño, comunícate ahora:*\n\n"
    "📞 *Línea 106* — Salud Mental \\(gratuita, 24h, toda Colombia\\)\n"
    "📞 *Línea 123* — Emergencias\n\n"
    "_No estás solo/a\\. Hay personas capacitadas esperando tu llamada\\._"
)

MENSAJE_ESCRIBIENDO = "⏳ _Consultando documentos y generando respuesta\\.\\.\\._"


def escapar_md(texto: str) -> str:
    """
    Escapa caracteres especiales para MarkdownV2 de Telegram.
    Solo escapa lo necesario sin romper el formato intencional.
    """
    # Caracteres que deben escaparse en MarkdownV2
    caracteres = ['_', '[', ']', '(', ')', '~', '`', '>', '#', '+',
                  '-', '=', '|', '{', '}', '.', '!']
    for char in caracteres:
        texto = texto.replace(char, f'\\{char}')
    return texto


def formatear_respuesta(respuesta: str, fuentes: list[str]) -> str:
    """
    Formatea la respuesta para Telegram usando MarkdownV2.
    Limpia duplicados de fuentes y aplica formato limpio.
    """
    # Limpiar sección de fuentes si Claude ya la incluyó en la respuesta
    lineas = respuesta.split('\n')
    lineas_limpias = []
    omitir = False
    for linea in lineas:
        linea_lower = linea.lower().strip()
        if any(x in linea_lower for x in [
            'fuentes consultadas', 'fuente consultada',
            '📚', 'según el documento', 'de acuerdo con el documento'
        ]):
            omitir = True
        if not omitir:
            lineas_limpias.append(linea)

    respuesta_limpia = '\n'.join(lineas_limpias).strip()

    # Convertir markdown estándar a MarkdownV2 de Telegram
    # Títulos ## → negrita
    import re
    respuesta_limpia = re.sub(r'^#{1,3}\s+(.+)$', r'*\1*', respuesta_limpia, flags=re.MULTILINE)

    # Escapar caracteres especiales EXCEPTO * _ ` [ ]
    chars_escapar = ['(', ')', '~', '>', '+', '=', '|', '{', '}', '.', '!', '-', '#']
    for char in chars_escapar:
        respuesta_limpia = respuesta_limpia.replace(char, f'\\{char}')

    # Agregar fuentes al final de forma limpia
    if fuentes:
        fuentes_unicas = list(dict.fromkeys(fuentes))  # deduplicar manteniendo orden
        fuentes_texto = "\n\n📚 *Fuentes consultadas:*\n"
        for f in fuentes_unicas[:5]:  # máx 5 fuentes
            # Escapar el nombre del archivo
            f_escapado = f.replace('.', '\\.').replace('(', '\\(').replace(')', '\\)')
            fuentes_texto += f"• {f_escapado}\n"
        respuesta_limpia += fuentes_texto

    return respuesta_limpia


async def enviar_con_streaming(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
    pregunta: str,
    historial: list[dict],
) -> dict:
    """
    Simula streaming: envía mensaje de 'escribiendo...',
    obtiene la respuesta completa y actualiza el mensaje.
    python-telegram-bot 20.x soporta streaming real con Claude,
    pero esta versión es más estable para producción.
    """
    # Mensaje placeholder mientras procesa
    mensaje_placeholder = await update.message.reply_text(
        MENSAJE_ESCRIBIENDO,
        parse_mode=ParseMode.MARKDOWN_V2
    )

    # Obtener respuesta del RAG
    resultado = rag_chain.consultar(
        pregunta=pregunta,
        historial=historial,
    )

    respuesta   = resultado["respuesta"]
    fuentes     = resultado["fuentes"]
    es_crisis   = resultado["mensaje_crisis"]
    id_consulta = resultado["id_consulta"]

    # Formatear respuesta
    texto_formateado = formatear_respuesta(respuesta, fuentes)

    # Dividir si supera límite de Telegram (4096 chars)
    MAX_LEN = 4000
    partes  = []
    while len(texto_formateado) > MAX_LEN:
        corte = texto_formateado[:MAX_LEN].rfind('\n')
        if corte == -1:
            corte = MAX_LEN
        partes.append(texto_formateado[:corte])
        texto_formateado = texto_formateado[corte:].strip()
    partes.append(texto_formateado)

    # Actualizar el placeholder con la primera parte
    try:
        await mensaje_placeholder.edit_text(
            partes[0],
            parse_mode=ParseMode.MARKDOWN_V2
        )
    except Exception:
        # Si falla el formato, enviar como texto plano
        await mensaje_placeholder.edit_text(partes[0])

    # Enviar partes adicionales si las hay
    for parte in partes[1:]:
        try:
            await update.message.reply_text(
                parte,
                parse_mode=ParseMode.MARKDOWN_V2
            )
        except Exception:
            await update.message.reply_text(parte)

    return {
        "id_consulta": id_consulta,
        "respuesta":   respuesta,
        "es_crisis":   es_crisis,
    }


# ─────────────────────────────────────────────
# HANDLERS
# ─────────────────────────────────────────────

async def comando_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    historiales[chat_id] = []
    await update.message.reply_text(
        MENSAJE_BIENVENIDA,
        parse_mode=ParseMode.MARKDOWN_V2
    )


async def comando_ayuda(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        MENSAJE_AYUDA,
        parse_mode=ParseMode.MARKDOWN_V2
    )


async def comando_limpiar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    historiales[chat_id] = []
    await update.message.reply_text("✅ Historial limpiado\\. Puedes hacer una nueva consulta\\.",
                                    parse_mode=ParseMode.MARKDOWN_V2)


async def manejar_mensaje(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id  = update.effective_chat.id
    pregunta = update.message.text.strip()

    if not pregunta:
        return

    await context.bot.send_chat_action(chat_id=chat_id, action="typing")

    historial = historiales.get(chat_id, [])

    try:
        resultado = await enviar_con_streaming(update, context, pregunta, historial)

        id_consulta = resultado["id_consulta"]
        respuesta   = resultado["respuesta"]
        es_crisis   = resultado["es_crisis"]

        # Si es crisis, enviar mensaje de emergencia adicional
        if es_crisis:
            await update.message.reply_text(
                MENSAJE_CRISIS,
                parse_mode=ParseMode.MARKDOWN_V2
            )

        # Botones de feedback
        keyboard = [[
            InlineKeyboardButton("👍 Útil",    callback_data=f"util:{id_consulta}"),
            InlineKeyboardButton("👎 No útil", callback_data=f"noutil:{id_consulta}"),
        ]]
        await update.message.reply_text(
            "¿Esta respuesta fue útil?",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

        # Actualizar historial
        historial.append({"rol": "usuario",   "contenido": pregunta})
        historial.append({"rol": "asistente", "contenido": respuesta})
        historiales[chat_id] = historial[-20:]

    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")
        await update.message.reply_text(
            "⚠️ Ocurrió un error procesando tu consulta\\. "
            "Por favor intenta de nuevo en unos segundos\\.",
            parse_mode=ParseMode.MARKDOWN_V2
        )


async def manejar_feedback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    partes      = query.data.split(":", 1)
    accion      = partes[0]
    id_consulta = partes[1] if len(partes) > 1 else "desconocido"
    util        = accion == "util"

    logger.info(f"Feedback Telegram | id={id_consulta} | util={util}")

    emoji   = "👍" if util else "👎"
    mensaje = "¡Gracias por tu feedback\\!" if util else "Gracias, tomaremos nota para mejorar\\."
    await query.edit_message_text(
        f"{emoji} {mensaje}",
        parse_mode=ParseMode.MARKDOWN_V2
    )


async def manejar_error(update: object, context: ContextTypes.DEFAULT_TYPE):
    logger.error(f"Error en el bot: {context.error}")


# ─────────────────────────────────────────────
# PUNTO DE ENTRADA
# ─────────────────────────────────────────────

def crear_aplicacion() -> Application:
    if not TELEGRAM_BOT_TOKEN:
        raise EnvironmentError(
            "❌ No se encontró TELEGRAM_BOT_TOKEN en las variables de entorno."
        )
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start",   comando_start))
    app.add_handler(CommandHandler("ayuda",   comando_ayuda))
    app.add_handler(CommandHandler("limpiar", comando_limpiar))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, manejar_mensaje))
    app.add_handler(CallbackQueryHandler(manejar_feedback))
    app.add_error_handler(manejar_error)
    return app

def main():
    print("=" * 50)
    print("  BOT TELEGRAM — Observatorio Sanitario Caldas")
    print("=" * 50)
    print("  Iniciando en modo polling...")
    print("  Presiona Ctrl+C para detener\n")
    app = crear_aplicacion()
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()