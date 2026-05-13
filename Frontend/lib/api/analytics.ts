import { api, ApiResponse } from './client';

export interface GeneroDistribution {
    genero: string;
    total: number;
}

export interface GrupoEtarioDistribution {
    grupoEtario: string;
    total: number;
}

interface VistaDistribucionGeneroResponse {
    data: GeneroDistribution[];
}

interface VistaDistribucionGrupoEtarioResponse {
    data: GrupoEtarioDistribution[];
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

export async function fetchDistribucionGrupoEtario(): Promise<ApiResponse<GrupoEtarioDistribution[]>> {
    const response = await api.get<VistaDistribucionGrupoEtarioResponse>('/analytics/vista-distribucion-grupo-etario');

    // Desempacar la respuesta del backend (viene en formato { data: [...] })
    if (response.data) {
        return { data: response.data.data };
    }

    // Si hay error, retornarlo
    return { error: response.error };
}