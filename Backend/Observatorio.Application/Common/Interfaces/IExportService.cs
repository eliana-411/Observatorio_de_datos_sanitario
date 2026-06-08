// namespace Observatorio.Application.Common.Interfaces;
namespace Observatorio.Application.Common.Interfaces;
public interface IExportService
{
    byte[] GenerarExcel<T>(List<T> datos, string nombreHoja = "Datos");
    byte[] GenerarPdf<T>(List<T> datos, string titulo = "Reporte");
    string GenerarCsv<T>(List<T> datos);
}