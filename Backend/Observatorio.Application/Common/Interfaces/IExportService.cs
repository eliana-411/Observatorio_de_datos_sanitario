// namespace Observatorio.Application.Common.Interfaces;
namespace Observatorio.Application.Common.Interfaces;
public interface IExportService
{
    byte[] GenerarExcel<T>(List<T> datos, string nombreHoja = "Datos", 
        Dictionary<string, string>? customHeaders = null, 
        List<string>? excluirColumnas = null);
    
    byte[] GenerarPdf<T>(List<T> datos, string titulo = "Reporte", 
        Dictionary<string, string>? customHeaders = null, 
        List<string>? excluirColumnas = null);
    
    string GenerarCsv<T>(List<T> datos, 
        Dictionary<string, string>? customHeaders = null, 
        List<string>? excluirColumnas = null);
}