namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un registro de tendencia temporal (mes)
/// </summary>
public class TendenciaTemporalRegistroDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string? NombreMes { get; set; }
    public int TotalEventos { get; set; }
    public decimal PorcentajeEventos { get; set; }
    public int Hospitalizados { get; set; }
    public decimal PorcentajeHospitalizados { get; set; }
}

/// <summary>
/// DTO para la respuesta de tendencia temporal
/// </summary>
public class TendenciaTemporalResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public List<TendenciaTemporalRegistroDto>? Series { get; set; }
}

/// <summary>
/// DTO para datos crudos de tendencia temporal (usado en query)
/// </summary>
public class TendenciaTemporalRawDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string? NombreMes { get; set; }
    public int TotalEventos { get; set; }
    public int Hospitalizados { get; set; }
}
