using System.ComponentModel;

namespace Observatorio.Application.Common.DTOs;

public class RegistroAplanadoDto
{
    [DisplayName("Código")]
    public string Codigo { get; set; } = string.Empty;
    
    [DisplayName("Nombre")]
    public string Nombre { get; set; } = string.Empty;
    
    [DisplayName("Categoría")]
    public string Categoria { get; set; } = string.Empty;
    
    [DisplayName("Subcategoría")]
    public string Subcategoria { get; set; } = string.Empty;
    
    [DisplayName("Valor 1")]
    public int Valor1 { get; set; }
    
    [DisplayName("Valor 2")]
    public int Valor2 { get; set; }
    
    [DisplayName("Porcentaje 1")]
    public decimal? Porcentaje1 { get; set; }
    
    [DisplayName("Porcentaje 2")]
    public decimal? Porcentaje2 { get; set; } 
    
    [DisplayName("Periodo")]
    public string Periodo { get; set; } = string.Empty;
}