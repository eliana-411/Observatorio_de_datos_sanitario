import { HistoricoMes, PredictionMes } from '@/hooks/useBrotesApi';

export interface ChartDataPoint {
    mes: number;
    anio: number;
    historico: number | null;
    prediccion: number | null;
    intervalo_inferior?: number;
    intervalo_superior?: number;
    umbral: number;
    media_historica: number;
    nivel_alerta?: string;
    displayLabel: string; // "ENE 2024" o similar
    isPrediction: boolean;
    transicion?: number | null; // Para conectar histórico y predicción
}

export interface ChartMetadata {
    umbralAlerta: number;
    mediaHistorica: number;
}

/**
 * Transforma datos históricos y predicciones en formato compatible con el gráfico
 * Combina últimos 7 meses históricos + predicciones
 */
export function transformBrotesData(
    historicoData: HistoricoMes[],
    predictionResponse: { predicciones: PredictionMes[] } | null,
    monthsToDisplay: number
): { data: ChartDataPoint[]; metadata: ChartMetadata } {
    const chartData: ChartDataPoint[] = [];

    // Obtener última media histórica y umbral de los datos
    let lastMediaHistorica = 3.4; // default
    let lastUmbralAlerta = 4.9; // default

    if (historicoData.length > 0) {
        lastMediaHistorica = historicoData[historicoData.length - 1].media_historica;
        lastUmbralAlerta = historicoData[historicoData.length - 1].umbral_alerta;
    } else if (predictionResponse?.predicciones.length) {
        lastMediaHistorica = predictionResponse.predicciones[0].media_historica;
        lastUmbralAlerta = predictionResponse.predicciones[0].umbral_alerta;
    }

    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    // 1. Procesar histórico: Últimos 7 meses
    const ultimosMeses = historicoData.slice(-7);

    for (let i = 0; i < ultimosMeses.length; i++) {
        const hist = ultimosMeses[i];
        const monthName = monthNames[hist.mes - 1];
        const isLastHistorico = i === ultimosMeses.length - 1;

        chartData.push({
            mes: hist.mes,
            anio: hist.anio,
            historico: hist.casos,
            prediccion: null,
            umbral: hist.umbral_alerta,
            media_historica: hist.media_historica,
            displayLabel: `${monthName} ${hist.anio}`,
            isPrediction: false,
            transicion: isLastHistorico ? hist.casos : null, // Último histórico para conexión
        });
    }

    // 2. Procesar predicciones
    if (predictionResponse?.predicciones.length) {
const predictionsToShow = predictionResponse.predicciones.slice(0, monthsToDisplay);
for (let i = 0; i < predictionsToShow.length; i++) {
    const pred = predictionsToShow[i];
            const monthName = monthNames[pred.mes - 1];
            const isFirstPrediccion = i === 0;

            chartData.push({
                mes: pred.mes,
                anio: pred.anio,
                historico: null,
                prediccion: pred.casos_predichos,
                intervalo_inferior: pred.intervalo_inferior,
                intervalo_superior: pred.intervalo_superior,
                umbral: pred.umbral_alerta,
                media_historica: pred.media_historica,
                nivel_alerta: pred.nivel_alerta,
                displayLabel: `${monthName} ${pred.anio} (P)`,
                isPrediction: true,
                transicion: isFirstPrediccion ? pred.casos_predichos : null, // Primer predicción para conexión
            });
        }
    }

    return {
        data: chartData,
        metadata: {
            umbralAlerta: lastUmbralAlerta,
            mediaHistorica: lastMediaHistorica,
        },
    };
}

/**
 * Valida que el municipio seleccionado esté en la lista de disponibles
 */
export function validateMunicipio(
    selectedMunicipio: string,
    availableMunicipios: string[]
): string {
    if (availableMunicipios.length === 0) {
        return 'todos';
    }

    // Si el municipio seleccionado está en la lista, retórnalo
    const found = availableMunicipios.find(
        m => m.toLowerCase().replace(/\s+/g, '_') === selectedMunicipio || m === selectedMunicipio
    );

    if (found) {
        return found.toLowerCase().replace(/\s+/g, '_');
    }

    // Si no está, retorna el primero disponible
    return availableMunicipios[0].toLowerCase().replace(/\s+/g, '_');
}
