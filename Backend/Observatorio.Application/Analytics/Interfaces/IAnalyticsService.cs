using Observatorio.Application.Analytics.DTOs;

namespace Observatorio.Application.Analytics.Interfaces;

public interface IAnalyticsService
{
    /// <summary>
    /// Obtiene datos de la vista de distribución por género
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de la vista</returns>
    Task<VistaDistribucionGeneroResponseDto> GetDataFromVistaAsync(CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene datos de la vista de distribución por grupo etario
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de la vista</returns>
    /// <remarks>Se pueden agregar parámetros de filtro si la vista los soporta</remarks>
    Task<VistaDistribucionGrupoEtarioResponseDto> GetDataFromVistaGrupoEtarioAsync(CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene datos de la vista de métodos más usados en eventos
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de la vista</returns>
    Task<VistaMetodosMasUsadosResponseDto> GetDataFromVistaMetodosMasUsadosAsync(CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene datos de la vista de hospitalización
    /// </summary>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con datos de hospitalización (1=Hospitalizado, 0=No Hospitalizado)</returns>
    Task<VistaHospitalizacionResponseDto> GetDataFromVistaHospitalizacionAsync(CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene casos por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con casos distribuidos por municipio con código DANE</returns>
    Task<CasosPorMunicipioResponseDto> GetCasosPorMunicipioAsync(int anio, CancellationToken cancelToken = default);
}
