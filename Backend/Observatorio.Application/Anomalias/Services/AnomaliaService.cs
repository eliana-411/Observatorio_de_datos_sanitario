using System.Text.Json;
using Microsoft.Extensions.Logging;
using Observatorio.Application.Anomalias.DTOs;
using Observatorio.Application.Anomalias.Interfaces;

namespace Observatorio.Application.Anomalias.Services
{
    /// <summary>
    /// Implementación del servicio de Anomalías que consume FastAPI
    /// </summary>
    public class AnomaliaService : IAnomaliaService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AnomaliaService> _logger;
        private readonly string _aiBaseUrl;

        private static readonly JsonSerializerOptions SnakeCaseOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
        };

        public AnomaliaService(
            HttpClient httpClient,
            ILogger<AnomaliaService> logger,
            string aiBaseUrl)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _aiBaseUrl = aiBaseUrl ?? throw new ArgumentNullException(nameof(aiBaseUrl));
        }

        public async Task<AnomaliaResponseDto> DetectarAnomaliaAsync(
            AnomaliaPayloadDto payload,
            CancellationToken cancellationToken = default)
        {

            var url = $"{_aiBaseUrl}/api/v1/detect/anomalias";
            
            // Serializar payload con SnakeCase para FastAPI
            var content = new StringContent(
                JsonSerializer.Serialize(payload, SnakeCaseOptions),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(url, content, cancellationToken);

            var resultRaw = await response.Content.ReadAsStringAsync(cancellationToken);
            response.EnsureSuccessStatusCode();

            // var result = await response.Content.ReadAsStringAsync(cancellationToken);
            return JsonSerializer.Deserialize<AnomaliaResponseDto>(resultRaw, SnakeCaseOptions)
                ?? throw new InvalidOperationException("No se pudo deserializar la respuesta");
        }

        public async Task<AnomaliaListResponseDto> ListarAnomaliasAsync(
            string? tipo = null,
            string? severidad = null,
            string? categoria = null,
            int limite = 50,
            int offset = 0,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Listando anomalías");

            var queryParams = new List<string>();
            if (!string.IsNullOrEmpty(tipo))
                queryParams.Add($"tipo={Uri.EscapeDataString(tipo)}");
            if (!string.IsNullOrEmpty(severidad))
                queryParams.Add($"severidad={Uri.EscapeDataString(severidad)}");
            if (!string.IsNullOrEmpty(categoria))
                queryParams.Add($"categoria={Uri.EscapeDataString(categoria)}");
            queryParams.Add($"limite={limite}");
            queryParams.Add($"offset={offset}");

            var url = $"{_aiBaseUrl}/api/v1/detect/anomalias";
            if (queryParams.Any())
                url += "?" + string.Join("&", queryParams);

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync(cancellationToken);
            return JsonSerializer.Deserialize<AnomaliaListResponseDto>(result, SnakeCaseOptions)
                ?? throw new InvalidOperationException("No se pudo deserializar la respuesta");
        }

        public async Task<AnomaliaDetalleCompletoDto> ObtenerDetalleAsync(
            int idRegistro,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Obteniendo detalle de anomalía {IdRegistro}", idRegistro);

            var url = $"{_aiBaseUrl}/api/v1/detect/anomalias/{idRegistro}";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                throw new KeyNotFoundException($"Anomalía {idRegistro} no encontrada");

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync(cancellationToken);
            return JsonSerializer.Deserialize<AnomaliaDetalleCompletoDto>(result, SnakeCaseOptions)
                ?? throw new InvalidOperationException("No se pudo deserializar la respuesta");
        }

        public async Task<AnomaliaDistribucionDto> ObtenerDistribucionAsync(
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Obteniendo distribución de anomalías");

            var url = $"{_aiBaseUrl}/api/v1/detect/anomalias/tipos/distribucion";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync(cancellationToken);
            return JsonSerializer.Deserialize<AnomaliaDistribucionDto>(result, SnakeCaseOptions)
                ?? throw new InvalidOperationException("No se pudo deserializar la respuesta");
        }

        public async Task<AnomaliaModelInfoDto> ObtenerInfoModeloAsync(
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Obteniendo info del modelo de anomalías");

            var url = $"{_aiBaseUrl}/api/v1/detect/anomalias/model/info";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync(cancellationToken);
            return JsonSerializer.Deserialize<AnomaliaModelInfoDto>(result, SnakeCaseOptions)
                ?? throw new InvalidOperationException("No se pudo deserializar la respuesta");
        }
    }
}