namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para el detalle de una anomalía detectada
/// </summary>
public class AnomaliaDetalleDto
{
    public string TipoAnomalia { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Severidad { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
}