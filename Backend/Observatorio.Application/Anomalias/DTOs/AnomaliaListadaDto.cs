namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para una anomalía en el listado de resultados
/// </summary>
public class AnomaliaListadaDto
{
    public int IdRegistro { get; set; }
    public string Fecha { get; set; } = string.Empty;
    public string MunicipioEvento { get; set; } = string.Empty;
    public string TipoAnomalia { get; set; } = string.Empty;
    public string DescripcionAnomalia { get; set; } = string.Empty;
    public string Severidad { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public float AnomalyScore { get; set; }
    public int Edad { get; set; }
    public string Genero { get; set; } = string.Empty;
    public string Metodo { get; set; } = string.Empty;
}