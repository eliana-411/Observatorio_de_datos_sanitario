namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para el estado de hospitalización en la distribución
/// </summary>
public class HospitalizacionDistribucionDto
{
    public int Hospitalizado { get; set; }
    public string? Estado { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de hospitalización
/// </summary>
public class DistribucionHospitalizacionMunicipioRegistroDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public int TotalEventos { get; set; }
    public List<HospitalizacionDistribucionDto>? Estados { get; set; }
}

/// <summary>
/// DTO para la respuesta de distribución de hospitalización por municipio
/// </summary>
public class DistribucionHospitalizacionMunicipioResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public List<DistribucionHospitalizacionMunicipioRegistroDto>? Series { get; set; }
}
