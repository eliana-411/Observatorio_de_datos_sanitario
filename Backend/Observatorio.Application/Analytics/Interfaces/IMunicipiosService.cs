using Observatorio.Application.Analytics.DTOs;

namespace Observatorio.Application.Analytics.Interfaces;

/// <summary>
/// Interface para el servicio de municipios desde CSV local
/// </summary>
public interface IMunicipiosService
{
    /// <summary>
    /// Obtiene la lista de municipios desde el archivo CSV DIVIPOLA
    /// </summary>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Lista de municipios con código DANE</returns>
    Task<List<MunicipioInfoDto>> GetMunicipiosAsync(CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene un municipio específico por código DANE
    /// </summary>
    /// <param name="codigoMunicipio">Código DANE del municipio</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Información del municipio o null si no existe</returns>
    Task<MunicipioInfoDto?> GetMunicipioByCodigoAsync(string codigoMunicipio, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene un municipio específico por nombre
    /// </summary>
    /// <param name="nombreMunicipio">Nombre del municipio</param>
    /// <param name="cancelToken">Token de cancelación</param>
    /// <returns>Información del municipio o null si no existe</returns>
    Task<MunicipioInfoDto?> GetMunicipioByNombreAsync(string nombreMunicipio, CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene la lista de municipios con coordenadas desde el CSV local, con caché   
    /// </summary> <param name="cancelToken">Token de cancelación</param>
    /// <returns>Lista de municipios con coordenadas</returns>  
    Task<List<MunicipioMapaDto>> GetMunicipiosConCoordenadasAsync(CancellationToken cancelToken = default);

    /// <summary>
    /// Obtiene un municipio con coordenadas por nombre (búsqueda normalizada sin tildes)
    /// </summary> <param name="nombreMunicipio">Nombre del municipio a buscar</
    /// param name="cancelToken">Token de cancelación</param>
    /// <returns>Información del municipio con coordenadas o null si no existe</returns>
    Task<MunicipioMapaDto?> GetMunicipioConCoordenadasByNombreAsync(string nombreMunicipio, CancellationToken cancelToken = default);
}
