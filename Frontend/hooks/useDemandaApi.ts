'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api/client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface HistoricoMesDemanda {
    anio: number;
    mes: number;
    hospitalizaciones: number;
    media_historica: number;
    umbral_alerta: number;
}

export interface DemandaPredictionMes {
    municipio: string;
    anio: number;
    mes: number;
    hospitalizaciones_predichas: number;
    intervalo_inferior: number;
    intervalo_superior: number;
    media_historica: number;
    umbral_alerta: number;
    nivel_alerta: string; // 'NORMAL' | 'MODERADO' | 'ALTO' | 'CRÍTICO'
    variacion_pct: number;
}

export interface DemandaPredictionResponse {
    status: string;
    municipio: string;
    predicciones: DemandaPredictionMes[];
    total_meses: number;
    perfil_historico?: {
        media_historica: number;
        std_historica: number;
        umbral_alerta: number;
        tasa_hospitalizacion_media: number;
        mes_critico: number;
        tendencia_reciente: string;
        genero_predominante: string;
        grupo_etario_predominante: string;
        metodo_predominante: string;
        antecedentes_mental_promedio: number;
        consumo_sustancias_promedio: number;
    };
}

export interface DemandaModelMetrics {
    rmse: number;
    mae: number;
    r2: number;
    brote_umbral: number;
    brote_precision: number;
    brote_recall: number;
    brote_f1: number;
}

export interface DemandaModelInfoResponse {
    status: string;
    model_info: {
        metrics: DemandaModelMetrics;
    };
}

// ── Hook ───────────────────────────────────────────────────────────────────

export const useDemandaApi = () => {
    /**
     * Obtiene lista de municipios disponibles para predicción de demanda
     */
    const fetchMunicipios = useCallback(async (): Promise<string[]> => {
        try {
            const response = await api.get<{ status: string; municipios: string[] }>('/Demanda/municipios');
            if (response.error) {
                console.error('Error fetching municipios:', response.error);
                return [];
            }
            return response.data?.municipios || [];
        } catch (error) {
            console.error('Exception in fetchMunicipios:', error);
            return [];
        }
    }, []);

    /**
     * Obtiene histórico de demanda para un municipio
     */
    const fetchHistorico = useCallback(async (municipio: string): Promise<HistoricoMesDemanda[]> => {
        try {
            const encodedMunicipio = encodeURIComponent(municipio);
            const response = await api.get<HistoricoMesDemanda[]>(`/Demanda/historico/${encodedMunicipio}`);
            if (response.error) {
                console.error(`Error fetching histórico for ${municipio}:`, response.error);
                return [];
            }
            return response.data || [];
        } catch (error) {
            console.error(`Exception in fetchHistorico for ${municipio}:`, error);
            return [];
        }
    }, []);

    /**
     * Obtiene predicción de demanda para un municipio
     */
    const fetchPredict = useCallback(async (municipio: string, mesesAPredicir: number): Promise<DemandaPredictionResponse | null> => {
        try {
            const payload = {
                Municipio: municipio,
                MesesAPredecir: mesesAPredicir,
            };

            const response = await api.post<DemandaPredictionResponse>('/Demanda/predict', payload);

            if (response.error) {
                console.error(`Error fetching prediction for ${municipio}:`, response.error);
                return null;
            }

            return response.data || null;
        } catch (error) {
            console.error(`Exception in fetchPredict for ${municipio}:`, error);
            return null;
        }
    }, []);

    /**
     * Obtiene las métricas del modelo de demanda (RMSE, MAE, R2, etc.)
     */
    const fetchModelInfo = useCallback(async (): Promise<DemandaModelMetrics | null> => {
        try {
            const response = await api.get<DemandaModelInfoResponse>('/Demanda/info');
            if (response.error) {
                console.error('Error fetching model info:', response.error);
                return null;
            }
            return response.data?.model_info?.metrics || null;
        } catch (error) {
            console.error('Exception in fetchModelInfo:', error);
            return null;
        }
    }, []);

    return {
        fetchMunicipios,
        fetchHistorico,
        fetchPredict,
        fetchModelInfo,
    };
};
