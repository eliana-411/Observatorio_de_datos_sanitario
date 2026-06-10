using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un método específico en la distribución
/// </summary>
public class MetodoDistribucionDto
{
    [DisplayName("Método")]
    public string? Metodo { get; set; }
    [DisplayName("Total")]
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de métodos
/// </summary>
public class DistribucionMetodosMunicipioRegistroDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
    [DisplayName("Total Eventos")]
    public int TotalEventos { get; set; }
    [DisplayName("Metodos")]
    public List<MetodoDistribucionDto> Metodos { get; set; } = new();
}

/// <summary>
/// DTO para la respuesta de distribución de métodos por municipio
/// </summary>
public class DistribucionMetodosMunicipioResponseDto
{
    [DisplayName("Periodo")]
    public PeriodoDto? Periodo { get; set; }
    [DisplayName("Series")]
    public List<DistribucionMetodosMunicipioRegistroDto> Series { get; set; } = new();
}
