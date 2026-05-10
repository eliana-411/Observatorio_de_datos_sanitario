namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los datos de la vista de distribución por género
/// </summary>
public class VistaDistribucionGeneroDto
{
    public string? Genero { get; set; }
    public int Total { get; set; }
}

/// <summary>
/// DTO para la respuesta de la vista de distribución por género
/// </summary>
public class VistaDistribucionGeneroResponseDto
{
    public List<VistaDistribucionGeneroDto>? Data { get; set; }
}