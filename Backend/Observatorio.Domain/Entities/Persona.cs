namespace Observatorio.Domain.Entities;

/// <summary>
/// Dimensión de Persona - datos demográficos
/// </summary>
public class Persona
{
    public int Id { get; set; }
    public string Genero { get; set; } = string.Empty;
    public int Edad { get; set; }
    public string Estrato { get; set; } = string.Empty;
    public string GrupoAgeRatio { get; set; } = string.Empty; // Adolescente, Joven, Adulto, Adulto Mayor
    public string GrupoPoblacional { get; set; } = string.Empty;
    public string EstadoCivil { get; set; } = string.Empty;
    public string SituacionSentimental { get; set; } = string.Empty;
    
    // Relación con Eventos
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}
