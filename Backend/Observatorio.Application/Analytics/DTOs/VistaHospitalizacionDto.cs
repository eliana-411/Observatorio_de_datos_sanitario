namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO auxiliar para mapear datos crudos de la BD
/// </summary>
internal class VistaHospitalizacionRawDto
{
    public bool hospitalizado { get; set; }
    public int total { get; set; }
}

/// <summary>
/// DTO para los datos de la vista de hospitalización
/// </summary>
public class VistaHospitalizacionDto
{
    /// <summary>
    /// 1 = Hospitalizado, 0 = No Hospitalizado
    /// </summary>
    public int Hospitalizado { get; set; }
    
    /// <summary>
    /// Descripción legible del estado
    /// </summary>
    public string Estado { get; set; } = string.Empty;
    
    /// <summary>
    /// Total de casos
    /// </summary>
    public int Total { get; set; }
}

/// <summary>
/// DTO para la respuesta de la vista de hospitalización
/// </summary>
public class VistaHospitalizacionResponseDto
{
    public List<VistaHospitalizacionDto>? Data { get; set; }
}