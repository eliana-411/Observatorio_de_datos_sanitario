using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Observatorio.Application.Anomalias.DTOs;
using Observatorio.Application.Anomalias.Interfaces;
using Observatorio.Application.Analytics.Interfaces;
using Observatorio.Infrastructure.Sanitario;

namespace Observatorio.Application.Anomalias.Services;

/// <summary>
/// Servicio para detección de anomalías en intentos de suicidio
/// </summary>
public class AnomalasService : IAnomalasService
{
    private readonly SanitarioDbContext _dbContext;
    private readonly IMunicipiosService _municipiosService;
    private readonly ILogger<AnomalasService>? _logger;

    // Constantes por defecto
    private const decimal UMBRAL_PORCENTAJE_DEFECTO = 50m;  // 50% de incremento
    private const int DIAS_PERIODO_ACTUAL = 30;             // Últimos 30 días
    private const int MESES_PERIODO_HISTORICO = 12;         // Últimos 12 meses previos

    public AnomalasService(
        SanitarioDbContext dbContext,
        IMunicipiosService municipiosService,
        ILogger<AnomalasService>? logger = null)
    {
        _dbContext = dbContext;
        _municipiosService = municipiosService;
        _logger = logger;
    }

    /// <summary>
    /// Detecta incrementos anómalos por municipio
    /// </summary>
    public async Task<IncrementosAnomalosResponseDto> GetIncrementosAnomalosAsync(
        int? anio = null,
        decimal? umbralPorcentaje = null,
        CancellationToken cancelToken = default)
    {
        _logger?.LogInformation("GetIncrementosAnomalos: Iniciando detección de anomalías");

        // Usar año actual si no se proporciona
        int anioAnalisis = anio ?? DateTime.Now.Year;
        decimal umbral = umbralPorcentaje ?? UMBRAL_PORCENTAJE_DEFECTO;

        // Definir fechas
        var hoy = DateTime.Now;
        var fechaInicioActual = hoy.AddDays(-DIAS_PERIODO_ACTUAL);
        var fechaFinActual = hoy;

        // Para el histórico: 12 meses antes del período actual
        var fechaFinHistorico = fechaInicioActual.AddDays(-1);
        var fechaInicioHistorico = fechaFinHistorico.AddMonths(-MESES_PERIODO_HISTORICO);

        _logger?.LogInformation(
            "Período actual: {FechaInicio} - {FechaFin} | Período histórico: {FechaInicioHist} - {FechaFinHist}",
            fechaInicioActual, fechaFinActual, fechaInicioHistorico, fechaFinHistorico);

        // 1. Obtener intentos por municipio en el período actual (últimos 30 días)
        var intentosActuales = await GetIntentosPorMunicipioAsync(
            fechaInicioActual, fechaFinActual, cancelToken);

        // 2. Obtener intentos por municipio en el período histórico (12 meses previos)
        var intentosHistoricos = await GetIntentosPorMunicipioAsync(
            fechaInicioHistorico, fechaFinHistorico, cancelToken);

        // 3. Calcular promedios históricos (dividir por meses)
        var promediosHistoricos = intentosHistoricos.ToDictionary(
            kvp => kvp.Key,
            kvp => (decimal)kvp.Value / MESES_PERIODO_HISTORICO);

        // 4. Detectar anomalías
        var anomalias = new List<IncrementosAnomalosRegistroDto>();

        foreach (var (municipio, intentosActuales_) in intentosActuales)
        {
            var promedioHistorico = promediosHistoricos.ContainsKey(municipio)
                ? promediosHistoricos[municipio]
                : 0m;

            var diferencia = intentosActuales_ - promedioHistorico;
            var incrementoPorcentaje = promedioHistorico > 0
                ? (diferencia / promedioHistorico) * 100
                : (intentosActuales_ > 0 ? 100 : 0);

            var esAnomalia = incrementoPorcentaje >= umbral && intentosActuales_ > promedioHistorico;

            if (esAnomalia || incrementoPorcentaje > 0)
            {
                // Obtener código municipio del CSV
                var municipioInfo = await _municipiosService.GetMunicipioByNombreAsync(
                    municipio, cancelToken);

                var nivelAlerta = CalcularNivelAlerta(incrementoPorcentaje);

                anomalias.Add(new IncrementosAnomalosRegistroDto
                {
                    CodigoMunicipio = municipioInfo?.CodigoMunicipio ?? "Desconocido",
                    Municipio = municipio,
                    PromedioHistorico = Math.Round(promedioHistorico, 2),
                    IntentosActuales = intentosActuales_,
                    IncrementoPorcentaje = Math.Round(incrementoPorcentaje, 2),
                    DiferenciaAbsoluta = Math.Round(diferencia, 2),
                    EsAnomalia = esAnomalia,
                    NivelAlerta = nivelAlerta
                });
            }
        }

        // 5. Ordenar por incremento de mayor a menor
        anomalias = anomalias.OrderByDescending(a => a.IncrementoPorcentaje).ToList();

        var totalMunicipios = intentosActuales.Count;
        var municipiosConAnomalia = anomalias.Count(a => a.EsAnomalia);
        var porcentajeMunicipios = totalMunicipios > 0
            ? (decimal)municipiosConAnomalia / totalMunicipios * 100
            : 0;

        _logger?.LogInformation(
            "GetIncrementosAnomalos: {Total} municipios consultados, {Anomalias} con anomalías detectadas",
            totalMunicipios, municipiosConAnomalia);

        return new IncrementosAnomalosResponseDto
        {
            Periodo = new PeriodoDto { Anio = anioAnalisis },
            UmbralPorcentaje = umbral,
            TotalMunicipios = totalMunicipios,
            MunicipiosConAnomalia = municipiosConAnomalia,
            PorcentajeMunicipiosAfectados = Math.Round(porcentajeMunicipios, 2),
            Series = anomalias
        };
    }

    /// <summary>
    /// Obtiene la cantidad de intentos por municipio en un período de fechas
    /// </summary>
    private async Task<Dictionary<string, int>> GetIntentosPorMunicipioAsync(
        DateTime fechaInicio,
        DateTime fechaFin,
        CancellationToken cancelToken)
    {
        _logger?.LogInformation(
            "GetIntentosPorMunicipioAsync: Consultando período {FechaInicio} - {FechaFin}",
            fechaInicio, fechaFin);

        // Query a la vista vw_anomalias
        FormattableString query = $@"
            SELECT 
                municipio_evento as Municipio,
                SUM(cantidad_intentos) as TotalIntentos
            FROM dbo.vw_anomalias
            WHERE fecha >= {fechaInicio}
              AND fecha <= {fechaFin}
            GROUP BY municipio_evento
            ORDER BY TotalIntentos DESC
        ";

        var resultados = await _dbContext.Database
            .SqlQuery<IntentosPorMunicipioRawDto>(query)
            .ToListAsync(cancelToken);

        var diccionario = resultados.ToDictionary(
            r => r.Municipio ?? "Desconocido",
            r => r.TotalIntentos);

        _logger?.LogInformation(
            "GetIntentosPorMunicipioAsync: {Count} municipios encontrados en el período",
            diccionario.Count);

        return diccionario;
    }

    /// <summary>
    /// Calcula el nivel de alerta basado en el porcentaje de incremento
    /// </summary>
    private static string CalcularNivelAlerta(decimal incrementoPorcentaje)
    {
        return incrementoPorcentaje switch
        {
            >= 200 => "Crítico",        // Más del 200% de incremento
            >= 100 => "Alto",           // Más del 100% de incremento
            >= 50 => "Moderado",        // Más del 50% de incremento
            _ => "Normal"
        };
    }
}

/// <summary>
/// DTO interno para la query de intentos por municipio
/// </summary>
internal class IntentosPorMunicipioRawDto
{
    public string? Municipio { get; set; }
    public int TotalIntentos { get; set; }
}
