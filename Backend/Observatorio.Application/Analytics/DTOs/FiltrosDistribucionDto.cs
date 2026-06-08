namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los filtros utilizados en la distribución de métodos
/// </summary>
public class FiltrosDistribucionDto
{
    public string? Municipio { get; set; }     
    public string? RangoEdad { get; set; }      
    public string? Genero { get; set; }          
    public int? Anio { get; set; }     
    public string? Hospitalizado { get; set; }       
}