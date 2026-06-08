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
    public byte[] GenerarExcel<T>(List<T> datos, string nombreHoja = "Datos")
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(nombreHoja);

        var propiedades = GetPropiedadesVisibles<T>();

        // Encabezados con DisplayName
        for (int i = 0; i < propiedades.Count; i++)
        {
            var displayName = GetDisplayName(propiedades[i]);
            worksheet.Cell(1, i + 1).Value = displayName;
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
                cell.Value = valor?.ToString() ?? "";   

                if (row % 2 == 1)
                {
                    cell.Style.Fill.BackgroundColor = XLColor.LightGray;
                }
                // worksheet.Cell(row + 2, col + 1).Value = valor?.ToString() ?? "";
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerarPdf<T>(List<T> datos, string titulo = "Reporte")
    {
        var propiedades = GetPropiedadesVisibles<T>();

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

                    // Encabezados con DisplayName
                    table.Header(header =>
                    {
                        foreach (var prop in propiedades)
                        {
                            var displayName = GetDisplayName(prop);
                            header.Cell().Text(displayName).Bold();
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

    public string GenerarCsv<T>(List<T> datos)
    {
        var propiedades = GetPropiedadesVisibles<T>();
        var sb = new StringBuilder();

        // Línea mágica para Excel (SEP=; le dice el separador)
        sb.AppendLine("sep=;");

        // Encabezados con DisplayName
        var encabezados = propiedades.Select(p => GetDisplayName(p));
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

    private static List<PropertyInfo> GetPropiedadesVisibles<T>()
    {
        return typeof(T).GetProperties()
            .Where(p => !p.GetCustomAttributes(typeof(System.Text.Json.Serialization.JsonIgnoreAttribute), false).Any())
            .ToList();
    }

    private static string GetDisplayName(PropertyInfo propiedad)
    {
        var atributo = propiedad.GetCustomAttribute<DisplayNameAttribute>();
        return atributo?.DisplayName ?? propiedad.Name;
    }
}
