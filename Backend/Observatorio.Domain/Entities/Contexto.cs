namespace Observatorio.Domain.Entities;

/// <summary>
/// Dimensión de Contexto - factores de riesgo
/// </summary>
public class Contexto
{
    public int Id { get; set; }
    public string AntecedenteSaludMental { get; set; } = string.Empty;
    public string ConsumoSustancias { get; set; } = string.Empty;
    public bool TieneAntecedente { get; set; }
    public bool ConsumeSustanciasFlag { get; set; }
    
    // Relación con Eventos
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}
