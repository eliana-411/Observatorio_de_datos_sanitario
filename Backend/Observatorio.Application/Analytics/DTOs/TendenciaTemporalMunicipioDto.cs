namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un registro de tendencia temporal por municipio
/// </summary>
public class TendenciaTemporalMunicipioRegistroDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string? NombreMes { get; set; }
    public int TotalEventos { get; set; }
    public int Hospitalizados { get; set; }
}

/// <summary>
/// DTO para municipio con series de tendencia temporal
/// </summary>
public class TendenciaTemporalMunicipioSerieDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public List<TendenciaTemporalMesesDto>? Datos { get; set; }
}

/// <summary>
/// DTO para los datos mensuales de tendencia temporal
/// </summary>
public class TendenciaTemporalMesesDto
{
    public int Mes { get; set; }
    public string? NombreMes { get; set; }
    public int TotalEventos { get; set; }
    public decimal PorcentajeEventos { get; set; }
    public int Hospitalizados { get; set; }
    public decimal PorcentajeHospitalizados { get; set; }
}

/// <summary>
/// DTO para el período con año y mes opcional
/// </summary>
public class PeriodoFiltroDto
{
    public int Anio { get; set; }
    public int? Mes { get; set; }
}

/// <summary>
/// DTO para la respuesta de tendencia temporal por municipio
/// </summary>
public class TendenciaTemporalMunicipioResponseDto
{
    public PeriodoFiltroDto? Periodo { get; set; }
    public List<TendenciaTemporalMunicipioSerieDto>? Series { get; set; }
}

/// <summary>
/// DTO para datos crudos de tendencia temporal por municipio (usado en query)
/// </summary>
internal class TendenciaTemporalMunicipioRawDto
{
    public string? Municipio { get; set; }
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string? NombreMes { get; set; }
    public int TotalEventos { get; set; }
    public int Hospitalizados { get; set; }
}
