using Microsoft.AspNetCore.Mvc;
using Observatorio.Application.Anomalias.Interfaces;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Observatorio.API.Controllers
{
    /// <summary>
    /// Controlador para endpoints relacionados con anomalías en los datos sanitarios
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AnomaliasController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AnomaliasController> _logger;
        private readonly string _aiBaseUrl;
        private readonly IAnomalasService _anomalasService;
        public AnomaliasController(
            HttpClient httpClient,
            ILogger<AnomaliasController> logger,
            string aiBaseUrl,
            IAnomalasService anomalasService)
        {
            _httpClient = httpClient;
            _logger = logger;
            _aiBaseUrl = aiBaseUrl;
            _anomalasService = anomalasService;
        }

        /// <summary>
        /// Predice anomalías para un evento específico
        /// </summary>
        [HttpPost("detectar")]
        public async Task<IActionResult> PredictAnomalias([FromBody] AnomalíasPayload payload)
        {
            try
            {
                _logger.LogInformation($"Detección de anomalías para evento: {payload.Entidad}");

                var url = $"{_aiBaseUrl}/api/v1/predict/anomalias";

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload, options),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Error en detección de anomalías: {response.StatusCode}");
                    return StatusCode(
                        (int)response.StatusCode,
                        new { error = "Error al detectar anomalías", details = await response.Content.ReadAsStringAsync() }
                    );
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Excepción en detección de anomalías: {ex.Message}");
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }


        /// <summary>
        /// Obtiene información del modelo de Anomalías
        /// </summary>
        [HttpGet("info")]
        public async Task<IActionResult> GetAnomalíasInfo()
        {
            try
            {
                var url = $"{_aiBaseUrl}/api/v1/predict/anomalias/model-info";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = "No se pudo obtener información del modelo Anomalías" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error obteniendo info de Anomalías: {ex.Message}");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Detecta incrementos anómalos en la cantidad de intentos por municipio
        /// Compara últimos 30 días vs promedio histórico (12 meses previos)
        /// </summary>
        /// <param name="anio">Año del análisis (opcional, usa año actual)</param>
        /// <param name="umbralPorcentaje">Umbral de porcentaje para alertar (opcional, default 50%)</param>
        /// <param name="cancelToken">Token de cancelación</param>
        /// <returns>Municipios con incrementos anómalos detectados</returns>
        [HttpGet("incrementos")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetIncrementosAnomalos(
            [FromQuery] int? anio = null,
            [FromQuery] decimal? umbralPorcentaje = null,
            CancellationToken cancelToken = default)
        {
            try
            {
                _logger.LogInformation(
                    $"Detectando incrementos anómalos - Año: {anio ?? DateTime.Now.Year}, Umbral: {umbralPorcentaje ?? 50}%");

                var resultado = await _anomalasService.GetIncrementosAnomalosAsync(
                    anio, umbralPorcentaje, cancelToken);

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error en detección de anomalías: {ex.Message}");
                return StatusCode(500, new { error = "Error al detectar anomalías", details = ex.Message });
            }
        }

        // ── DTOs para Anomalías ──────────────────────────────────────────────────
        public class AnomalíasPayload
        {
            public string Entidad { get; set; } = "";
            public DateTime Fecha { get; set; } = DateTime.Now;
            public Dictionary<string, object> Medidas { get; set; } = new();
        }
    }
}