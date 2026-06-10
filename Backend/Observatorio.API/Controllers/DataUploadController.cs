using Microsoft.AspNetCore.Mvc;
using Hangfire;
using Observatorio.Application.Common.DTOs;
using System.IO;
using System.Net.Http;

namespace Observatorio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataUploadController : ControllerBase
{
    private readonly ILogger<DataUploadController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _etlBaseUrl;

    public DataUploadController(ILogger<DataUploadController> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _etlBaseUrl = Environment.GetEnvironmentVariable("ETL_BASE_URL") ?? "http://localhost:8002";
    }

    /// <summary>
    /// Sube un CSV para procesarlo en el ETL sin guardar en disco local
    /// </summary>
    [HttpPost("upload-csv")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadCsv(IFormFile file)
    {
        try
        {
            // Validar que el archivo existe y es un CSV
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("Intento de carga sin archivo");
                return BadRequest(new { message = "El archivo no puede estar vacío" });
            }

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning($"Intento de carga con archivo no CSV: {file.FileName}");
                return BadRequest(new { message = "Solo se aceptan archivos CSV" });
            }

            _logger.LogInformation($"Iniciando carga de CSV: {file.FileName} ({file.Length} bytes)");

            // Leer el archivo en memoria
            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            // Enqueuing el job de procesamiento de forma asincrónica con Hangfire
            string jobId = BackgroundJob.Enqueue<IETLProcessorService>(
                service => service.ProcessCsvInMemoryAsync(fileBytes, file.FileName)
            );

            _logger.LogInformation($"Job enqueued con ID: {jobId}");

            return Accepted(new 
            { 
                message = "El archivo ha sido encolado para procesamiento",
                jobId = jobId,
                fileName = file.FileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cargar el CSV");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = "Error al procesar el archivo", error = ex.Message });
        }
    }

    /// <summary>
    /// Consultar el estado de un job de procesamiento
    /// </summary>
    [HttpGet("job-status/{jobId}")]
    public IActionResult GetJobStatus(string jobId)
    {
        try
        {
            // Aquí se podría consultar el estado en Hangfire
            // Implementar según tus necesidades
            return Ok(new { jobId = jobId, message = "Implementar consulta de estado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar estado del job");
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { message = "Error al consultar estado", error = ex.Message });
        }
    }
}

/// <summary>
/// Interface para el servicio que procesa los CSV en memoria
/// </summary>
public interface IETLProcessorService
{
    Task ProcessCsvInMemoryAsync(byte[] fileBytes, string fileName);
}
