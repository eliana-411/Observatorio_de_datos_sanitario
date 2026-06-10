import { useCallback } from 'react';
import { api } from '@/lib/api/client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface HistoricoMes {
    anio: number;
    mes: number;
    casos: number;
    media_historica: number;
    umbral_alerta: number;
}

export interface PredictionMes {
    municipio: string;
    anio: number;
    mes: number;
    casos_predichos: number;
    intervalo_inferior: number;
    intervalo_superior: number;
    media_historica: number;
    umbral_alerta: number;
    nivel_alerta: string; // 'NORMAL' | 'MODERADO' | 'ALTO' | 'CRÍTICO'
    variacion_vs_media: number;
}

export interface PredictionResponse {
    status: string;
    municipio: string;
    predicciones: PredictionMes[];
    total_meses: number;
    variacion_vs_mes_anterior?: number;
    perfil_historico?: any;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export const useBrotesApi = () => {
    /**
     * Obtiene lista de municipios disponibles para predicción de brotes
     */
    const fetchMunicipios = useCallback(async (): Promise<string[]> => {
        try {
            const response = await api.get<{ status: string; municipios: string[] }>('/Brotes/municipios');
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
     * Obtiene histórico de brotes para un municipio (sin filtrar, retorna todo)
     */
    const fetchHistorico = useCallback(async (municipio: string): Promise<HistoricoMes[]> => {
        try {
            const encodedMunicipio = encodeURIComponent(municipio);
            const response = await api.get<HistoricoMes[]>(`/Brotes/historico/${encodedMunicipio}`);
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
     * Obtiene predicción de brotes para un municipio
     */
    const fetchPredict = useCallback(async (municipio: string, mesesAPredicir: number): Promise<PredictionResponse | null> => {
        try {
            const payload = {
                Municipio: municipio,
                MesesAPredecir: mesesAPredicir,
            };

            const response = await api.post<PredictionResponse>('/Brotes/predict', payload);

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

    return {
        fetchMunicipios,
        fetchHistorico,
        fetchPredict,
    };
};
