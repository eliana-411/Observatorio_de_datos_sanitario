using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los datos de municipios desde la API
/// </summary>
public class MunicipioDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Nombre Municipio")]    
    public string? NombreMunicipio { get; set; }
    [DisplayName("Nombre Departamento")]
    public string? NombreDepartamento { get; set; }
}

/// <summary>
/// DTO para los municipios almacenados en caché
/// </summary>
public class MunicipioInfoDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
    [DisplayName("Departamento")]
    public string? Departamento { get; set; }
}

/// <summary>
/// DTO para la respuesta de municipios
/// </summary>
public class MunicipioMapaDto
{
    [DisplayName("Código Municipio")]
    public string CodigoMunicipio { get; set; } = string.Empty;
    [DisplayName("Municipio")]
    public string Municipio { get; set; } = string.Empty;
    [DisplayName("Departamento")]
    public string Departamento { get; set; } = string.Empty;
    [DisplayName("Longitud")]
    public decimal? Longitud { get; set; }   
    [DisplayName("Latitud")]
    public decimal? Latitud { get; set; }    
}
