using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Observatorio.Application.Analytics.Interfaces;

namespace Observatorio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
//! [Authorize] // Comentar temporalmente para pruebas, se puede reactivar luego
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService ?? throw new ArgumentNullException(nameof(analyticsService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("vista-distribucion-genero")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDataFromVista(CancellationToken cancelToken)
    {
        try
        {
            _logger.LogInformation("Consultando vista de distribución por género");
            var result = await _analyticsService.GetDataFromVistaAsync(cancelToken);
            _logger.LogInformation("Datos obtenidos exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar la vista de distribución por género");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    [HttpGet("vista-distribucion-grupo-etario")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDataFromVistaGrupoEtario(CancellationToken cancelToken)
    {
        try
        {
            _logger.LogInformation("Consultando vista de distribución por grupo etario");
            var result = await _analyticsService.GetDataFromVistaGrupoEtarioAsync(cancelToken);
            _logger.LogInformation("Datos obtenidos exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar la vista de distribución por grupo etario");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene datos de la vista de métodos más usados en eventos
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de la vista</returns>
    [HttpGet("vista-metodos-mas-usados")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDataFromVistaMetodosMasUsados(CancellationToken cancelToken)
    {
        try
        {
            _logger.LogInformation("Consultando vista de métodos más usados en eventos");
            var result = await _analyticsService.GetDataFromVistaMetodosMasUsadosAsync(cancelToken);
            _logger.LogInformation("Datos obtenidos exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar la vista de métodos más usados en eventos");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene la tendencia de eventos agrupada por año/mes
    /// </summary>
    /// <param name="anio">Año específico (opcional)</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Series agrupadas por año/mes</returns>
    [HttpGet("time-series/by-year")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTimeSeriesByYear([FromQuery] int? anio, CancellationToken cancelToken)
    {
        try
        {
            _logger.LogInformation("Obteniendo series por año. Año: {Anio}", anio);
            
            var result = await _analyticsService.GetTimeSeriesByYearAsync(anio, cancelToken);
            
            _logger.LogInformation("Series por año obtenidas exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener las series por año");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene la tendencia de eventos con agrupación dinámica según rango de fechas
    /// - ≤ 90 días: agrupa por día
    /// - 91-365 días: agrupa por mes
    /// - > 365 días: agrupa por año
    /// </summary>
    /// <param name="fechaInicio">Fecha inicio en formato ISO (YYYY-MM-DD)</param>
    /// <param name="fechaFin">Fecha fin en formato ISO (YYYY-MM-DD)</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Series con tipo de agrupación dinámico</returns>
    [HttpGet("time-series/by-date-range")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTimeSeriesByDateRange(
        [FromQuery] DateTime fechaInicio,
        [FromQuery] DateTime fechaFin,
        CancellationToken cancelToken)
    {
        try
        {
            if (fechaFin < fechaInicio)
            {
                return BadRequest(new { message = "La fecha de fin no puede ser menor que la fecha de inicio" });
            }

            _logger.LogInformation("Obteniendo series por rango de fechas: {FechaInicio} - {FechaFin}", 
                fechaInicio, fechaFin);
            
            var result = await _analyticsService.GetTimeSeriesByDateRangeAsync(fechaInicio, fechaFin, cancelToken);
            
            _logger.LogInformation("Series por rango de fechas obtenidas exitosamente. Agrupación: {Agrupacion}", result.Agrupacion);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener las series por rango de fechas");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }
}
