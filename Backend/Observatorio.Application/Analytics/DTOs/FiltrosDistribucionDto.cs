using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los filtros utilizados en la distribución de métodos
/// </summary>
public class FiltrosDistribucionDto
{
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }     
    [DisplayName("Rango de Edad")]
    public string? RangoEdad { get; set; }      
    [DisplayName("Género")]
    public string? Genero { get; set; }          
    [DisplayName("Año")]
    public int? Anio { get; set; }     
    [DisplayName("Hospitalizado")]
    public string? Hospitalizado { get; set; }       
}