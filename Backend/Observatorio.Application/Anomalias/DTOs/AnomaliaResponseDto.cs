namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para recibir la respuesta de detección de anomalías desde FastAPI
/// </summary>
public class AnomaliaResponseDto
{
    public string Status { get; set; } = string.Empty;
    public bool EsAnomalia { get; set; }
    public float? Puntuacion { get; set; }
    public float? Threshold { get; set; }
    public AnomaliaDetalleDto? Detalle { get; set; }
    public string Mensaje { get; set; } = string.Empty;
}