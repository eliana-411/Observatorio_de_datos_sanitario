namespace Observatorio.Application.Analytics.DTOs;

public class PiramidePoblacionalDto
{
    public string Genero { get; set; } = string.Empty;
    public string GrupoEtario { get; set; } = string.Empty;
    public int Total { get; set; }
}

public class PiramidePoblacionalResponseDto
{
    public List<PiramidePoblacionalDto> Data { get; set; } = new();
}