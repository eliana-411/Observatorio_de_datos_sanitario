namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para un registro de incremento anómalo por municipio
/// </summary>
public class IncrementosAnomalosRegistroDto
{
    /// <summary>
    /// Código DANE del municipio (desde CSV DIVIPOLA)
    /// </summary>
    public string? CodigoMunicipio { get; set; }

    /// <summary>
    /// Nombre del municipio
    /// </summary>
    public string? Municipio { get; set; }

    /// <summary>
    /// Promedio de intentos en el período histórico (últimos 12 meses previos)
    /// </summary>
    public decimal PromedioHistorico { get; set; }

    /// <summary>
    /// Cantidad de intentos en los últimos 30 días
    /// </summary>
    public int IntentosActuales { get; set; }

    /// <summary>
    /// Porcentaje de incremento respecto al promedio histórico
    /// </summary>
    public decimal IncrementoPorcentaje { get; set; }

    /// <summary>
    /// Indica si el incremento es considerado anómalo
    /// </summary>
    public bool EsAnomalia { get; set; }

    /// <summary>
    /// Nivel de alerta: "Crítico", "Alto", "Moderado", "Normal"
    /// </summary>
    public string NivelAlerta { get; set; } = "Normal";

    /// <summary>
    /// Diferencia absoluta: IntentosActuales - PromedioHistorico
    /// </summary>
    public decimal DiferenciaAbsoluta { get; set; }
}

/// <summary>
/// DTO para la respuesta de incrementos anómalos por municipio
/// </summary>
public class IncrementosAnomalosResponseDto
{
    /// <summary>
    /// Información del período consultado
    /// </summary>
    public PeriodoDto? Periodo { get; set; }

    /// <summary>
    /// Umbral de porcentaje de incremento utilizado para alertar (ej: 50%)
    /// </summary>
    public decimal UmbralPorcentaje { get; set; }

    /// <summary>
    /// Total de municipios consultados
    /// </summary>
    public int TotalMunicipios { get; set; }

    /// <summary>
    /// Total de municipios con anomalías detectadas
    /// </summary>
    public int MunicipiosConAnomalia { get; set; }

    /// <summary>
    /// Porcentaje de municipios afectados
    /// </summary>
    public decimal PorcentajeMunicipiosAfectados { get; set; }

    /// <summary>
    /// Lista de municipios con sus incrementos, ordenada de mayor a menor anomalía
    /// </summary>
    public List<IncrementosAnomalosRegistroDto>? Series { get; set; }
}

/// <summary>
/// DTO para el período de análisis
/// </summary>
public class PeriodoDto
{
    /// <summary>
    /// Año del análisis
    /// </summary>
    public int Anio { get; set; }
}
