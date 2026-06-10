using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Observatorio.API.Controllers
{
    /// <summary>
    /// API Gateway para consumir el microservicio de chatbot RAG (AI)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ChatbotController> _logger;
        private readonly string _aiBaseUrl;

        public ChatbotController(
            HttpClient httpClient,
            ILogger<ChatbotController> logger,
            string aiBaseUrl)
        {
            _httpClient = httpClient;
            _logger = logger;
            _aiBaseUrl = aiBaseUrl;
        }

        /// <summary>
        /// Consulta al chatbot RAG sobre normativa, protocolos y guías clínicas
        /// </summary>
        [HttpPost("consulta")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Consultar([FromBody] ConsultaRequest payload)
        {
            try
            {
                _logger.LogInformation("Consulta al chatbot RAG: {Pregunta}", payload.Pregunta);

                var url = $"{_aiBaseUrl}/api/v1/chatbot/consulta";

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload, options),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Error en consulta RAG: {StatusCode}", response.StatusCode);
                    return StatusCode(
                        (int)response.StatusCode,
                        new { error = "Error al consultar el chatbot", details = await response.Content.ReadAsStringAsync() }
                    );
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError("Excepción en consulta RAG: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Registra la calificación del usuario sobre una respuesta del chatbot
        /// </summary>
        [HttpPost("feedback")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> RegistrarFeedback([FromBody] FeedbackRequest payload)
        {
            try
            {
                _logger.LogInformation("Feedback chatbot | id={IdConsulta} | util={Util}", payload.IdConsulta, payload.Util);

                var url = $"{_aiBaseUrl}/api/v1/chatbot/feedback";

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload, options),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Error registrando feedback: {StatusCode}", response.StatusCode);
                    return StatusCode(
                        (int)response.StatusCode,
                        new { error = "Error al registrar feedback", details = await response.Content.ReadAsStringAsync() }
                    );
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError("Excepción en feedback chatbot: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Genera un resumen ejecutivo narrativo combinando datos del modelo predictivo
        /// con contexto normativo del RAG
        /// </summary>
        [HttpPost("resumen-ejecutivo")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GenerarResumen([FromBody] ResumenEjecutivoRequest payload)
        {
            try
            {
                _logger.LogInformation("Generando resumen ejecutivo para municipio: {Municipio}", payload.Municipio);

                var url = $"{_aiBaseUrl}/api/v1/chatbot/resumen-ejecutivo";

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload, options),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Error generando resumen ejecutivo: {StatusCode}", response.StatusCode);
                    return StatusCode(
                        (int)response.StatusCode,
                        new { error = "Error al generar resumen ejecutivo", details = await response.Content.ReadAsStringAsync() }
                    );
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError("Excepción en resumen ejecutivo: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Verifica que el servicio de chatbot RAG está operativo
        /// </summary>
        [HttpGet("health")]
        [ProducesResponseType(200)]
        [ProducesResponseType(503)]
        public async Task<IActionResult> Health()
        {
            try
            {
                _logger.LogInformation("Verificando estado del chatbot RAG");

                var url = $"{_aiBaseUrl}/api/v1/chatbot/health";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = "Chatbot RAG no disponible" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError("Error verificando salud del chatbot: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno" });
            }
        }


        // ── DTOs para Chatbot ─────────────────────────────────────────────────────

        public class MensajeHistorial
        {
            public string Rol { get; set; } = string.Empty;
            public string Contenido { get; set; } = string.Empty;
        }

        public class ConsultaRequest
        {
            public string Pregunta { get; set; } = string.Empty;
            public List<MensajeHistorial> Historial { get; set; } = new();
        }

        public class FeedbackRequest
        {
            public string IdConsulta { get; set; } = string.Empty;
            public bool Util { get; set; }
            public string? Comentario { get; set; }
        }

        public class ResumenEjecutivoRequest
        {
            public string Municipio { get; set; } = string.Empty;
            public string Periodo { get; set; } = string.Empty;
            public string? NivelAlerta { get; set; }
            public int? CasosPredichos { get; set; }
            public float? VariacionPorcentual { get; set; }
        }
    }
}
