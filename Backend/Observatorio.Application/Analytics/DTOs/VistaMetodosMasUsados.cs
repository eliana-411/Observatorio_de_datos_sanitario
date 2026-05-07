namespace Observatorio.Application.Analytics.DTOs;

public class VistaMetodosMasUsadosDto
{
    public string? metodo { get; set; }
    public int total { get; set; }
}

public class VistaMetodosMasUsadosResponseDto
{
    public List<VistaMetodosMasUsadosDto>? Data { get; set; }
}