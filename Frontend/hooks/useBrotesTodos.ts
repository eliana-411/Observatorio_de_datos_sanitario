'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

export interface BrotesPredictionData {
    municipio: string;
    anio: number;
    mes: number;
    casos_predichos: number;
    intervalo_inferior: number;
    intervalo_superior: number;
    media_historica: number;
    umbral_alerta: number;
    nivel_alerta: string;
    variacion_vs_media: number;
}

export interface UseBrotesTodosResult {
    data: BrotesPredictionData[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useBrotesTodos(): UseBrotesTodosResult {
    const [data, setData] = useState<BrotesPredictionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBrotesTodos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<BrotesPredictionData[]>('/Brotes/todos');
            if (response.error) {
                setError('Error al cargar predicciones de brotes');
                console.error('Error:', response.error);
                setData([]);
            } else {
                setData(response.data || []);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Exception in useBrotesTodos:', err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrotesTodos();
    }, [fetchBrotesTodos]);

    return {
        data,
        loading,
        error,
        refetch: fetchBrotesTodos,
    };
}
