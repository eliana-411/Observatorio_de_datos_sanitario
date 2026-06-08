namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para recibir el detalle completo de una anomalía específica
/// </summary>
public class AnomaliaDetalleCompletoDto
{
    public string Status { get; set; } = string.Empty;
    public int IdRegistro { get; set; }
    public string TipoAnomalia { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Severidad { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public float AnomalyScore { get; set; }
    public Dictionary<string, object> DatosCompletos { get; set; } = new();
}