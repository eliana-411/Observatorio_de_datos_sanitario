namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para la distribución geográfica de eventos
/// </summary>
public class DistribucionGeograficaDto
{
    public string CodigoMunicipio { get; set; } = string.Empty;
    public string NombreMunicipio { get; set; } = string.Empty;
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
    public int TotalCasos { get; set; }
    public int Hospitalizados { get; set; }
    public int NoHospitalizados => TotalCasos - Hospitalizados;
    public decimal TasaHospitalizacion { get; set; }
    public decimal TasaNoHospitalizacion => TotalCasos > 0 
    ? Math.Round((decimal)NoHospitalizados / TotalCasos * 100, 2): 0;
}