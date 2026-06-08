using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Observatorio.Application.Analytics.DTOs;
using Observatorio.Application.Analytics.Interfaces;
using Observatorio.Application.Common.DTOs;
using Observatorio.Application.Common.Interfaces;
using System.Text;

namespace Observatorio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize] 
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly IExportService _exportService;

    private readonly ILogger<AnalyticsController> _logger;
    public AnalyticsController(IAnalyticsService analyticsService, IExportService exportService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService ?? throw new ArgumentNullException(nameof(analyticsService));
        _exportService = exportService ?? throw new ArgumentNullException(nameof(exportService));
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
    /// Permite descargar en Excel o CSV la distribución de hospitalización por municipio para un año específico
    /// </summary>
    

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
    /// Permite descargar en Excel o CSV la tendencia temporal de eventos por mes para un año
    /// </summary>  
    [HttpGet("tendencia-temporal/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetTendenciaTemporalExcel([FromQuery] int anio, CancellationToken cancelToken)
    {
        if (anio < 1900 || anio > DateTime.Now.Year)
            return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });

        var result = await _analyticsService.GetTendenciaTemporalAsync(anio, cancelToken);
        
        var datos = result.Series ?? new List<TendenciaTemporalRegistroDto>();

        var excel = _exportService.GenerarExcel(datos, $"Tendencia Temporal {anio}");
        var fileName = $"TendenciaTemporal_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
    [HttpGet("tendencia-temporal/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetTendenciaTemporalCsv([FromQuery] int anio, CancellationToken cancelToken)
    {
        if (anio < 1900 || anio > DateTime.Now.Year)
            return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });

        var result = await _analyticsService.GetTendenciaTemporalAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.Select(s => new RegistroAplanadoDto
        {
            Codigo = s.Anio.ToString(),
            Nombre = s.NombreMes ?? "",
            Categoria = s.NombreMes ?? "",
            Subcategoria = $"Mes {s.Mes}",
            Valor1 = s.TotalEventos,
            Valor2 = s.Hospitalizados,
            Porcentaje1 = Math.Round(s.PorcentajeEventos, 2),
            Porcentaje2 = Math.Round(s.PorcentajeHospitalizados, 2),
            Periodo = s.Anio.ToString()
        }).ToList() ?? new List<RegistroAplanadoDto>();

        var csv = _exportService.GenerarCsv(datosPlanos);
        var fileName = $"TendenciaTemporal_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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

    /// <summary>
    /// Permite descargar en Excel o CSV la tendencia temporal de eventos por mes y municipio para un año específico (opcional: mes específico)
    /// </summary>

    [HttpGet("tendencia-temporal-municipio/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetTendenciaTemporalMunicipioExcel(
        [FromQuery] int anio, 
        [FromQuery] int? mes, 
        CancellationToken cancelToken)
    {
        // Validaciones...
        var result = await _analyticsService.GetTendenciaTemporalMunicipioAsync(anio, mes, cancelToken);
        
        var periodo = mes.HasValue ? $"{anio}-{mes:D2}" : $"{anio}";
        
        var datosPlanos = result.Series.SelectMany(s => s.Datos.Select(d => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = d.NombreMes ?? "",
            Subcategoria = $"Mes {d.Mes}",
            Valor1 = d.TotalEventos,
            Valor2 = d.Hospitalizados,
            Porcentaje1 = Math.Round(d.PorcentajeEventos, 2), // Redondear a 2 decimales para el Excel
            Porcentaje2 = Math.Round(d.PorcentajeHospitalizados, 2), // Redondear a 2 decimales para el Excel
            Periodo = periodo
        })).ToList();

        var excel = _exportService.GenerarExcel(datosPlanos, $"Tendencia {periodo}");
        var fileName = $"TendenciaTemporalMunicipio_{periodo}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("tendencia-temporal-municipio/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetTendenciaTemporalMunicipioCsv(
        [FromQuery] int anio, 
        [FromQuery] int? mes, 
        CancellationToken cancelToken)
    {
        // Validaciones...
        var result = await _analyticsService.GetTendenciaTemporalMunicipioAsync(anio, mes, cancelToken);
        
        var periodo = mes.HasValue ? $"{anio}-{mes:D2}" : $"{anio}";
        
        var datosPlanos = result.Series.SelectMany(s => s.Datos.Select(d => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = d.NombreMes ?? "",
            Subcategoria = $"Mes {d.Mes}",
            Valor1 = d.TotalEventos,
            Valor2 = d.Hospitalizados,
            Porcentaje1 = Math.Round(d.PorcentajeEventos, 2), // Redondear a 2 decimales para el CSV
            Porcentaje2 = Math.Round(d.PorcentajeHospitalizados, 2), // Redondear a 2 decimales para el CSV
            Periodo = periodo
        })).ToList();

        var csv = _exportService.GenerarCsv(datosPlanos);
        var fileName = $"TendenciaTemporalMunicipio_{periodo}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
    }
    
    /// <summary>
    /// Obtiene distribución geográfica de casos con filtros dinámicos para el mapa
    /// </summary>
    [HttpGet("distribucion-geografica")]
    [ProducesResponseType(typeof(List<DistribucionGeograficaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDistribucionGeografica(
        [FromQuery] string? municipio,
        [FromQuery] string? rangoEdad,
        [FromQuery] string? genero,
        [FromQuery] int? anio,
        [FromQuery] string? hospitalizado)
    {
        var filtros = new FiltrosDistribucionDto
        {
            Municipio = municipio,
            RangoEdad = rangoEdad,
            Genero = genero,
            Anio = anio,
            Hospitalizado = hospitalizado
        };

        var resultado = await _analyticsService.GetDistribucionGeograficaAsync(filtros);
        return Ok(resultado);
    }

    [HttpGet("distribucion-geografica/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDistribucionGeograficaExcel(
        [FromQuery] string? municipio,
        [FromQuery] string? rangoEdad,
        [FromQuery] string? genero,
        [FromQuery] int? anio,
        [FromQuery] string? hospitalizado)
    {
        var filtros = new FiltrosDistribucionDto
        {
            Municipio = municipio,
            RangoEdad = rangoEdad,
            Genero = genero,
            Anio = anio,
            Hospitalizado = hospitalizado
        };

        var datos = await _analyticsService.GetDistribucionGeograficaAsync(filtros);
        
        var excel = _exportService.GenerarExcel(datos, "Distribución Geográfica");
        var fileName = $"DistribucionGeografica_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("distribucion-geografica/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDistribucionGeograficaCsv(
        [FromQuery] string? municipio,
        [FromQuery] string? rangoEdad,
        [FromQuery] string? genero,
        [FromQuery] int? anio,
        [FromQuery] string? hospitalizado)
    {
        var filtros = new FiltrosDistribucionDto
        {
            Municipio = municipio,
            RangoEdad = rangoEdad,
            Genero = genero,
            Anio = anio,
            Hospitalizado = hospitalizado
        };

        var datos = await _analyticsService.GetDistribucionGeograficaAsync(filtros);
        
        var csv = _exportService.GenerarCsv(datos);
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        var fileName = $"DistribucionGeografica_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        return File(csvBytes, "text/csv", fileName);
    }



}

