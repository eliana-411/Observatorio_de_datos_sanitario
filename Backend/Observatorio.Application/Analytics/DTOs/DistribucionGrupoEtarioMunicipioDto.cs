namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un grupo etario específico en la distribución
/// </summary>
public class GrupoEtarioDistribucionDto
{
    public string? GrupoEtario { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de grupo etario
/// </summary>
public class DistribucionGrupoEtarioMunicipioRegistroDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public int TotalEventos { get; set; }
    public List<GrupoEtarioDistribucionDto>? GruposEtarios { get; set; }
}

/// <summary>
/// DTO para la respuesta de distribución de grupo etario por municipio
/// </summary>
public class DistribucionGrupoEtarioMunicipioResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public List<DistribucionGrupoEtarioMunicipioRegistroDto>? Series { get; set; }
}
