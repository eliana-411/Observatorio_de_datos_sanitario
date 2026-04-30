namespace Observatorio.Domain.Entities;

/// <summary>
/// Dimensión de Tiempo - datos temporales
/// </summary>
public class Tiempo
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public int Anio { get; set; }
    public int Mes { get; set; }
    public int Trimestre { get; set; }
    public string NombreMes { get; set; } = string.Empty;
    public string DiaSemana { get; set; } = string.Empty;
    public bool EsFinDeSemana { get; set; }
    
    // Relación con Eventos
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}
