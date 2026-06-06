using Observatorio.Application.Anomalias.DTOs;

namespace Observatorio.Application.Anomalias.Interfaces;

/// <summary>
/// Interface para el servicio de detección de anomalías
/// </summary>
public interface IAnomalasService
{
    /// <summary>
    /// Detecta incrementos anómalos en la cantidad de intentos por municipio
    /// Compara el promedio histórico (últimos 12 meses previos) con los últimos 30 días
    /// </summary>
    /// <param name="anio">Año actual para el análisis</param>
    /// <param name="umbralPorcentaje">Umbral de porcentaje para considerar como anómalo (ej: 50 = 50%)</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con municipios que tienen incrementos anómalos</returns>
    Task<IncrementosAnomalosResponseDto> GetIncrementosAnomalosAsync(
        int? anio = null, 
        decimal? umbralPorcentaje = null, 
        CancellationToken cancelToken = default);
}
