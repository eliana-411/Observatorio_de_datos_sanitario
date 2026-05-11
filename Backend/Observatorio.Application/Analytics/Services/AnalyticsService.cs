using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Observatorio.Application.Analytics.DTOs;
using Observatorio.Application.Analytics.Interfaces;
using Observatorio.Infrastructure.Sanitario;

namespace Observatorio.Application.Analytics.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly SanitarioDbContext _dbContext;
    private readonly IMunicipiosService _municipiosService;
    private readonly ILogger<AnalyticsService>? _logger;

    public AnalyticsService(SanitarioDbContext dbContext, IMunicipiosService municipiosService, ILogger<AnalyticsService>? logger = null)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _municipiosService = municipiosService ?? throw new ArgumentNullException(nameof(municipiosService));
        _logger = logger;
    }

    /// <summary>
    /// Obtiene los datos de la vista de distribución por género
    /// </summary>
    /// <returns>Respuesta con datos de la vista</returns>
    public async Task<VistaDistribucionGeneroResponseDto> GetDataFromVistaAsync(CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDataFromVista: Consultando vista");

        FormattableString query = $@"
    SELECT genero, total
    FROM vw_distribucion_genero
    ORDER BY total DESC
";

        var data = await _dbContext.Database.SqlQuery<VistaDistribucionGeneroDto>(query)
            .ToListAsync(cancelToken);

        return new VistaDistribucionGeneroResponseDto { Data = data };
    }

    /// <summary>
    /// Obtiene datos de la vista de distribución por grupo etario
    /// </summary>
    public async Task<VistaDistribucionGrupoEtarioResponseDto> GetDataFromVistaGrupoEtarioAsync(CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDataFromVistaGrupoEtario: Consultando vista");

        FormattableString query = $@"
    SELECT grupoEtario, total
    FROM vw_distribucion_grupo_etario
    ORDER BY total DESC
";

        var data = await _dbContext.Database.SqlQuery<VistaDistribucionGrupoEtarioDto>(query)
            .ToListAsync(cancelToken);

        return new VistaDistribucionGrupoEtarioResponseDto { Data = data };
    }

    /// <summary>
    /// Obtiene los métodos más usados
    /// </summary>
    /// <returns>Respuesta con datos de la vista</returns>
    /// <remarks>Se asume que la vista se llama vw_metodos_mas_usados y tiene columnas 'metodo' y 'total'</remarks>
    public async Task<VistaMetodosMasUsadosResponseDto> GetDataFromVistaMetodosMasUsadosAsync(CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDataFromVistaMetodosMasUsados: Consultando vista");

        FormattableString query = $@"
    SELECT metodo, total
    FROM vw_metodos_mas_usados
    ORDER BY total DESC
";

        var data = await _dbContext.Database.SqlQuery<VistaMetodosMasUsadosDto>(query)
            .ToListAsync(cancelToken);

        return new VistaMetodosMasUsadosResponseDto { Data = data };
    }

    /// <summary>
    /// Obtiene datos de la vista de hospitalización
    /// </summary>
    public async Task<VistaHospitalizacionResponseDto> GetDataFromVistaHospitalizacionAsync(CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDataFromVistaHospitalizacion: Consultando vista");

        FormattableString query = $@"
        SELECT hospitalizado, total
        FROM vw_hospitalizacion
        ORDER BY total DESC
    ";

        var rawData = await _dbContext.Database.SqlQuery<VistaHospitalizacionRawDto>(query)
            .ToListAsync(cancelToken);

        // Mapear los valores bool a descripciones legibles
        var data = rawData.Select(row => new VistaHospitalizacionDto
        {
            Hospitalizado = row.hospitalizado ? 1 : 0,
            Estado = row.hospitalizado ? "Hospitalizado" : "No Hospitalizado",
            Total = row.total
        }).ToList();

        return new VistaHospitalizacionResponseDto { Data = data };
    }

    /// <summary>
    /// Obtiene casos por municipio para un año específico
    /// </summary>
    public async Task<CasosPorMunicipioResponseDto> GetCasosPorMunicipioAsync(int anio, CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetCasosPorMunicipio: Consultando casos para el año {anio}", anio);

        // Query para obtener casos por municipio y año
        FormattableString query = $@"
            SELECT 
                l.municipio_evento as Municipio,
                COUNT(*) as TotalEventos
            FROM fact_evento f
            INNER JOIN dim_lugar l ON f.id_lugar = l.id_lugar
            INNER JOIN dim_tiempo t ON f.id_tiempo = t.id_tiempo
            WHERE YEAR(t.fecha) = {anio}
            GROUP BY l.municipio_evento
            ORDER BY TotalEventos DESC
        ";

        var resultados = await _dbContext.Database.SqlQuery<CasosPorMunicipioRawDto>(query)
            .ToListAsync(cancelToken);

        if (resultados.Count == 0)
        {
            _logger?.LogWarning("GetCasosPorMunicipio: No se encontraron casos para el año {anio}", anio);
            return new CasosPorMunicipioResponseDto
            {
                Periodo = new PeriodoDto { Anio = anio },
                TotalGeneral = 0,
                Maximo = 0,
                Minimo = 0,
                Series = new List<CasosPorMunicipioRegistroDto>()
            };
        }

        int totalGeneral = resultados.Sum(r => r.TotalEventos);
        int maximo = resultados.Max(r => r.TotalEventos);
        int minimo = resultados.Min(r => r.TotalEventos);

        // Mapear a DTOs y obtener códigos DANE
        var series = new List<CasosPorMunicipioRegistroDto>();
        foreach (var resultado in resultados)
        {
            var municipio = await _municipiosService.GetMunicipioByNombreAsync(resultado.Municipio ?? "", cancelToken);
            
            series.Add(new CasosPorMunicipioRegistroDto
            {
                CodigoMunicipio = municipio?.CodigoMunicipio ?? "Desconocido",
                Municipio = resultado.Municipio,
                TotalEventos = resultado.TotalEventos,
                Porcentaje = (decimal)resultado.TotalEventos / totalGeneral * 100
            });
        }

        _logger?.LogInformation("GetCasosPorMunicipio: {count} municipios encontrados", series.Count);

        return new CasosPorMunicipioResponseDto
        {
            Periodo = new PeriodoDto { Anio = anio },
            TotalGeneral = totalGeneral,
            Maximo = maximo,
            Minimo = minimo,
            Series = series
        };
    }

    /// <summary>
    /// Obtiene distribución de género por municipio para un año específico
    /// </summary>
    public async Task<DistribucionGeneroMunicipioResponseDto> GetDistribucionGeneroMunicipioAsync(int anio, CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDistribucionGeneroMunicipio: Consultando distribución de género para el año {anio}", anio);

        // Query para obtener distribución de género por municipio y año
        FormattableString query = $@"
            SELECT 
                l.municipio_evento as Municipio,
                p.genero as Genero,
                COUNT(*) as Total
            FROM fact_evento f
            INNER JOIN dim_lugar l ON f.id_lugar = l.id_lugar
            INNER JOIN dim_tiempo t ON f.id_tiempo = t.id_tiempo
            INNER JOIN dim_persona p ON f.id_persona = p.id_persona
            WHERE YEAR(t.fecha) = {anio}
            GROUP BY l.municipio_evento, p.genero
            ORDER BY l.municipio_evento, Total DESC
        ";

        var resultados = await _dbContext.Database.SqlQuery<DistribucionGeneroMunicipioRawDto>(query)
            .ToListAsync(cancelToken);

        if (resultados.Count == 0)
        {
            _logger?.LogWarning("GetDistribucionGeneroMunicipio: No se encontraron datos para el año {anio}", anio);
            return new DistribucionGeneroMunicipioResponseDto
            {
                Periodo = new PeriodoDto { Anio = anio },
                Series = new List<DistribucionGeneroMunicipioRegistroDto>()
            };
        }

        // Agrupar por municipio
        var municipiosAgrupados = resultados.GroupBy(r => r.Municipio).ToList();
        var series = new List<DistribucionGeneroMunicipioRegistroDto>();

        foreach (var grupo in municipiosAgrupados)
        {
            var municipio = await _municipiosService.GetMunicipioByNombreAsync(grupo.Key ?? "", cancelToken);
            var totalEventos = grupo.Sum(r => r.Total);

            var registroMunicipio = new DistribucionGeneroMunicipioRegistroDto
            {
                CodigoMunicipio = municipio?.CodigoMunicipio ?? "Desconocido",
                Municipio = grupo.Key,
                TotalEventos = totalEventos,
                Generos = grupo
                    .Select(g => new GeneroDistribucionDto
                    {
                        Genero = g.Genero,
                        Total = g.Total
                    })
                    .ToList()
            };

            series.Add(registroMunicipio);
        }

        _logger?.LogInformation("GetDistribucionGeneroMunicipio: {count} municipios encontrados", series.Count);

        return new DistribucionGeneroMunicipioResponseDto
        {
            Periodo = new PeriodoDto { Anio = anio },
            Series = series
        };
    }

    /// <summary>
    /// Obtiene distribución de grupo etario por municipio para un año específico
    /// </summary>
    public async Task<DistribucionGrupoEtarioMunicipioResponseDto> GetDistribucionGrupoEtarioMunicipioAsync(int anio, CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDistribucionGrupoEtarioMunicipio: Consultando distribución de grupo etario para el año {anio}", anio);

        // Query para obtener distribución de grupo etario por municipio y año
        FormattableString query = $@"
            SELECT 
                l.municipio_evento as Municipio,
                p.grupo_etario as GrupoEtario,
                COUNT(*) as Total
            FROM fact_evento f
            INNER JOIN dim_lugar l ON f.id_lugar = l.id_lugar
            INNER JOIN dim_tiempo t ON f.id_tiempo = t.id_tiempo
            INNER JOIN dim_persona p ON f.id_persona = p.id_persona
            WHERE YEAR(t.fecha) = {anio}
            GROUP BY l.municipio_evento, p.grupo_etario
            ORDER BY l.municipio_evento, Total DESC
        ";

        var resultados = await _dbContext.Database.SqlQuery<DistribucionGrupoEtarioMunicipioRawDto>(query)
            .ToListAsync(cancelToken);

        if (resultados.Count == 0)
        {
            _logger?.LogWarning("GetDistribucionGrupoEtarioMunicipio: No se encontraron datos para el año {anio}", anio);
            return new DistribucionGrupoEtarioMunicipioResponseDto
            {
                Periodo = new PeriodoDto { Anio = anio },
                Series = new List<DistribucionGrupoEtarioMunicipioRegistroDto>()
            };
        }

        // Agrupar por municipio
        var municipiosAgrupados = resultados.GroupBy(r => r.Municipio).ToList();
        var series = new List<DistribucionGrupoEtarioMunicipioRegistroDto>();

        foreach (var grupo in municipiosAgrupados)
        {
            var municipio = await _municipiosService.GetMunicipioByNombreAsync(grupo.Key ?? "", cancelToken);
            var totalEventos = grupo.Sum(r => r.Total);

            var registroMunicipio = new DistribucionGrupoEtarioMunicipioRegistroDto
            {
                CodigoMunicipio = municipio?.CodigoMunicipio ?? "Desconocido",
                Municipio = grupo.Key,
                TotalEventos = totalEventos,
                GruposEtarios = grupo
                    .Select(g => new GrupoEtarioDistribucionDto
                    {
                        GrupoEtario = g.GrupoEtario,
                        Total = g.Total
                    })
                    .ToList()
            };

            series.Add(registroMunicipio);
        }

        _logger?.LogInformation("GetDistribucionGrupoEtarioMunicipio: {count} municipios encontrados", series.Count);

        return new DistribucionGrupoEtarioMunicipioResponseDto
        {
            Periodo = new PeriodoDto { Anio = anio },
            Series = series
        };
    }

    /// <summary>
    /// Obtiene distribución de métodos por municipio para un año específico
    /// </summary>
    public async Task<DistribucionMetodosMunicipioResponseDto> GetDistribucionMetodosMunicipioAsync(int anio, CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDistribucionMetodosMunicipio: Consultando distribución de métodos para el año {anio}", anio);

        // Query para obtener distribución de métodos por municipio y año
        FormattableString query = $@"
            SELECT 
                l.municipio_evento as Municipio,
                m.metodo as Metodo,
                COUNT(*) as Total
            FROM fact_evento f
            INNER JOIN dim_lugar l ON f.id_lugar = l.id_lugar
            INNER JOIN dim_tiempo t ON f.id_tiempo = t.id_tiempo
            INNER JOIN dim_metodo m ON f.id_metodo = m.id_metodo
            WHERE YEAR(t.fecha) = {anio}
            GROUP BY l.municipio_evento, m.metodo
            ORDER BY l.municipio_evento, Total DESC
        ";

        var resultados = await _dbContext.Database.SqlQuery<DistribucionMetodosMunicipioRawDto>(query)
            .ToListAsync(cancelToken);

        if (resultados.Count == 0)
        {
            _logger?.LogWarning("GetDistribucionMetodosMunicipio: No se encontraron datos para el año {anio}", anio);
            return new DistribucionMetodosMunicipioResponseDto
            {
                Periodo = new PeriodoDto { Anio = anio },
                Series = new List<DistribucionMetodosMunicipioRegistroDto>()
            };
        }

        // Agrupar por municipio
        var municipiosAgrupados = resultados.GroupBy(r => r.Municipio).ToList();
        var series = new List<DistribucionMetodosMunicipioRegistroDto>();

        foreach (var grupo in municipiosAgrupados)
        {
            var municipio = await _municipiosService.GetMunicipioByNombreAsync(grupo.Key ?? "", cancelToken);
            var totalEventos = grupo.Sum(r => r.Total);

            var registroMunicipio = new DistribucionMetodosMunicipioRegistroDto
            {
                CodigoMunicipio = municipio?.CodigoMunicipio ?? "Desconocido",
                Municipio = grupo.Key,
                TotalEventos = totalEventos,
                Metodos = grupo
                    .Select(g => new MetodoDistribucionDto
                    {
                        Metodo = g.Metodo,
                        Total = g.Total
                    })
                    .ToList()
            };

            series.Add(registroMunicipio);
        }

        _logger?.LogInformation("GetDistribucionMetodosMunicipio: {count} municipios encontrados", series.Count);

        return new DistribucionMetodosMunicipioResponseDto
        {
            Periodo = new PeriodoDto { Anio = anio },
            Series = series
        };
    }

    /// <summary>
    /// Obtiene distribución de hospitalización por municipio para un año específico
    /// </summary>
    public async Task<DistribucionHospitalizacionMunicipioResponseDto> GetDistribucionHospitalizacionMunicipioAsync(int anio, CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetDistribucionHospitalizacionMunicipio: Consultando distribución de hospitalización para el año {anio}", anio);

        // Query para obtener distribución de hospitalización por municipio y año
        FormattableString query = $@"
            SELECT 
                l.municipio_evento as Municipio,
                f.hospitalizado as Hospitalizado,
                COUNT(*) as Total
            FROM fact_evento f
            INNER JOIN dim_lugar l ON f.id_lugar = l.id_lugar
            INNER JOIN dim_tiempo t ON f.id_tiempo = t.id_tiempo
            WHERE YEAR(t.fecha) = {anio}
            GROUP BY l.municipio_evento, f.hospitalizado
            ORDER BY l.municipio_evento, f.hospitalizado DESC
        ";

        var resultados = await _dbContext.Database.SqlQuery<DistribucionHospitalizacionMunicipioRawDto>(query)
            .ToListAsync(cancelToken);

        if (resultados.Count == 0)
        {
            _logger?.LogWarning("GetDistribucionHospitalizacionMunicipio: No se encontraron datos para el año {anio}", anio);
            return new DistribucionHospitalizacionMunicipioResponseDto
            {
                Periodo = new PeriodoDto { Anio = anio },
                Series = new List<DistribucionHospitalizacionMunicipioRegistroDto>()
            };
        }

        // Agrupar por municipio
        var municipiosAgrupados = resultados.GroupBy(r => r.Municipio).ToList();
        var series = new List<DistribucionHospitalizacionMunicipioRegistroDto>();

        foreach (var grupo in municipiosAgrupados)
        {
            var municipio = await _municipiosService.GetMunicipioByNombreAsync(grupo.Key ?? "", cancelToken);
            var totalEventos = grupo.Sum(r => r.Total);

            var registroMunicipio = new DistribucionHospitalizacionMunicipioRegistroDto
            {
                CodigoMunicipio = municipio?.CodigoMunicipio ?? "Desconocido",
                Municipio = grupo.Key,
                TotalEventos = totalEventos,
                Estados = grupo
                    .Select(g => new HospitalizacionDistribucionDto
                    {
                        Hospitalizado = g.Hospitalizado ? 1 : 0,
                        Estado = g.Hospitalizado ? "Hospitalizado" : "No Hospitalizado",
                        Total = g.Total
                    })
                    .ToList()
            };

            series.Add(registroMunicipio);
        }

        _logger?.LogInformation("GetDistribucionHospitalizacionMunicipio: {count} municipios encontrados", series.Count);

        return new DistribucionHospitalizacionMunicipioResponseDto
        {
            Periodo = new PeriodoDto { Anio = anio },
            Series = series
        };
    }
}

/// <summary>
/// DTO para la query raw de casos por municipio
/// </summary>
internal class CasosPorMunicipioRawDto
{
    public string? Municipio { get; set; }
    public int TotalEventos { get; set; }
}

/// <summary>
/// DTO para la query raw de distribución de género por municipio
/// </summary>
internal class DistribucionGeneroMunicipioRawDto
{
    public string? Municipio { get; set; }
    public string? Genero { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para la query raw de distribución de grupo etario por municipio
/// </summary>
internal class DistribucionGrupoEtarioMunicipioRawDto
{
    public string? Municipio { get; set; }
    public string? GrupoEtario { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para la query raw de distribución de métodos por municipio
/// </summary>
internal class DistribucionMetodosMunicipioRawDto
{
    public string? Municipio { get; set; }
    public string? Metodo { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para la query raw de distribución de hospitalización por municipio
/// </summary>
internal class DistribucionHospitalizacionMunicipioRawDto
{
    public string? Municipio { get; set; }
    public bool Hospitalizado { get; set; }
    public int Total { get; set; }
}
