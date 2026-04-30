namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para series agrupadas por año/mes
/// </summary>
public class TimeSeriesByYearDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string NombreMes { get; set; } = string.Empty;
    public int TotalEventos { get; set; }
    public int TotalIntentos { get; set; }
    public int TotalHospitalizados { get; set; }
}

/// <summary>
/// DTO para series agrupadas por fecha (día/mes/año)
/// </summary>
public class TimeSeriesByDateDto
{
    public DateTime? Fecha { get; set; }
    public int? Anio { get; set; }
    public int? Mes { get; set; }
    public string? NombreMes { get; set; }
    public int TotalEventos { get; set; }
    public int TotalIntentos { get; set; }
    public int TotalHospitalizados { get; set; }
}

/// <summary>
/// Respuesta para rango de fechas con agrupación dinámica
/// </summary>
public class TimeSeriesByDateRangeResponseDto
{
    /// <summary>
    /// Tipo de agrupación: "dia", "mes", "año"
    /// </summary>
    public string Agrupacion { get; set; } = string.Empty;
    
    public List<TimeSeriesByDateDto> Series { get; set; } = new();
}

/// <summary>
/// Respuesta para consulta por años
/// </summary>
public class TimeSeriesByYearResponseDto
{
    public List<TimeSeriesByYearDto> Series { get; set; } = new();
}
