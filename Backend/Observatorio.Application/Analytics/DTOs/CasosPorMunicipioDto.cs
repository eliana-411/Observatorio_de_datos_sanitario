namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un registro de casos por municipio
/// </summary>
public class CasosPorMunicipioRegistroDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public int TotalEventos { get; set; }
    public decimal Porcentaje { get; set; }
}

/// <summary>
/// DTO para la respuesta de casos por municipio
/// </summary>
public class CasosPorMunicipioResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public int TotalGeneral { get; set; }
    public int Maximo { get; set; }
    public int Minimo { get; set; }
    public List<CasosPorMunicipioRegistroDto>? Series { get; set; }
}

/// <summary>
/// DTO para el período (año)
/// </summary>
public class PeriodoDto
{
    public int Anio { get; set; }
}
