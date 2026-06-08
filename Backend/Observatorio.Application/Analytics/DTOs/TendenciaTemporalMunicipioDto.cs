using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un registro de tendencia temporal por municipio
/// </summary>
public class TendenciaTemporalMunicipioRegistroDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
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

/// <summary>
/// DTO para municipio con series de tendencia temporal
/// </summary>
public class TendenciaTemporalMunicipioSerieDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
    public List<TendenciaTemporalMesesDto>? Datos { get; set; }
}

/// <summary>
/// DTO para los datos mensuales de tendencia temporal
/// </summary>
public class TendenciaTemporalMesesDto
{
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
/// DTO para el período con año y mes opcional
/// </summary>
public class PeriodoFiltroDto
{
    [DisplayName("Año")]
    public int Anio { get; set; }
    [DisplayName("Mes")]
    public int? Mes { get; set; }
}

/// <summary>
/// DTO para la respuesta de tendencia temporal por municipio
/// </summary>
public class TendenciaTemporalMunicipioResponseDto
{
    [DisplayName("Periodo")]
    public PeriodoFiltroDto? Periodo { get; set; }
    [DisplayName("Series")]
    public List<TendenciaTemporalMunicipioSerieDto>? Series { get; set; }
}

/// <summary>
/// DTO para datos crudos de tendencia temporal por municipio (usado en query)
/// </summary>
internal class TendenciaTemporalMunicipioRawDto
{
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
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
