namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un registro de índice de severidad por método
/// </summary>
public class IndiceSeveridadRegistroDto
{
    public string? Metodo { get; set; }
    public int TotalEventos { get; set; }
    public int Hospitalizados { get; set; }
    public decimal PorcentajeHospitalizacion { get; set; }
    public decimal PromedioReincidencias { get; set; }
    public decimal IndiceSeveridad { get; set; }
}

/// <summary>
/// DTO para la respuesta del índice de severidad
/// </summary>
public class IndiceSeveridadResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public List<IndiceSeveridadRegistroDto>? Series { get; set; }
}
