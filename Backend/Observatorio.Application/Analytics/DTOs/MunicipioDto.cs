namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para los datos de municipios desde la API
/// </summary>
public class MunicipioDto
{
    public string? CodigoMunicipio { get; set; }
    public string? NombreMunicipio { get; set; }
    public string? NombroDepartamento { get; set; }
}

/// <summary>
/// DTO para los municipios almacenados en caché
/// </summary>
public class MunicipioInfoDto
{
    public string? CodigoMunicipio { get; set; }
    public string? Municipio { get; set; }
    public string? Departamento { get; set; }
}
