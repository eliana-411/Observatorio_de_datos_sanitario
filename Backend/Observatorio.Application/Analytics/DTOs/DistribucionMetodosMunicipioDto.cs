namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un método específico en la distribución
/// </summary>
public class MetodoDistribucionDto
{
    public string? Metodo { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de métodos
/// </summary>
public class DistribucionMetodosMunicipioRegistroDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public int TotalEventos { get; set; }
    public List<MetodoDistribucionDto>? Metodos { get; set; }
}

/// <summary>
/// DTO para la respuesta de distribución de métodos por municipio
/// </summary>
public class DistribucionMetodosMunicipioResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public List<DistribucionMetodosMunicipioRegistroDto>? Series { get; set; }
}
