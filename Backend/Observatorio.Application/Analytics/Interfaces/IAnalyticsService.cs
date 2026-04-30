using Observatorio.Application.Analytics.DTOs;

namespace Observatorio.Application.Analytics.Interfaces;

public interface IAnalyticsService
{
    /// <summary>
    /// Obtiene la tendencia de eventos agrupada por año/mes
    /// </summary>
    /// <param name="anio">Año específico (nulo para todos los años)</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con series agrupadas por año/mes</returns>
    Task<TimeSeriesByYearResponseDto> GetTimeSeriesByYearAsync(int? anio = null, CancellationToken cancelToken = default);
    
    /// <summary>
    /// Obtiene la tendencia de eventos con agrupación dinámica según rango de fechas
    /// - ≤ 90 días: agrupa por día
    /// - 91-365 días: agrupa por mes
    /// - > 365 días: agrupa por año
    /// </summary>
    /// <param name="fechaInicio">Fecha inicio del rango</param>
    /// <param name="fechaFin">Fecha fin del rango</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con series y tipo de agrupación</returns>
    Task<TimeSeriesByDateRangeResponseDto> GetTimeSeriesByDateRangeAsync(DateTime fechaInicio, DateTime fechaFin, CancellationToken cancelToken = default);
}
