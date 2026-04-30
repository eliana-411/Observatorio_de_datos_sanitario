namespace Observatorio.Domain.Entities;

/// <summary>
/// Dimensión de Lugar - información geográfica
/// </summary>
public class Lugar
{
    public int Id { get; set; }
    public string MunicipioEvento { get; set; } = string.Empty;
    public string MunicipioOrigen { get; set; } = string.Empty;
    public string ZonaEvento { get; set; } = string.Empty;
    public string Departamento { get; set; } = "Caldas";
    public bool MismoMunicipio { get; set; }
    
    // Relación con Eventos
    public ICollection<Evento> Eventos { get; set; } = new List<Evento>();
}
