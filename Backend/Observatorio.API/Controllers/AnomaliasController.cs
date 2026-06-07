using Microsoft.AspNetCore.Mvc;
using Observatorio.Application.Anomalias.DTOs;
using Observatorio.Application.Anomalias.Interfaces;

namespace Observatorio.API.Controllers
{
    /// <summary>
    /// API Gateway para consumir microservicios de ML (AI)
    /// Anomalías
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AnomaliasController : ControllerBase
    {
        private readonly IAnomaliaService _anomaliaService;
        private readonly ILogger<AnomaliasController> _logger;

        public AnomaliasController(
            IAnomaliaService anomaliaService,
            ILogger<AnomaliasController> logger)
        {
            _anomaliaService = anomaliaService;
            _logger = logger;
        }

        /// <summary>
        /// Detecta si un caso individual es una anomalía
        /// </summary>
        [HttpPost("detect")]
        [ProducesResponseType(typeof(AnomaliaResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> DetectarAnomalia([FromBody] AnomaliaPayloadDto payload)
        {
            try
            {
                var result = await _anomaliaService.DetectarAnomaliaAsync(payload);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error de comunicación con FastAPI");
                return StatusCode(502, new { error = "Error de comunicación con servicio de ML", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detectando anomalía");
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Lista anomalías detectadas con filtros opcionales
        /// </summary>
        [HttpGet("listado")]
        [ProducesResponseType(typeof(AnomaliaListResponseDto), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> ListarAnomalias(
            [FromQuery] string? tipo = null,
            [FromQuery] string? severidad = null,
            [FromQuery] string? categoria = null,
            [FromQuery] int limite = 50,
            [FromQuery] int offset = 0)
        {
            try
            {
                var result = await _anomaliaService.ListarAnomaliasAsync(tipo, severidad, categoria, limite, offset);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listando anomalías");
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el detalle de una anomalía específica
        /// </summary>
        [HttpGet("detalle/{idRegistro}")]
        [ProducesResponseType(typeof(AnomaliaDetalleCompletoDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAnomaliaDetalle(int idRegistro)
        {
            try
            {
                var result = await _anomaliaService.ObtenerDetalleAsync(idRegistro);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Anomalía {idRegistro} no encontrada" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo detalle de anomalía {IdRegistro}", idRegistro);
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene la distribución de anomalías por tipo (para gráficos)
        /// </summary>
        [HttpGet("distribucion")]
        [ProducesResponseType(typeof(AnomaliaDistribucionDto), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAnomaliasDistribucion()
        {
            try
            {
                var result = await _anomaliaService.ObtenerDistribucionAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo distribución");
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene información del modelo (métricas, confiabilidad, CV)
        /// </summary>
        [HttpGet("info")]
        [ProducesResponseType(typeof(AnomaliaModelInfoDto), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAnomaliasInfo()
        {
            try
            {
                var result = await _anomaliaService.ObtenerInfoModeloAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo info del modelo");
                return StatusCode(500, new { error = "Error interno", details = ex.Message });
            }
        }
    }
}