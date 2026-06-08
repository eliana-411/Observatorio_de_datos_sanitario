using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Observatorio.Application.Analytics.DTOs;
using Observatorio.Application.Analytics.Interfaces;
using System.Globalization;
using System.Text;
using CsvHelper;

namespace Observatorio.Application.Analytics.Services;

/// <summary>
/// Servicio para cargar municipios desde el archivo CSV local DIVIPOLA
/// </summary>
public class MunicipiosService : IMunicipiosService
{
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<MunicipiosService>? _logger;
    private const string MUNICIPIOS_CACHE_KEY = "municipios_list";
    private const int CACHE_DURATION_MINUTES = 1440; // 24 horas

    public MunicipiosService(IMemoryCache memoryCache, ILogger<MunicipiosService>? logger = null)
    {
        _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
        _logger = logger;
    }

    /// <summary>
    /// Normaliza una cadena removiendo tildes y acentos
    /// </summary>
    private static string NormalizarTexto(string? texto)
    {
        if (string.IsNullOrEmpty(texto))
            return string.Empty;

        var textoNormalizado = texto.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (char c in textoNormalizado)
        {
            var info = CharUnicodeInfo.GetUnicodeCategory(c);
            if (info != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToUpperInvariant();
    }

    /// <summary>
    /// Obtiene la lista de municipios desde el CSV local, con caché
    /// </summary>
    public async Task<List<MunicipioInfoDto>> GetMunicipiosAsync(CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetMunicipios: Buscando municipios en caché");

        // Intentar obtener del caché
        if (_memoryCache.TryGetValue(MUNICIPIOS_CACHE_KEY, out List<MunicipioInfoDto>? municipiosCached))
        {
            _logger?.LogInformation("GetMunicipios: Municipios obtenidos del caché");
            return municipiosCached ?? new List<MunicipioInfoDto>();
        }

        _logger?.LogInformation("GetMunicipios: Cargando municipios desde CSV local");

        try
        {
            // Buscar el archivo CSV en la carpeta de datos del Application
            var basePath = AppContext.BaseDirectory;
            var projectRoot = Path.GetFullPath(Path.Combine(basePath, "..", "..", "..", ".."));
            var csvPath = Path.Combine(projectRoot, "Observatorio.Application", "Data", "municipios-divipola.csv");

            _logger?.LogInformation("Buscando CSV en: {csvPath}", csvPath);

            if (!File.Exists(csvPath))
            {
                throw new FileNotFoundException($"No se encontró el archivo CSV: {csvPath}");
            }

            var municipios = new List<MunicipioInfoDto>();

            using (var reader = new StreamReader(csvPath))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                csv.Read();
                csv.ReadHeader();

                while (csv.Read())
                {
                    var codigoMunicipio = csv.GetField("Código Municipio");
                    var nombreMunicipio = csv.GetField("Nombre Municipio");
                    var nombreDepartamento = csv.GetField("Nombre Departamento");

                    if (!string.IsNullOrEmpty(codigoMunicipio) && !string.IsNullOrEmpty(nombreMunicipio))
                    {
                        municipios.Add(new MunicipioInfoDto
                        {
                            CodigoMunicipio = codigoMunicipio,
                            Municipio = nombreMunicipio,
                            Departamento = nombreDepartamento
                        });
                    }
                }
            }

            // Guardar en caché
            _memoryCache.Set(MUNICIPIOS_CACHE_KEY, municipios, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
            _logger?.LogInformation($"GetMunicipios: {municipios.Count} municipios obtenidos y cacheados");

            return municipios;
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error al cargar municipios desde CSV");
            throw new InvalidOperationException("Error al obtener la lista de municipios", ex);
        }
    }

    /// <summary>
    /// Obtiene un municipio específico por código DANE
    /// </summary>
    public async Task<MunicipioInfoDto?> GetMunicipioByCodigoAsync(string codigoMunicipio, CancellationToken cancelToken = default)
    {
        var municipios = await GetMunicipiosAsync(cancelToken);
        return municipios.FirstOrDefault(m => m.CodigoMunicipio == codigoMunicipio);
    }

    /// <summary>
    /// Obtiene un municipio por nombre (búsqueda normalizada sin tildes)
    /// </summary>
    public async Task<MunicipioInfoDto?> GetMunicipioByNombreAsync(string nombreMunicipio, CancellationToken cancelToken = default)
    {
        var municipios = await GetMunicipiosAsync(cancelToken);
        var nombreNormalizado = NormalizarTexto(nombreMunicipio);

        return municipios.FirstOrDefault(m =>
            NormalizarTexto(m.Municipio) == nombreNormalizado);
    }

        /// <summary>
        /// Obtiene la lista de municipios con coordenadas desde el CSV local, con caché
        /// </summary> <param name="cancelToken">Token de cancelación</param>
        /// <returns>Lista de municipios con coordenadas</returns>
    public async Task<List<MunicipioMapaDto>> GetMunicipiosConCoordenadasAsync(CancellationToken cancelToken = default)
    {
        const string CACHE_KEY_COORDENADAS = "municipios_coordenadas_list";

        if (_memoryCache.TryGetValue(CACHE_KEY_COORDENADAS, out List<MunicipioMapaDto>? cached))
            return cached ?? new List<MunicipioMapaDto>();

        try
        {
            var basePath = AppContext.BaseDirectory;
            var projectRoot = Path.GetFullPath(Path.Combine(basePath, "..", "..", "..", ".."));
            var csvPath = Path.Combine(projectRoot, "Observatorio.Application", "Data", "municipios-divipola.csv");

            if (!File.Exists(csvPath))
                throw new FileNotFoundException($"No se encontró el archivo CSV: {csvPath}");

            var municipios = new List<MunicipioMapaDto>();

            using (var reader = new StreamReader(csvPath))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                csv.Read();
                csv.ReadHeader();

                while (csv.Read())
                {
                    var codigo = csv.GetField("Código Municipio");
                    var nombre = csv.GetField("Nombre Municipio");
                    var depto = csv.GetField("Nombre Departamento");
                    var lngStr = csv.GetField("longitud");
                    var latStr = csv.GetField("Latitud");

                    if (!string.IsNullOrEmpty(codigo) && !string.IsNullOrEmpty(nombre))
                    {
                        municipios.Add(new MunicipioMapaDto
                        {
                            CodigoMunicipio = codigo,
                            Municipio = nombre,
                            Departamento = depto,
                            Longitud = decimal.TryParse(lngStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var lng) ? lng : null,
                            Latitud = decimal.TryParse(latStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var lat) ? lat : null
                        });
                    }
                }
            }

            _memoryCache.Set(CACHE_KEY_COORDENADAS, municipios, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
            _logger?.LogInformation($"GetMunicipiosConCoordenadas: {municipios.Count} municipios con coordenadas cacheados");

            return municipios;
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error al cargar municipios con coordenadas desde CSV");
            throw new InvalidOperationException("Error al obtener la lista de municipios con coordenadas", ex);
        }
    }

    /// <summary>
    /// Obtiene un municipio con coordenadas por nombre (búsqueda normalizada sin tildes)
    /// </summary> <param name="nombreMunicipio">Nombre del municipio a buscar</param>
    public async Task<MunicipioMapaDto?> GetMunicipioConCoordenadasByNombreAsync(string nombreMunicipio, CancellationToken cancelToken = default)
    {
        var municipios = await GetMunicipiosConCoordenadasAsync(cancelToken);
        var nombreNormalizado = NormalizarTexto(nombreMunicipio);

        return municipios.FirstOrDefault(m =>
            NormalizarTexto(m.Municipio) == nombreNormalizado);
    }
}
