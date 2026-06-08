namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para recibir la distribución de anomalías por tipo
/// </summary>
public class AnomaliaDistribucionDto
{
    public string Status { get; set; } = string.Empty;
    public int TotalAnomalias { get; set; }
    public Dictionary<string, int> Distribucion { get; set; } = new();
    public Dictionary<string, int> PorSeveridad { get; set; } = new();
}