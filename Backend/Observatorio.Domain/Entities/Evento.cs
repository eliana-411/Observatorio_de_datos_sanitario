namespace Observatorio.Domain.Entities;

/// <summary>
/// Tabla de Hechos - Registro de intento de suicidio
/// </summary>
public class Evento
{
    public int Id { get; set; } // id_registro
    
    // Foreign Keys
    public int IdTiempo { get; set; }
    public int IdPersona { get; set; }
    public int IdLugar { get; set; }
    public int IdMetodo { get; set; }
    public int IdAtencion { get; set; }
    public int IdContexto { get; set; }
    
    // Medidas
    public bool Hospitalizado { get; set; }
    public int CantidadIntentos { get; set; } = 1;
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Relaciones de navegación
    public Tiempo? Tiempo { get; set; }
    public Persona? Persona { get; set; }
    public Lugar? Lugar { get; set; }
    public Metodo? Metodo { get; set; }
    public Atencion? Atencion { get; set; }
    public Contexto? Contexto { get; set; }
}
