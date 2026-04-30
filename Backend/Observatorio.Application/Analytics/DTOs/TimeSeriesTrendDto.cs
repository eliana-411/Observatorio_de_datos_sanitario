namespace Observatorio.Application.Analytics.DTOs;

/// DTO para la analítica de tendencia de eventos en el tiempo
/// Muestra cómo evolucionan los eventos (casos) a lo largo del tiempo
public class TimeSeriesTrendDto
{
    public int Anio { get; set; }
    public int Mes { get; set; }
    public string NombreMes { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public int CantidadEventos { get; set; }
    public int TotalIntentos { get; set; }
    public int CasosHospitalizados { get; set; }
    public decimal TasaHospitalizacion { get; set; }
}


// Resumen de la tendencia con estadísticas globales

public class TrendSummaryDto
{
    public List<TimeSeriesTrendDto> Series { get; set; } = new();
    public int TotalEventos { get; set; }
    public int TotalIntentos { get; set; }
    public decimal PromedioMensual { get; set; }
    public int MesConMasEventos { get; set; }
    public int MesMenosEventos { get; set; }
    public decimal VariacionPorcentual { get; set; } // Comparación último mes vs mes anterior
    public string Tendencia { get; set; } = string.Empty; // "Aumentando", "Disminuyendo", "Estable"
}
