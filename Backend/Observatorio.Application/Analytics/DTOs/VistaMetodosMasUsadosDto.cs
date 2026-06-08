using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

public class VistaMetodosMasUsadosDto
{
    [DisplayName("Método")]
    public string? metodo { get; set; }
    [DisplayName("Total")]
    public int total { get; set; }
}

public class VistaMetodosMasUsadosResponseDto
{
    [DisplayName("Datos")]
    public List<VistaMetodosMasUsadosDto>? Data { get; set; }
}