using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Observatorio.Application.Analytics.DTOs;
using Observatorio.Application.Analytics.Interfaces;
using Observatorio.Infrastructure.Sanitario;

namespace Observatorio.Application.Analytics.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly SanitarioDbContext _dbContext;
    private readonly ILogger<AnalyticsService>? _logger;

    public AnalyticsService(SanitarioDbContext dbContext, ILogger<AnalyticsService>? logger = null)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger;
    }

    /// <summary>
    /// Obtiene la tendencia agrupada por año/mes
    /// </summary>
    public async Task<TimeSeriesByYearResponseDto> GetTimeSeriesByYearAsync(int? anio = null, CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetTimeSeriesByYear: anio={Anio}", anio ?? 0);

        FormattableString query;

        if (anio.HasValue)
        {
            query = $@"
                SELECT 
                    dt.anio,
                    dt.mes,
                    dt.nombre_mes,
                    COUNT(fe.id_registro) AS cantidad_eventos,
                    COALESCE(SUM(fe.cantidad_intentos), 0) AS total_intentos,
                    COUNT(CASE WHEN fe.hospitalizado = 1 THEN 1 END) AS casos_hospitalizados
                FROM fact_evento fe
                JOIN dim_tiempo dt ON fe.id_tiempo = dt.id_tiempo
                WHERE dt.anio = {anio}
                GROUP BY dt.anio, dt.mes, dt.nombre_mes
                ORDER BY dt.anio, dt.mes
            ";
        }
        else
        {
            query = $@"
                SELECT 
                    dt.anio,
                    dt.mes,
                    dt.nombre_mes,
                    COUNT(fe.id_registro) AS cantidad_eventos,
                    COALESCE(SUM(fe.cantidad_intentos), 0) AS total_intentos,
                    COUNT(CASE WHEN fe.hospitalizado = 1 THEN 1 END) AS casos_hospitalizados
                FROM fact_evento fe
                JOIN dim_tiempo dt ON fe.id_tiempo = dt.id_tiempo
                GROUP BY dt.anio, dt.mes, dt.nombre_mes
                ORDER BY dt.anio, dt.mes
            ";
        }

        var seriesRaw = await _dbContext.Database.SqlQuery<TimeSeriesByYearRawDto>(query)
            .ToListAsync(cancelToken);

        _logger?.LogInformation("GetTimeSeriesByYear: filas retornadas={RowCount}", seriesRaw.Count);

        var series = new List<TimeSeriesByYearDto>();

        foreach (var row in seriesRaw)
        {
            series.Add(new TimeSeriesByYearDto
            {
                Anio = row.anio,
                Mes = row.mes,
                NombreMes = row.nombre_mes,
                TotalEventos = row.cantidad_eventos,
                TotalIntentos = row.total_intentos,
                TotalHospitalizados = row.casos_hospitalizados
            });
        }

        return new TimeSeriesByYearResponseDto { Series = series };
    }

    /// <summary>
    /// Obtiene la tendencia con agrupación dinámica según rango de fechas
    /// </summary>
    public async Task<TimeSeriesByDateRangeResponseDto> GetTimeSeriesByDateRangeAsync(DateTime fechaInicio, DateTime fechaFin, CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetTimeSeriesByDateRange: inicio={FechaInicio}, fin={FechaFin}", fechaInicio, fechaFin);

        // Calcular días entre fechas
        var diasDiferencia = (fechaFin - fechaInicio).Days;

        // Determinar tipo de agrupación
        string agrupacion;
        List<TimeSeriesByDateDto> series;

        if (diasDiferencia <= 90)
        {
            agrupacion = "dia";
            series = await GetSeriesByDayAsync(fechaInicio, fechaFin, cancelToken);
        }
        else if (diasDiferencia <= 365)
        {
            agrupacion = "mes";
            series = await GetSeriesByMonthAsync(fechaInicio, fechaFin, cancelToken);
        }
        else
        {
            agrupacion = "año";
            series = await GetSeriesByYearRangeAsync(fechaInicio, fechaFin, cancelToken);
        }

        _logger?.LogInformation("GetTimeSeriesByDateRange: agrupacion={Agrupacion}, filas={RowCount}", agrupacion, series.Count);

        return new TimeSeriesByDateRangeResponseDto 
        { 
            Agrupacion = agrupacion, 
            Series = series 
        };
    }

    /// <summary>
    /// Agrupa por día
    /// </summary>
    private async Task<List<TimeSeriesByDateDto>> GetSeriesByDayAsync(DateTime fechaInicio, DateTime fechaFin, CancellationToken cancelToken)
    {
        FormattableString query = $@"
            SELECT 
                dt.fecha,
                COUNT(fe.id_registro) AS cantidad_eventos,
                COALESCE(SUM(fe.cantidad_intentos), 0) AS total_intentos,
                COUNT(CASE WHEN fe.hospitalizado = 1 THEN 1 END) AS casos_hospitalizados
            FROM fact_evento fe
            JOIN dim_tiempo dt ON fe.id_tiempo = dt.id_tiempo
            WHERE dt.fecha >= {fechaInicio} AND dt.fecha <= DATEADD(day, 1, {fechaFin})
            GROUP BY dt.fecha
            ORDER BY dt.fecha
        ";

        var seriesRaw = await _dbContext.Database.SqlQuery<TimeSeriesByDayRawDto>(query)
            .ToListAsync(cancelToken);

        return seriesRaw.Select(row => new TimeSeriesByDateDto
        {
            Fecha = row.fecha,
            TotalEventos = row.cantidad_eventos,
            TotalIntentos = row.total_intentos,
            TotalHospitalizados = row.casos_hospitalizados
        }).ToList();
    }

    /// <summary>
    /// Agrupa por mes
    /// </summary>
    private async Task<List<TimeSeriesByDateDto>> GetSeriesByMonthAsync(DateTime fechaInicio, DateTime fechaFin, CancellationToken cancelToken)
    {
        FormattableString query = $@"
            SELECT 
                dt.anio,
                dt.mes,
                dt.nombre_mes,
                COUNT(fe.id_registro) AS cantidad_eventos,
                COALESCE(SUM(fe.cantidad_intentos), 0) AS total_intentos,
                COUNT(CASE WHEN fe.hospitalizado = 1 THEN 1 END) AS casos_hospitalizados
            FROM fact_evento fe
            JOIN dim_tiempo dt ON fe.id_tiempo = dt.id_tiempo
            WHERE dt.fecha >= {fechaInicio} AND dt.fecha <= DATEADD(day, 1, {fechaFin})
            GROUP BY dt.anio, dt.mes, dt.nombre_mes
            ORDER BY dt.anio, dt.mes
        ";

        var seriesRaw = await _dbContext.Database.SqlQuery<TimeSeriesByYearRawDto>(query)
            .ToListAsync(cancelToken);

        return seriesRaw.Select(row => new TimeSeriesByDateDto
        {
            Anio = row.anio,
            Mes = row.mes,
            NombreMes = row.nombre_mes,
            TotalEventos = row.cantidad_eventos,
            TotalIntentos = row.total_intentos,
            TotalHospitalizados = row.casos_hospitalizados
        }).ToList();
    }

    /// <summary>
    /// Agrupa por año
    /// </summary>
    private async Task<List<TimeSeriesByDateDto>> GetSeriesByYearRangeAsync(DateTime fechaInicio, DateTime fechaFin, CancellationToken cancelToken)
    {
        FormattableString query = $@"
            SELECT 
                dt.anio,
                COUNT(fe.id_registro) AS cantidad_eventos,
                COALESCE(SUM(fe.cantidad_intentos), 0) AS total_intentos,
                COUNT(CASE WHEN fe.hospitalizado = 1 THEN 1 END) AS casos_hospitalizados
            FROM fact_evento fe
            JOIN dim_tiempo dt ON fe.id_tiempo = dt.id_tiempo
            WHERE dt.fecha >= {fechaInicio} AND dt.fecha <= DATEADD(day, 1, {fechaFin})
            GROUP BY dt.anio
            ORDER BY dt.anio
        ";

        var seriesRaw = await _dbContext.Database.SqlQuery<TimeSeriesByYearRangeRawDto>(query)
            .ToListAsync(cancelToken);

        return seriesRaw.Select(row => new TimeSeriesByDateDto
        {
            Anio = row.anio,
            TotalEventos = row.cantidad_eventos,
            TotalIntentos = row.total_intentos,
            TotalHospitalizados = row.casos_hospitalizados
        }).ToList();
    }
}
