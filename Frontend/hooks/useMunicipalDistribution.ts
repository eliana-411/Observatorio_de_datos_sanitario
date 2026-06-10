'use client';

import { useCallback, useState } from 'react';
import {
    fetchDistribucionMunicipal,
    DistribucionMunicipalData
} from '@/lib/api/analytics';

interface UseMunicipalDistributionState {
    data: DistribucionMunicipalData | null;
    loading: boolean;
    error: string | null;
}

/**
 * Hook para obtener información detallada de distribución geográfica de un municipio
 * Se utiliza en el Comparador Municipal para mostrar datos del municipio seleccionado
 */
export const useMunicipalDistribution = () => {
    const [state, setState] = useState<UseMunicipalDistributionState>({
        data: null,
        loading: false,
        error: null
    });

    const fetchMunicipalData = useCallback(async (municipio: string) => {
        // Validar entrada
        if (!municipio || municipio.trim() === '') {
            setState({
                data: null,
                loading: false,
                error: null
            });
            return;
        }

        // Establecer loading
        setState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const response = await fetchDistribucionMunicipal(municipio);

            if (response.data) {
                setState({
                    data: response.data,
                    loading: false,
                    error: null
                });
            } else if (response.error) {
                setState({
                    data: null,
                    loading: false,
                    error: response.error.message
                });
            }
        } catch (err) {
            setState({
                data: null,
                loading: false,
                error: 'Error inesperado al cargar datos del municipio'
            });
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null
        });
    }, []);

    return {
        ...state,
        fetchMunicipalData,
        reset
    };
};
