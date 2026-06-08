using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para el estado de hospitalización en la distribución
/// </summary>
public class HospitalizacionDistribucionDto
{
    [DisplayName("Hospitalizado")]
    public int Hospitalizado { get; set; }
    [DisplayName("Estado")]
    public string? Estado { get; set; }
    [DisplayName("Total")]
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de hospitalización
/// </summary>
public class DistribucionHospitalizacionMunicipioRegistroDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
    [DisplayName("Total Eventos")]
    public int TotalEventos { get; set; }
    [DisplayName("Estados")]
    public List<HospitalizacionDistribucionDto>? Estados { get; set; }
}

/// <summary>
/// DTO para la respuesta de distribución de hospitalización por municipio
/// </summary>
public class DistribucionHospitalizacionMunicipioResponseDto
{
    [DisplayName("Periodo")]
    public PeriodoDto? Periodo { get; set; }
    [DisplayName("Series")]
    public List<DistribucionHospitalizacionMunicipioRegistroDto>? Series { get; set; }
}
