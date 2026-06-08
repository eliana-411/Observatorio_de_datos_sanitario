using Observatorio.Application.Anomalias.DTOs;

namespace Observatorio.Application.Anomalias.Interfaces
{
    /// <summary>
    /// Servicio para consumir el microservicio de ML de Anomalías (FastAPI)
    /// </summary>
    public interface IAnomaliaService
    {
        /// <summary>
        /// Detecta si un caso individual es una anomalía
        /// </summary>
        Task<AnomaliaResponseDto> DetectarAnomaliaAsync(AnomaliaPayloadDto payload, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lista anomalías detectadas con filtros opcionales
        /// </summary>
        Task<AnomaliaListResponseDto> ListarAnomaliasAsync(
            string? tipo = null,
            string? severidad = null,
            string? categoria = null,
            int limite = 50,
            int offset = 0,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Obtiene el detalle de una anomalía específica
        /// </summary>
        Task<AnomaliaDetalleCompletoDto> ObtenerDetalleAsync(int idRegistro, CancellationToken cancellationToken = default);

        /// <summary>
        /// Obtiene la distribución de anomalías por tipo (para gráficos)
        /// </summary>
        Task<AnomaliaDistribucionDto> ObtenerDistribucionAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Obtiene información del modelo (métricas, confiabilidad, CV)
        /// </summary>
        Task<AnomaliaModelInfoDto> ObtenerInfoModeloAsync(CancellationToken cancellationToken = default);
    }
}