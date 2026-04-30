namespace Observatorio.Domain.Entities;

/// <summary>
/// Dimensión de Atención - resultado de la atención médica
/// </summary>
public class Atencion
{
    public int Id { get; set; }
    public string ResultadoAtencion { get; set; } = string.Empty;
    public string TipoResultado { get; set; } = string.Empty; // Recuperado, Grave, Remitido, Otro
    public bool RequiereHospitalizacion { get; set; }
    
    // Relación con Eventos
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}
