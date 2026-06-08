using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para la distribución geográfica de eventos
/// </summary>
public class DistribucionGeograficaDto
{
    [DisplayName("Código Municipio")]
    public string CodigoMunicipio { get; set; } = string.Empty;
    [DisplayName("Municipio")]
    public string NombreMunicipio { get; set; } = string.Empty;
    [DisplayName("Latitud")]
    public decimal? Latitud { get; set; }
    [DisplayName("Longitud")]
    public decimal? Longitud { get; set; }
    [DisplayName("Total Casos")]
    public int TotalCasos { get; set; }
    [DisplayName("Hospitalizados")]
    public int Hospitalizados { get; set; }
    [DisplayName("No Hospitalizados")]
    public int NoHospitalizados => TotalCasos - Hospitalizados;
    [DisplayName("Tasa Hospitalización %")]
    public decimal TasaHospitalizacion { get; set; }
    [DisplayName("Tasa No Hospitalización %")]
    public decimal TasaNoHospitalizacion => TotalCasos > 0 
    ? Math.Round((decimal)NoHospitalizados / TotalCasos * 100, 2): 0;
}