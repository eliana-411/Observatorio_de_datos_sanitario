namespace Observatorio.Domain.Entities;

/// <summary>
/// Dimensión de Método - método de intento
/// </summary>
public class Metodo
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string TipoMetodo { get; set; } = string.Empty; // Quimico, Mecanico, Violento, Otro
    public string NivelLatalidad { get; set; } = string.Empty; // Alto, Bajo
    
    // Relación con Eventos
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}
