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

    /// <summary>
    /// Obtiene datos de la vista de distribución por género
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de la vista</returns>
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

    /// <summary>
    /// Obtiene datos de la vista de distribución por grupo etario
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de la vista</returns>
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
    /// Obtiene datos de la vista de hospitalización
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de hospitalización (1=Hospitalizado, 0=No Hospitalizado)</returns>
    
    [HttpGet("vista-hospitalizacion")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDataFromVistaHospitalizacion(CancellationToken cancelToken)
    {
        try
        {
            _logger.LogInformation("Consultando vista de hospitalización");
            var result = await _analyticsService.GetDataFromVistaHospitalizacionAsync(cancelToken);
            _logger.LogInformation("Datos de hospitalización obtenidos exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar la vista de hospitalización");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene casos por municipio para un año específico (para mapa de calor)
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con casos distribuidos por municipio con código DANE</returns>
    [HttpGet("casos-por-municipio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetCasosPorMunicipio([FromQuery] int anio, CancellationToken cancelToken)
    {
        try
        {
            if (anio < 1900 || anio > DateTime.Now.Year)
            {
                return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });
            }

            _logger.LogInformation("Consultando casos por municipio para el año {anio}", anio);
            var result = await _analyticsService.GetCasosPorMunicipioAsync(anio, cancelToken);
            _logger.LogInformation("Casos por municipio obtenidos exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar casos por municipio");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene distribución de género por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de género por municipio</returns>
    [HttpGet("distribucion-genero-municipio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDistribucionGeneroMunicipio([FromQuery] int anio, CancellationToken cancelToken)
    {
        try
        {
            if (anio < 1900 || anio > DateTime.Now.Year)
            {
                return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });
            }

            _logger.LogInformation("Consultando distribución de género por municipio para el año {anio}", anio);
            var result = await _analyticsService.GetDistribucionGeneroMunicipioAsync(anio, cancelToken);
            _logger.LogInformation("Distribución de género por municipio obtenida exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar distribución de género por municipio");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene distribución de grupo etario por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de grupo etario por municipio</returns>
    [HttpGet("distribucion-grupo-etario-municipio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDistribucionGrupoEtarioMunicipio([FromQuery] int anio, CancellationToken cancelToken)
    {
        try
        {
            if (anio < 1900 || anio > DateTime.Now.Year)
            {
                return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });
            }

            _logger.LogInformation("Consultando distribución de grupo etario por municipio para el año {anio}", anio);
            var result = await _analyticsService.GetDistribucionGrupoEtarioMunicipioAsync(anio, cancelToken);
            _logger.LogInformation("Distribución de grupo etario por municipio obtenida exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar distribución de grupo etario por municipio");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene distribución de métodos por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de métodos por municipio</returns>
    [HttpGet("distribucion-metodos-municipio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDistribucionMetodosMunicipio([FromQuery] int anio, CancellationToken cancelToken)
    {
        try
        {
            if (anio < 1900 || anio > DateTime.Now.Year)
            {
                return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });
            }

            _logger.LogInformation("Consultando distribución de métodos por municipio para el año {anio}", anio);
            var result = await _analyticsService.GetDistribucionMetodosMunicipioAsync(anio, cancelToken);
            _logger.LogInformation("Distribución de métodos por municipio obtenida exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar distribución de métodos por municipio");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene distribución de hospitalización por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de hospitalización por municipio</returns>
    [HttpGet("distribucion-hospitalizacion-municipio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDistribucionHospitalizacionMunicipio([FromQuery] int anio, CancellationToken cancelToken)
    {
        try
        {
            if (anio < 1900 || anio > DateTime.Now.Year)
            {
                return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });
            }

            _logger.LogInformation("Consultando distribución de hospitalización por municipio para el año {anio}", anio);
            var result = await _analyticsService.GetDistribucionHospitalizacionMunicipioAsync(anio, cancelToken);
            _logger.LogInformation("Distribución de hospitalización por municipio obtenida exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar distribución de hospitalización por municipio");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene tendencia temporal de eventos por mes para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con tendencia temporal de eventos y hospitalizados por mes</returns>
    [HttpGet("tendencia-temporal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTendenciaTemporalAsync([FromQuery] int anio, CancellationToken cancelToken)
    {
        try
        {
            if (anio < 1900 || anio > DateTime.Now.Year)
            {
                return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });
            }

            _logger.LogInformation("Consultando tendencia temporal para el año {anio}", anio);
            var result = await _analyticsService.GetTendenciaTemporalAsync(anio, cancelToken);
            _logger.LogInformation("Tendencia temporal obtenida exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar tendencia temporal");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene tendencia temporal de eventos por mes y municipio para un año específico (opcional: mes específico)
    /// </summary>
    /// <param name="anio">Año de los eventos (requerido)</param>
    /// <param name="mes">Mes opcional (1-12). Si no se proporciona, devuelve todos los meses</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con tendencia temporal de eventos y hospitalizados por mes y municipio</returns>
    [HttpGet("tendencia-temporal-municipio")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTendenciaTemporalMunicipioAsync([FromQuery] int anio, [FromQuery] int? mes, CancellationToken cancelToken)
    {
        try
        {
            if (anio < 1900 || anio > DateTime.Now.Year)
            {
                return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });
            }

            if (mes.HasValue && (mes < 1 || mes > 12))
            {
                return BadRequest(new { message = "Mes inválido", error = "El mes debe estar entre 1 y 12" });
            }

            var mesDesc = mes.HasValue ? mes.ToString() : "todos los meses";
            _logger.LogInformation("Consultando tendencia temporal por municipio para el año {anio}, mes: {mes}", anio, mesDesc);
            var result = await _analyticsService.GetTendenciaTemporalMunicipioAsync(anio, mes, cancelToken);
            _logger.LogInformation("Tendencia temporal por municipio obtenida exitosamente");
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogError(ex, "Error de validación en tendencia temporal por municipio");
            return BadRequest(new { message = "Error de validación", error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar tendencia temporal por municipio");
            return BadRequest(new { message = "Error al obtener la analítica", error = ex.Message });
        }
    }

}

