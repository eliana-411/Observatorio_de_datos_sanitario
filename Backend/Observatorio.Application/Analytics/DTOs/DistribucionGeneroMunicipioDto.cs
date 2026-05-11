namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un género específico en la distribución
/// </summary>
public class GeneroDistribucionDto
{
    public string? Genero { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de género
/// </summary>
public class DistribucionGeneroMunicipioRegistroDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public int TotalEventos { get; set; }
    public List<GeneroDistribucionDto>? Generos { get; set; }
}

/// <summary>
/// DTO para la respuesta de distribución de género por municipio
/// </summary>
public class DistribucionGeneroMunicipioResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public List<DistribucionGeneroMunicipioRegistroDto>? Series { get; set; }
}
