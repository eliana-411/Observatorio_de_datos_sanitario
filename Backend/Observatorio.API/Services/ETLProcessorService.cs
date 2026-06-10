using System.IO;
using System.Net.Http;
using System.Text;
using Observatorio.Application.Common.Interfaces;

namespace Observatorio.API.Services;

/// <summary>
/// Servicio para procesar CSV con ETL sin guardar en disco local
/// </summary>
public class ETLProcessorService : IETLProcessorService
{
    private readonly ILogger<ETLProcessorService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _etlBaseUrl;

    public ETLProcessorService(ILogger<ETLProcessorService> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _etlBaseUrl = Environment.GetEnvironmentVariable("ETL_BASE_URL") ?? "http://localhost:8002";
    }

    /// <summary>
    /// Procesa un CSV en memoria y lo envía al ETL
    /// </summary>
    public async Task ProcessCsvInMemoryAsync(byte[] fileBytes, string fileName)
    {
        try
        {
            _logger.LogInformation($"[ETL Job] Iniciando procesamiento de {fileName} ({fileBytes.Length} bytes)");

            // Opción 1: Enviar directamente al ETL via HTTP
            await SendToETLAsync(fileBytes, fileName);

            _logger.LogInformation($"[ETL Job] Procesamiento completado para {fileName}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"[ETL Job] Error al procesar {fileName}");
            throw;
        }
    }

    /// <summary>
    /// Envía el archivo CSV al ETL mediante HTTP
    /// </summary>
    private async Task SendToETLAsync(byte[] fileBytes, string fileName)
    {
        using var client = _httpClientFactory.CreateClient();
        
        // Crear el contenido multipart
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/csv");
        
        content.Add(fileContent, "file", fileName);

        try
        {
            _logger.LogInformation($"[ETL] Enviando {fileName} a {_etlBaseUrl}/process-csv");
            
            var response = await client.PostAsync($"{_etlBaseUrl}/process-csv", content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"[ETL] Respuesta exitosa: {responseContent}");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"[ETL] Error en la respuesta: {response.StatusCode} - {errorContent}");
                throw new HttpRequestException($"ETL respondió con {response.StatusCode}: {errorContent}");
            }
        }
        catch (HttpRequestException ex) when (ex.InnerException is System.Net.Sockets.SocketException)
        {
            _logger.LogError($"[ETL] No se pudo conectar al ETL en {_etlBaseUrl}. Asegúrate de que está corriendo.");
            throw;
        }
    }

    /// <summary>
    /// Alternativa: Guardar temporalmente en memoria y leerlo directamente
    /// (útil si el ETL está en el mismo contenedor)
    /// </summary>
    private async Task ProcessLocallyAsync(byte[] fileBytes, string fileName)
    {
        try
        {
            _logger.LogInformation($"[ETL Local] Procesando {fileName} en memoria");

            // Convertir bytes a DataFrame simulado
            using var ms = new MemoryStream(fileBytes);
            using var reader = new StreamReader(ms);
            
            var csvContent = await reader.ReadToEndAsync();
            _logger.LogInformation($"[ETL Local] Contenido leído: {csvContent.Length} caracteres");

            // Aquí iría la lógica de procesamiento directa del ETL
            // Ej: Validación, transformación, carga a BD, etc.
            
            _logger.LogInformation($"[ETL Local] Procesamiento local completado para {fileName}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"[ETL Local] Error en procesamiento local de {fileName}");
            throw;
        }
    }
}
