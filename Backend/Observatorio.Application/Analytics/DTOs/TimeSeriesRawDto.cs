namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para mapear resultados crudos de la consulta SQL por año/mes
/// </summary>
public class TimeSeriesRawDto
{
    public int anio { get; set; }
    public int mes { get; set; }
    public string nombre_mes { get; set; } = string.Empty;
    public DateTime fecha { get; set; }
    public int cantidad_eventos { get; set; }
    public int total_intentos { get; set; }
    public int casos_hospitalizados { get; set; }
}

/// <summary>
/// DTO para mapear resultados cuando agrupamos solo por año/mes (sin fecha individual)
/// </summary>
public class TimeSeriesByYearRawDto
{
    public int anio { get; set; }
    public int mes { get; set; }
    public string nombre_mes { get; set; } = string.Empty;
    public int cantidad_eventos { get; set; }
    public int total_intentos { get; set; }
    public int casos_hospitalizados { get; set; }
}

/// <summary>
/// DTO para mapear resultados agrupados por día
/// </summary>
public class TimeSeriesByDayRawDto
{
    public DateTime fecha { get; set; }
    public int cantidad_eventos { get; set; }
    public int total_intentos { get; set; }
    public int casos_hospitalizados { get; set; }
}

/// <summary>
/// DTO para mapear resultados agrupados por año (en rango de fechas)
/// </summary>
public class TimeSeriesByYearRangeRawDto
{
    public int anio { get; set; }
    public int cantidad_eventos { get; set; }
    public int total_intentos { get; set; }
    public int casos_hospitalizados { get; set; }
}
