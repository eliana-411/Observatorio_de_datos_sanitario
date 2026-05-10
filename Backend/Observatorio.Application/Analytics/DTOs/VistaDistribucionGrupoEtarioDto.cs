namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los datos de la vista de distribución por grupo etario
/// </summary>
public class VistaDistribucionGrupoEtarioDto
{
    public string? grupoEtario { get; set; }
    public int total { get; set; }
}

/// <summary>
/// DTO para la respuesta de la vista de distribución por grupo etario
/// </summary>
public class VistaDistribucionGrupoEtarioResponseDto
{
    public List<VistaDistribucionGrupoEtarioDto>? Data { get; set; }
}