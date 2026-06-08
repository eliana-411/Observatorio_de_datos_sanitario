using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para un registro de casos por municipio
/// </summary>
public class CasosPorMunicipioRegistroDto
{
    [DisplayName("Código Municipio")]
    public string? CodigoMunicipio { get; set; }
    [DisplayName("Municipio")]
    public string? Municipio { get; set; }
    [DisplayName("Total Eventos")]
    public int TotalEventos { get; set; }
    [DisplayName("Porcentaje")]
    public decimal Porcentaje { get; set; }
}

/// <summary>
/// DTO para la respuesta de casos por municipio
/// </summary>
public class CasosPorMunicipioResponseDto
{
    [DisplayName("Periodo")]
    public PeriodoDto? Periodo { get; set; }
    [DisplayName("Total General")]
    public int TotalGeneral { get; set; }
    [DisplayName("Máximo")]
    public int Maximo { get; set; }
    [DisplayName("Mínimo")]
    public int Minimo { get; set; }
    [DisplayName("Series")]
    public List<CasosPorMunicipioRegistroDto>? Series { get; set; }
}

/// <summary>
/// DTO para el período (año)
/// </summary>
public class PeriodoDto
{
    [DisplayName("Año")]
    public int Anio { get; set; }
}
