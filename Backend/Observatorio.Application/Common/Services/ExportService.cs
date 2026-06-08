
using System.ComponentModel;
using System.Reflection;
using System.Text;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Observatorio.Application.Common.Interfaces;

namespace Observatorio.Application.Common.Services;

public class ExportService : IExportService
{
    public byte[] GenerarExcel<T>(List<T> datos, string nombreHoja = "Datos", Dictionary<string, string>? customHeaders = null, List<string>? excluirColumnas = null)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(nombreHoja);

        var propiedades = GetPropiedadesVisibles<T>(excluirColumnas, customHeaders);

        // Encabezados: customHeaders primero, luego DisplayName, luego nombre de propiedad
        for (int i = 0; i < propiedades.Count; i++)
        {
            var headerName = GetHeaderName(propiedades[i], customHeaders);
            worksheet.Cell(1, i + 1).Value = headerName;
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
            worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightBlue;
        }

        // Datos
        for (int row = 0; row < datos.Count; row++)
        {
            for (int col = 0; col < propiedades.Count; col++)
            {
                var valor = propiedades[col].GetValue(datos[row]);
                var cell = worksheet.Cell(row + 2, col + 1);
                // si cell es null dejar vacio
                cell.Value = valor?.ToString() ?? "";

                if (row % 2 == 1)
                {
                    cell.Style.Fill.BackgroundColor = XLColor.LightGray;
                }
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerarPdf<T>(List<T> datos, string titulo = "Reporte", Dictionary<string, string>? customHeaders = null, List<string>? excluirColumnas = null)
    {
        var propiedades = GetPropiedadesVisibles<T>(excluirColumnas, customHeaders);

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(2, Unit.Centimetre);

                page.Header().Text(titulo)
                    .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                page.Content().Table(table =>
                {
                    // Columnas dinámicas
                    table.ColumnsDefinition(columns =>
                    {
                        foreach (var _ in propiedades)
                            columns.RelativeColumn();
                    });

                    // Encabezados
                    table.Header(header =>
                    {
                        foreach (var prop in propiedades)
                        {
                            var headerName = GetHeaderName(prop, customHeaders);
                            if (headerName != null)
                                header.Cell().Text(headerName).Bold();
                        }
                    });

                    // Datos
                    foreach (var item in datos)
                    {
                        foreach (var prop in propiedades)
                        {
                            var valor = prop.GetValue(item)?.ToString() ?? "";
                            table.Cell().Text(valor);
                        }
                    }
                });

                page.Footer().Text($"Generado el {DateTime.Now:dd/MM/yyyy HH:mm}")
                    .FontSize(10).FontColor(Colors.Grey.Medium);
            });
        });

        return document.GeneratePdf();
    }

    public string GenerarCsv<T>(List<T> datos, Dictionary<string, string>? customHeaders = null, List<string>? excluirColumnas = null)
    {
        var propiedades = GetPropiedadesVisibles<T>(excluirColumnas, customHeaders);
        var sb = new StringBuilder();

        // Línea mágica para Excel (SEP=; le dice el separador)
        sb.AppendLine("sep=;");

        // Encabezados
        var encabezados = propiedades.Select(p => GetHeaderName(p, customHeaders));
        sb.AppendLine(string.Join(";", encabezados));

        // Datos
        foreach (var item in datos)
        {
            var valores = propiedades.Select(p =>
            {
                var valor = p.GetValue(item)?.ToString() ?? "";
                if (valor.Contains(';')) valor = $"\"{valor}\"";
                return valor;
            });
            sb.AppendLine(string.Join(";", valores));
        }

        return sb.ToString();
    }

    // ========== MÉTODOS PRIVADOS AUXILIARES ==========

    private static List<PropertyInfo> GetPropiedadesVisibles<T>(List<string>? excluirColumnas = null, Dictionary<string, string>? customHeaders = null)
    {
        var props = typeof(T).GetProperties()
            .Where(p => !p.GetCustomAttributes(typeof(System.Text.Json.Serialization.JsonIgnoreAttribute), false).Any())
            .ToList();
        
        if (excluirColumnas != null && excluirColumnas.Any())
        {
            props = props.Where(p => !excluirColumnas.Contains(p.Name)).ToList();
        }
        
        // También excluir si customHeaders tiene la clave con valor vacío
        if (customHeaders != null)
        {
            props = props.Where(p => 
                !customHeaders.ContainsKey(p.Name) || 
                !string.IsNullOrEmpty(customHeaders[p.Name])
            ).ToList();
        }
        
        return props;
    }

    private static string GetDisplayName(PropertyInfo propiedad)
    {
        var atributo = propiedad.GetCustomAttribute<DisplayNameAttribute>();
        return atributo?.DisplayName ?? propiedad.Name;
    }

    // NUEVO: Obtiene header según prioridad: customHeaders > DisplayName > nombre propiedad
    private static string? GetHeaderName(PropertyInfo propiedad, Dictionary<string, string>? customHeaders)
    {
        if (customHeaders != null && customHeaders.ContainsKey(propiedad.Name))
        {
            var valor = customHeaders[propiedad.Name];
            // Si el valor es vacío, retornar null para indicar que se excluya
            if (string.IsNullOrEmpty(valor))
                return null;
            return valor;
        }

        return GetDisplayName(propiedad);
    }
}
