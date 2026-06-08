using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los datos de la vista de distribución por grupo etario
/// </summary>
public class VistaDistribucionGrupoEtarioDto
{
    [DisplayName("Grupo Etario")]
    public string? grupoEtario { get; set; }
    [DisplayName("Total")]
    public int total { get; set; }
}

/// <summary>
/// DTO para la respuesta de la vista de distribución por grupo etario
/// </summary>
public class VistaDistribucionGrupoEtarioResponseDto
{
    [DisplayName("Datos")]
    public List<VistaDistribucionGrupoEtarioDto>? Data { get; set; }
}