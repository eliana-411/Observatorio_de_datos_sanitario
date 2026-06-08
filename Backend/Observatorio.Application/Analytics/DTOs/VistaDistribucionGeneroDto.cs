using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los datos de la vista de distribución por género
/// </summary>
public class VistaDistribucionGeneroDto
{
    [DisplayName("Género")]
    public string? Genero { get; set; }
    [DisplayName("Total")]
    public int Total { get; set; }
}

/// <summary>
/// DTO para la respuesta de la vista de distribución por género
/// </summary>
public class VistaDistribucionGeneroResponseDto
{
    [DisplayName("Datos")]
    public List<VistaDistribucionGeneroDto>? Data { get; set; }
}