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

    /// <summary>
    /// Obtiene distribución de género por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de género por municipio</returns>
    Task<DistribucionGeneroMunicipioResponseDto> GetDistribucionGeneroMunicipioAsync(int anio, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene distribución de grupo etario por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de grupo etario por municipio</returns>
    Task<DistribucionGrupoEtarioMunicipioResponseDto> GetDistribucionGrupoEtarioMunicipioAsync(int anio, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene distribución de métodos por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de métodos por municipio</returns>
    Task<DistribucionMetodosMunicipioResponseDto> GetDistribucionMetodosMunicipioAsync(int anio, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene distribución de hospitalización por municipio para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución de hospitalización por municipio</returns>
    Task<DistribucionHospitalizacionMunicipioResponseDto> GetDistribucionHospitalizacionMunicipioAsync(int anio, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene tendencia temporal de eventos por mes para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con tendencia temporal de eventos y hospitalizados por mes</returns>
    Task<TendenciaTemporalResponseDto> GetTendenciaTemporalAsync(int anio, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene tendencia temporal de eventos por mes y municipio para un año específico (opcional: mes específico)
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="mes">Mes opcional (1-12). Si no se proporciona, devuelve todos los meses</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con tendencia temporal de eventos y hospitalizados por mes y municipio</returns>
    Task<TendenciaTemporalMunicipioResponseDto> GetTendenciaTemporalMunicipioAsync(int anio, int? mes = null, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene distribución geográfica de eventos por municipio para un año específico con filtros opcionales
    /// </summary>
    /// <param name="filtros">Filtros opcionales para la consulta (municipio, rango de edad, género, año)</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con distribución geográfica de eventos por municipio</returns>
    Task<List<DistribucionGeograficaDto>> GetDistribucionGeograficaAsync(FiltrosDistribucionDto filtros, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene datos para la pirámide poblacional de eventos por género y grupo etario para un año específico
    /// </summary>
    /// <param name="anio">Año de los eventos</param>
    /// <param name="cancelToken">Token de cancelación</param>
    Task<PiramidePoblacionalResponseDto> GetPiramidePoblacionalAsync(CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene resumen municipal con casos, hospitalizados y tasa de hospitalización
    /// </summary>
    /// <param name="filtros">Filtros opcionales de municipio y año</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Respuesta con resumen por municipio</returns>
    Task<ResumenMunicipalResponseDto> GetResumenMunicipalAsync(
        ResumenMunicipalFiltrosDto filtros, 
        CancellationToken cancelToken = default);
}
