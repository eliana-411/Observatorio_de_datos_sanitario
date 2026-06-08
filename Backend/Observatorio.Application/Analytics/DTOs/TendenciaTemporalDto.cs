using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un registro de tendencia temporal (mes)
/// </summary>
public class TendenciaTemporalRegistroDto
{
    [DisplayName("Año")]
    public int Anio { get; set; }
    [DisplayName("Mes")]
    public int Mes { get; set; }
    [DisplayName("Nombre Mes")]
    public string? NombreMes { get; set; }
    [DisplayName("Total Eventos")]
    public int TotalEventos { get; set; }
    [DisplayName("Porcentaje Eventos")]
    public decimal PorcentajeEventos { get; set; }
    [DisplayName("Hospitalizados")]
    public int Hospitalizados { get; set; }
    [DisplayName("Porcentaje Hospitalizados")]
    public decimal PorcentajeHospitalizados { get; set; }
}

/// <summary>
/// DTO para la respuesta de tendencia temporal
/// </summary>
public class TendenciaTemporalResponseDto
{
    [DisplayName("Periodo")]
    public PeriodoDto? Periodo { get; set; }
    [DisplayName("Series")]
    public List<TendenciaTemporalRegistroDto>? Series { get; set; }
}

/// <summary>
/// DTO para datos crudos de tendencia temporal (usado en query)
/// </summary>
public class TendenciaTemporalRawDto
{
    [DisplayName("Año")]
    public int Anio { get; set; }
    [DisplayName("Mes")]
    public int Mes { get; set; }
    [DisplayName("Nombre Mes")]
    public string? NombreMes { get; set; }
    [DisplayName("Total Eventos")]
    public int TotalEventos { get; set; }
    [DisplayName("Hospitalizados")]
    public int Hospitalizados { get; set; }
}
