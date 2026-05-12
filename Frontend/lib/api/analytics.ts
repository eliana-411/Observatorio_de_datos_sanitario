import { api, ApiResponse } from './client';

export interface GeneroDistribution {
    genero: string;
    total: number;
}

interface VistaDistribucionGeneroResponse {
    data: GeneroDistribution[];
}

export async function fetchDistribucionGenero(): Promise<ApiResponse<GeneroDistribution[]>> {
    const response = await api.get<VistaDistribucionGeneroResponse>('/analytics/vista-distribucion-genero');

    // Desempacar la respuesta del backend (viene en formato { data: [...] })
    if (response.data) {
        return { data: response.data.data };
    }

    // Si hay error, retornarlo
    return { error: response.error };
}