using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Observatorio.API.Controllers
{
    /// <summary>
    /// API Gateway para consumir microservicios de ML (AI)
    /// Demanda Hospitalaria
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DemandaController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<DemandaController> _logger;
        private readonly string _aiBaseUrl;

        private static readonly JsonSerializerOptions SnakeCaseOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
        };

        public DemandaController(
            HttpClient httpClient,
            ILogger<DemandaController> logger,
            string aiBaseUrl)
        {
            _httpClient = httpClient;
            _logger = logger;
            _aiBaseUrl = aiBaseUrl;
        }

        /// <summary>
        /// Predice hospitalizaciones mensuales para un municipio.
        /// Devuelve N meses de forecast + perfil histórico + variacion_pct.
        /// </summary>
        [HttpPost("predict")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> PredictDemanda([FromBody] DemandaPayload payload)
        {
            try
            {
                _logger.LogInformation("Predicción de demanda para municipio: {Municipio}", payload.Municipio);

                var url = $"{_aiBaseUrl}/api/v1/predict/demanda";

                var content = new StringContent(
                    JsonSerializer.Serialize(payload, SnakeCaseOptions),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Error en predicción de demanda: {StatusCode}", response.StatusCode);
                    return StatusCode(
                        (int)response.StatusCode,
                        new { error = "Error al predecir demanda", details = await response.Content.ReadAsStringAsync() }
                    );
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result, SnakeCaseOptions));
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError("Error de comunicación con FastAPI: {Message}", ex.Message);
                return StatusCode(502, new { error = "Error de comunicación con servicio de ML", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError("Excepción en predicción de demanda: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Lista todos los municipios disponibles en el modelo de demanda.
        /// </summary>
        [HttpGet("municipios")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetMunicipios()
        {
            try
            {
                _logger.LogInformation("Obteniendo municipios disponibles para demanda");

                var url = $"{_aiBaseUrl}/api/v1/predict/demanda/municipios";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener municipios" });

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result, SnakeCaseOptions));
            }
            catch (Exception ex)
            {
                _logger.LogError("Error obteniendo municipios de demanda: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Top 5 municipios con mayor demanda hospitalaria proyectada para el próximo mes.
        /// Usado para la sección de ranking del dashboard.
        /// </summary>
        [HttpGet("top5")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetTop5()
        {
            try
            {
                _logger.LogInformation("Obteniendo top 5 municipios por demanda");

                var url = $"{_aiBaseUrl}/api/v1/predict/demanda/top5";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener top 5" });

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result, SnakeCaseOptions));
            }
            catch (Exception ex)
            {
                _logger.LogError("Error obteniendo top 5 de demanda: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Serie histórica de hospitalizaciones para un municipio.
        /// Usada para la línea gris del gráfico de forecast.
        /// </summary>
        [HttpGet("historico/{municipio}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetHistorico(string municipio)
        {
            try
            {
                _logger.LogInformation("Obteniendo histórico de demanda para: {Municipio}", municipio);

                var url = $"{_aiBaseUrl}/api/v1/predict/demanda/historico/{Uri.EscapeDataString(municipio)}";
                var response = await _httpClient.GetAsync(url);

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    return NotFound(new { error = $"Municipio '{municipio}' no encontrado" });

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener histórico" });

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result, SnakeCaseOptions));
            }
            catch (Exception ex)
            {
                _logger.LogError("Error obteniendo histórico de demanda: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Métricas del modelo de demanda (R², RMSE, MAE, F1, precisión de brotes).
        /// </summary>
        [HttpGet("info")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetModelInfo()
        {
            try
            {
                _logger.LogInformation("Obteniendo info del modelo de demanda");

                var url = $"{_aiBaseUrl}/api/v1/predict/demanda/model-info";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener info del modelo" });

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result, SnakeCaseOptions));
            }
            catch (Exception ex)
            {
                _logger.LogError("Error obteniendo info del modelo de demanda: {Message}", ex.Message);
                return StatusCode(500, new { error = "Error interno" });
            }
        }


        // ── DTOs ─────────────────────────────────────────────────────────────────

        public class DemandaPayload
        {
            public string Municipio { get; set; } = string.Empty;
            public int MesesAPredecir { get; set; } = 1;
        }
    }
}
