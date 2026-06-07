namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para recibir el listado de anomalías desde FastAPI
/// </summary>
public class AnomaliaListResponseDto
{
    public string Status { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Pagina { get; set; }
    public List<AnomaliaListadaDto> Anomalias { get; set; } = new();
}