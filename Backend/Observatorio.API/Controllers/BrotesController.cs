using Microsoft.AspNetCore.Mvc;
using Observatorio.Application.Anomalias.Interfaces;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Observatorio.API.Controllers
{
    /// <summary>
    /// API Gateway para consumir microservicios de ML (AI)
    /// Brotes
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class BrotesController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BrotesController> _logger;
        private readonly string _aiBaseUrl;
        private readonly IAnomalasService _anomalasService;

        public BrotesController(
            HttpClient httpClient,
            ILogger<BrotesController> logger,
            string aiBaseUrl,
            IAnomalasService anomalasService)
        {
            _httpClient = httpClient;
            _logger = logger;
            _aiBaseUrl = aiBaseUrl;
            _anomalasService = anomalasService;
        }

        /// <summary>
        /// Predice brotes para un municipio específico o todos
        /// </summary>
        /// <param name="payload">Municipio y meses a predecir</param>
        /// <returns>Predicción de brotes para los meses solicitados</returns>
        [HttpPost("predict")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> PredictBrotes([FromBody] BrotesPayload payload)
        {
            try
            {
                _logger.LogInformation($"Predicción de brotes para municipio: {payload.Municipio ?? "Todos"}");

                var url = $"{_aiBaseUrl}/api/v1/predict/brotes";

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
                    _logger.LogError($"Error en predicción de brotes: {response.StatusCode}");
                    return StatusCode(
                        (int)response.StatusCode,
                        new { error = "Error al predecir brotes", details = await response.Content.ReadAsStringAsync() }
                    );
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Excepción en predicción de brotes: {ex.Message}");
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Predice brotes para el mes actual en todos los municipios
        /// Usado para la matriz de monitoreo del dashboard
        /// </summary>
        /// <returns>Lista de predicciones para todos los municipios</returns>
        [HttpGet("todos")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetBrotesTodos()
        {
            try
            {
                _logger.LogInformation("Obteniendo predicciones de brotes para todos los municipios");

                var url = $"{_aiBaseUrl}/api/v1/predict/brotes/todos";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Error obteniendo brotes de todos: {response.StatusCode}");
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener datos" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Excepción en brotes/todos: {ex.Message}");
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene listado de municipios disponibles para predicción
        /// </summary>
        /// <returns>Lista de municipios</returns>
        [HttpGet("municipios")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetBrotesMunicipios()
        {
            try
            {
                _logger.LogInformation("Obteniendo municipios disponibles");

                var url = $"{_aiBaseUrl}/api/v1/predict/brotes/municipios";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener municipios" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error obteniendo municipios: {ex.Message}");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Obtiene información del modelo de Brotes
        /// Incluye versión, features, parámetros de entrenamiento
        /// </summary>
        /// <returns>Información del modelo</returns>
        [HttpGet("info")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetBrotesInfo()
        {
            try
            {
                _logger.LogInformation("Obteniendo info del modelo Brotes");

                var url = $"{_aiBaseUrl}/api/v1/predict/brotes/model-info";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = "No se pudo obtener información del modelo" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error obteniendo info de Brotes: {ex.Message}");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Obtiene histórico de brotes por municipio
        /// Útil para comparar predicción vs histórico
        /// </summary>
        /// <param name="municipio">Nombre del municipio</param>
        /// <returns>Serie temporal de casos históricos</returns>
        [HttpGet("historico/{municipio}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetBrotesHistorico(string municipio)
        {
            try
            {
                _logger.LogInformation($"Obteniendo histórico de brotes para: {municipio}");

                var url = $"{_aiBaseUrl}/api/v1/predict/brotes/historico/{Uri.EscapeDataString(municipio)}";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = $"Municipio no encontrado: {municipio}" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error obteniendo histórico de Brotes: {ex.Message}");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Obtiene importancia de variables del modelo Brotes
        /// Ordenadas de mayor a menor relevancia
        /// </summary>
        /// <returns>Lista de variables con su importancia</returns>
        [HttpGet("variables-importancia")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetBrotesVariablesImportancia()
        {
            try
            {
                _logger.LogInformation("Obteniendo importancia de variables");

                var url = $"{_aiBaseUrl}/api/v1/predict/brotes/variables-importancia";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener importancia" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error obteniendo importancia: {ex.Message}");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        /// <summary>
        /// Obtiene variación de casos vs mes anterior
        /// Para todos los municipios
        /// </summary>
        /// <returns>Variaciones por municipio</returns>
        [HttpGet("variacion")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetBrotesVariacion()
        {
            try
            {
                _logger.LogInformation("Obteniendo variación de brotes vs mes anterior");

                var url = $"{_aiBaseUrl}/api/v1/predict/brotes/variacion";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = "Error al obtener variación" });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<object>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error obteniendo variación: {ex.Message}");
                return StatusCode(500, new { error = "Error interno" });
            }
        }


        // ── DTOs para Brotes ─────────────────────────────────────────────────────
        public class BrotesPayload
        {
            public string? Municipio { get; set; }
            public int MesesAPredecir { get; set; } = 3;
        }

        

        
    }
}
