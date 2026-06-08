using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un género específico en la distribución
/// </summary>
public class GeneroDistribucionDto
{
    [DisplayName("Género")]
    public string? Genero { get; set; }
    [DisplayName("Total Eventos")]
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de género
/// </summary>
public class DistribucionGeneroMunicipioRegistroDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
    [DisplayName("Total Eventos")]
    public int TotalEventos { get; set; }
    [DisplayName("Géneros")]
    public List<GeneroDistribucionDto>? Generos { get; set; }
}

/// <summary>
/// DTO para la respuesta de distribución de género por municipio
/// </summary>
public class DistribucionGeneroMunicipioResponseDto
{
    [DisplayName("Periodo")]
    public PeriodoDto? Periodo { get; set; }
    [DisplayName("Series")]
    public List<DistribucionGeneroMunicipioRegistroDto>? Series { get; set; }
}
