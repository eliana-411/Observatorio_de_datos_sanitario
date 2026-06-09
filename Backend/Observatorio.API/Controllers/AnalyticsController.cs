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
    /// Permite descargar en Excel o CSV los datos de la vista de distribución por género
    /// </summary>
    [HttpGet("vista-distribucion-genero/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDataFromVistaDistribucionGeneroExcel(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaDistribucionGeneroDto>();

        var excel = _exportService.GenerarExcel(datos, "DistribucionGenero");
        var fileName = $"VistaDistribucionGenero_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("vista-distribucion-genero/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDataFromVistaDistribucionGeneroCsv(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaDistribucionGeneroDto>();

        var csv = _exportService.GenerarCsv(datos);
        var fileName = $"VistaDistribucionGenero_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    /// Permite descargar en Excel o CSV los datos de la vista de distribución por grupo etario
    /// </summary>
    [HttpGet("vista-grupo-etario/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDataFromVistaGrupoEtarioExcel(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaGrupoEtarioAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaDistribucionGrupoEtarioDto>();

        var excel = _exportService.GenerarExcel(datos, "GrupoEtario");
        var fileName = $"VistaGrupoEtario_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("vista-grupo-etario/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDataFromVistaGrupoEtarioCsv(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaGrupoEtarioAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaDistribucionGrupoEtarioDto>();

        var csv = _exportService.GenerarCsv(datos);
        var fileName = $"VistaGrupoEtario_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    /// Permite descargar en Excel o CSV los datos de la vista de distribución por género
    /// </summary>
    [HttpGet("vista-metodos-mas-usados/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDataFromVistaMetodosMasUsadosExcel(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaMetodosMasUsadosAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaMetodosMasUsadosDto>();

        var excel = _exportService.GenerarExcel(datos, "Metodos");
        var fileName = $"VistaMetodosMasUsados_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("vista-metodos-mas-usados/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDataFromVistaMetodosMasUsadosCsv(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaMetodosMasUsadosAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaMetodosMasUsadosDto>();

        var csv = _exportService.GenerarCsv(datos);
        var fileName = $"VistaMetodosMasUsados_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    /// Permite descargar en Excel o CSV los datos de la vista de hospitalización
    /// </summary>
    [HttpGet("vista-hospitalizacion/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDataFromVistaHospitalizacionExcel(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaHospitalizacionAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaHospitalizacionDto>();

        var excel = _exportService.GenerarExcel(datos, "Hospitalizacion");
        var fileName = $"VistaHospitalizacion_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("vista-hospitalizacion/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDataFromVistaHospitalizacionCsv(CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDataFromVistaHospitalizacionAsync(cancelToken);
        
        var datos = result.Data ?? new List<VistaHospitalizacionDto>();

        var csv = _exportService.GenerarCsv(datos);
        var fileName = $"VistaHospitalizacion_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    /// Permite descargar en Excel o CSV los casos por municipio para un año específico (para mapa de calor)
    /// </summary>
    [HttpGet("casos-por-municipio/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetCasosPorMunicipioExcel([FromQuery] int anio, CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetCasosPorMunicipioAsync(anio, cancelToken);
        
        var datos = result.Series ?? new List<CasosPorMunicipioRegistroDto>();

        // Redondear porcentajes antes de exportar (opcional, si quieres 2 decimales)
        foreach (var d in datos)
        {
            d.Porcentaje = Math.Round(d.Porcentaje, 2);
        }

        var excel = _exportService.GenerarExcel(datos, $"Casos {anio}");
        var fileName = $"CasosPorMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("casos-por-municipio/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetCasosPorMunicipioCsv([FromQuery] int anio, CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetCasosPorMunicipioAsync(anio, cancelToken);
        
        var datos = result.Series ?? new List<CasosPorMunicipioRegistroDto>();

        foreach (var d in datos)
        {
            d.Porcentaje = Math.Round(d.Porcentaje, 2);
        }

        var csv = _exportService.GenerarCsv(datos);
        var fileName = $"CasosPorMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    /// Permite descargar en Excel o CSV la distribución de género por municipio para un año específico
    /// </summary>
    [HttpGet("distribucion-genero-municipio/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDistribucionGeneroMunicipioExcel([FromQuery] int anio, CancellationToken cancelToken)
    {
        if (anio < 1900 || anio > DateTime.Now.Year)
            return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });

        var result = await _analyticsService.GetDistribucionGeneroMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.Generos.Select(g => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = g.Genero,                     // "Femenino", "Masculino"
            Valor1 = g.Total,
            Valor2 = s.TotalEventos,                   // Total del municipio para contexto
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)g.Total / s.TotalEventos * 100 : 0, 2),
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Género" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2", "Subcategoria" };

        var excel = _exportService.GenerarExcel(datosPlanos, $"Genero {anio}", headers, excluir);
        var fileName = $"DistribucionGeneroMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("distribucion-genero-municipio/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDistribucionGeneroMunicipioCsv([FromQuery] int anio, CancellationToken cancelToken)
    {
        if (anio < 1900 || anio > DateTime.Now.Year)
            return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });

        var result = await _analyticsService.GetDistribucionGeneroMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.Generos.Select(g => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = g.Genero,
            Valor1 = g.Total,
            Valor2 = s.TotalEventos,
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)g.Total / s.TotalEventos * 100 : 0, 2),
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Género" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2", "Subcategoria" };

        var csv = _exportService.GenerarCsv(datosPlanos, headers, excluir);
        var fileName = $"DistribucionGeneroMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    /// Permite descargar en Excel o CSV la distribución de grupo etario por municipio para un año específico
    /// </summary>
    [HttpGet("distribucion-grupo-etario-municipio/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDistribucionGrupoEtarioMunicipioExcel([FromQuery] int anio, CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDistribucionGrupoEtarioMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.GruposEtarios.Select(g => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = g.GrupoEtario,              // "Adulto", "Adulto Mayor", "Joven", "Adolescente"
            Valor1 = g.Total,
            Valor2 = s.TotalEventos,                  // Total del municipio para contexto
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)g.Total / s.TotalEventos * 100 : 0, 2),
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Grupo Etario" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2", "Subcategoria" };

        var excel = _exportService.GenerarExcel(datosPlanos, $"GrupoEtario {anio}", headers, excluir);
        var fileName = $"DistribucionGrupoEtarioMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("distribucion-grupo-etario-municipio/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDistribucionGrupoEtarioMunicipioCsv([FromQuery] int anio, CancellationToken cancelToken)
    {
        if (anio < 1900 || anio > DateTime.Now.Year)
            return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });

        var result = await _analyticsService.GetDistribucionGrupoEtarioMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.GruposEtarios.Select(g => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = g.GrupoEtario,
            Valor1 = g.Total,
            Valor2 = s.TotalEventos,
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)g.Total / s.TotalEventos * 100 : 0, 2),
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Grupo Etario" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2", "Subcategoria" };

        var csv = _exportService.GenerarCsv(datosPlanos, headers, excluir);
        var fileName = $"DistribucionGrupoEtarioMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    /// Permite descargar en Excel o CSV la distribución de métodos por municipio para un año específico
    /// </summary>
    [HttpGet("distribucion-metodos-municipio/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDistribucionMetodosMunicipioExcel([FromQuery] int anio, CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDistribucionMetodosMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.Metodos.Select(m => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = m.Metodo,                    // "Ahorcamiento", "Intoxicacion Por Medicamentos", etc.
            Valor1 = m.Total,
            Valor2 = s.TotalEventos,                  // Total del municipio para contexto
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)m.Total / s.TotalEventos * 100 : 0, 2),
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Método" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2", "Subcategoria" };

        var excel = _exportService.GenerarExcel(datosPlanos, $"Metodos {anio}", headers, excluir);
        var fileName = $"DistribucionMetodosMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("distribucion-metodos-municipio/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDistribucionMetodosMunicipioCsv([FromQuery] int anio, CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDistribucionMetodosMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.Metodos.Select(m => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = m.Metodo,
            Valor1 = m.Total,
            Valor2 = s.TotalEventos,
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)m.Total / s.TotalEventos * 100 : 0, 2),
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Método" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2", "Subcategoria" };

        var csv = _exportService.GenerarCsv(datosPlanos, headers, excluir);
        var fileName = $"DistribucionMetodosMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
    [HttpGet("distribucion-hospitalizacion-municipio/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetDistribucionHospitalizacionMunicipioExcel([FromQuery] int anio, CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDistribucionHospitalizacionMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.Estados.Select(e => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = e.Estado,                    // "Hospitalizado" / "No Hospitalizado"
            Subcategoria = e.Hospitalizado == 1 ? "Sí" : "No",
            Valor1 = e.Total,
            Valor2 = s.TotalEventos,                  // Total del municipio para contexto
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)e.Total / s.TotalEventos * 100 : 0, 2),
            // Porcentaje2 = 0,                          // No aplica segunda porcentaje
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Estado" },
            { "Subcategoria", "Hospitalizado" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2" };

        var excel = _exportService.GenerarExcel(datosPlanos, $"Hospitalizacion {anio}", headers, excluir);
        var fileName = $"DistribucionHospitalizacionMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("distribucion-hospitalizacion-municipio/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetDistribucionHospitalizacionMunicipioCsv([FromQuery] int anio, CancellationToken cancelToken)
    {
        var result = await _analyticsService.GetDistribucionHospitalizacionMunicipioAsync(anio, cancelToken);
        
        var datosPlanos = result.Series?.SelectMany(s => s.Estados.Select(e => new RegistroAplanadoDto
        {
            Codigo = s.CodigoMunicipio,
            Nombre = s.Municipio,
            Categoria = e.Estado,
            Subcategoria = e.Hospitalizado == 1 ? "Sí" : "No",
            Valor1 = e.Total,
            Valor2 = s.TotalEventos,
            Porcentaje1 = Math.Round(s.TotalEventos > 0 ? (decimal)e.Total / s.TotalEventos * 100 : 0, 2),
            Periodo = anio.ToString()
        })).ToList() ?? new List<RegistroAplanadoDto>();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Estado" },
            { "Subcategoria", "Hospitalizado" },
            { "Valor1", "Total" },
            { "Valor2", "Total Municipio" },
            { "Porcentaje1", "% del Municipio" },
            // { "Porcentaje2", "" },
            { "Periodo", "Año" }
        };

        var excluir = new List<string> { "Porcentaje2" };

        var csv = _exportService.GenerarCsv(datosPlanos, headers, excluir);
        var fileName = $"DistribucionHospitalizacionMunicipio_{anio}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
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
        var result = await _analyticsService.GetTendenciaTemporalAsync(anio, cancelToken);

        var datos = result.Series ?? new List<TendenciaTemporalRegistroDto>();

        var excluir = new List<string> { "Porcentaje2" };
        var csv = _exportService.GenerarCsv(datos, null, excluir);
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
        // Validaciones (copiar del GET original)
        if (anio < 1900 || anio > DateTime.Now.Year)
            return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });

        if (mes.HasValue && (mes < 1 || mes > 12))
            return BadRequest(new { message = "Mes inválido", error = "El mes debe estar entre 1 y 12" });

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
            Porcentaje1 = Math.Round(d.PorcentajeEventos, 2),
            Porcentaje2 = Math.Round(d.PorcentajeHospitalizados, 2),
            Periodo = periodo
        })).ToList();

        // Headers específicos para este endpoint
        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Mes" },
            { "Subcategoria", "Número Mes" },
            { "Valor1", "Total Eventos" },
            { "Valor2", "Hospitalizados" },
            { "Porcentaje1", "% Eventos" },
            { "Porcentaje2", "% Hospitalizados" },
            { "Periodo", "Período" }
        };

        var excel = _exportService.GenerarExcel(datosPlanos, $"Tendencia T. Municipio {periodo}", headers);
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
        // Mismas validaciones...
        if (anio < 1900 || anio > DateTime.Now.Year)
            return BadRequest(new { message = "Año inválido", error = "El año debe estar entre 1900 y el año actual" });

        if (mes.HasValue && (mes < 1 || mes > 12))
            return BadRequest(new { message = "Mes inválido", error = "El mes debe estar entre 1 y 12" });

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
            Porcentaje1 = Math.Round(d.PorcentajeEventos, 2),
            Porcentaje2 = Math.Round(d.PorcentajeHospitalizados, 2),
            Periodo = periodo
        })).ToList();

        var headers = new Dictionary<string, string>
        {
            { "Codigo", "Código Municipio" },
            { "Nombre", "Municipio" },
            { "Categoria", "Mes" },
            { "Subcategoria", "Número Mes" },
            { "Valor1", "Total Eventos" },
            { "Valor2", "Hospitalizados" },
            { "Porcentaje1", "% Eventos" },
            { "Porcentaje2", "% Hospitalizados" },
            { "Periodo", "Período" }
        };

        var csv = _exportService.GenerarCsv(datosPlanos, headers);
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        var fileName = $"TendenciaTemporalMunicipio_{periodo}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

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

    /// <summary>
    /// Permite descargar en Excel o CSV la distribución geográfica de casos con filtros dinámicos
    /// </summary>

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

    /// <summary>
    /// Obtiene datos para construir pirámide poblacional de casos por género y grupo etario   
    /// </summary>
    /// <param name="cancelToken"></param>
    /// <returns></returns>
    [HttpGet("piramide-poblacional")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPiramidePoblacional(CancellationToken cancelToken)
    {
        try
        {
            _logger.LogInformation("Consultando vista de pirámide poblacional");
            var result = await _analyticsService.GetPiramidePoblacionalAsync(cancelToken);
            _logger.LogInformation("Datos de pirámide poblacional obtenidos exitosamente");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar la vista de pirámide poblacional");
            return BadRequest(new { message = "Error al obtener la pirámide poblacional", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene datos para construir pirámide poblacional de casos por género y grupo etario y permite exportar a Excel o CSV
    /// </summary>
    

    /// <summary>
    /// Obtiene resumen municipal de casos con filtros dinámicos para el mapa
    /// </summary>
    [HttpGet("resumen-municipal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetResumenMunicipal(
        [FromQuery] string? municipio,
        [FromQuery] int? anio,
        CancellationToken cancelToken)
    {
        try
        {
            _logger.LogInformation(
                "Consultando resumen municipal - Municipio: {municipio}, Año: {anio}",
                municipio ?? "Todos",
                anio?.ToString() ?? "Todos");

            var filtros = new ResumenMunicipalFiltrosDto
            {
                Municipio = municipio,
                Anio = anio
            };

            var result = await _analyticsService.GetResumenMunicipalAsync(filtros, cancelToken);

            _logger.LogInformation("Resumen municipal obtenido exitosamente - {count} registros", result.Data.Count);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar resumen municipal");
            return BadRequest(new { message = "Error al obtener el resumen municipal", error = ex.Message });
        }
    }

    [HttpGet("resumen-municipal/excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public async Task<IActionResult> GetResumenMunicipalExcel(
        [FromQuery] string? municipio,
        [FromQuery] int? anio)
    {
        var filtros = new ResumenMunicipalFiltrosDto
        {
            Municipio = municipio,
            Anio = anio
        };

        var resultado = await _analyticsService.GetResumenMunicipalAsync(filtros);

        var excel = _exportService.GenerarExcel(resultado.Data, "Resumen Municipal");
        var fileName = $"ResumenMunicipal_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("resumen-municipal/csv")]
    [Produces("text/csv")]
    public async Task<IActionResult> GetResumenMunicipalCsv(
        [FromQuery] string? municipio,
        [FromQuery] int? anio)
    {
        var filtros = new ResumenMunicipalFiltrosDto
        {
            Municipio = municipio,
            Anio = anio
        };

        var resultado = await _analyticsService.GetResumenMunicipalAsync(filtros);

        var csv = _exportService.GenerarCsv(resultado.Data);
        var csvBytes = new byte[] { 0xEF, 0xBB, 0xBF }.Concat(Encoding.UTF8.GetBytes(csv)).ToArray();
        var fileName = $"ResumenMunicipal_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

        return File(csvBytes, "text/csv", fileName);
    }



}

