namespace Observatorio.Application.Common.Interfaces;

/// <summary>
/// Interface para el servicio que procesa CSV en memoria sin guardar en disco local
/// </summary>
public interface IETLProcessorService
{
    /// <summary>
    /// Procesa un archivo CSV que está en memoria
    /// </summary>
    /// <param name="fileBytes">Contenido del archivo en bytes</param>
    /// <param name="fileName">Nombre del archivo</param>
    Task ProcessCsvInMemoryAsync(byte[] fileBytes, string fileName);
}
