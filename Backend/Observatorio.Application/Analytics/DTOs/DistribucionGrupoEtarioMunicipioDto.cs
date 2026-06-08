using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un grupo etario específico en la distribución
/// </summary>
public class GrupoEtarioDistribucionDto
{
    [DisplayName("Grupo Etario")]
    public string? GrupoEtario { get; set; }
    [DisplayName("Total")]
    public int Total { get; set; }
}

/// <summary>
/// DTO para un municipio en la distribución de grupo etario
/// </summary>
public class DistribucionGrupoEtarioMunicipioRegistroDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
    [DisplayName("Total Eventos")]
    public int TotalEventos { get; set; }
    [DisplayName("Grupos Etarios")]
    public List<GrupoEtarioDistribucionDto>? GruposEtarios { get; set; }
}

/// <summary>
/// DTO para la respuesta de distribución de grupo etario por municipio
/// </summary>
public class DistribucionGrupoEtarioMunicipioResponseDto
{
    [DisplayName("Periodo")]
    public PeriodoDto? Periodo { get; set; }
    [DisplayName("Series")]
    public List<DistribucionGrupoEtarioMunicipioRegistroDto>? Series { get; set; }
}
