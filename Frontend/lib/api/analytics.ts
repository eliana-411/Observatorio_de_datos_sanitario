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

export interface MetodoDistribution {
    metodo: string;
    total: number;
}

interface VistaMetodosMasUsadosResponse {
    data: MetodoDistribution[];
}

export interface HospitalizacionDistribution {
    hospitalizado: number;
    estado: string;
    hospitalizacion: string;
    total: number;
    nombre?: string;
}

interface VistaHospitalizacionResponse {
    data: HospitalizacionDistribution[];
}

export interface GeneroDistribucion {
    genero: string;
    total: number;
}

export interface DistribucionGeneroMunicipioData {
    codigoMunicipio: string;
    municipio: string;
    totalEventos: number;
    generos: GeneroDistribucion[];
}

interface DistribucionGeneroMunicipioResponse {
    periodo?: { anio: number };
    series: DistribucionGeneroMunicipioData[];
}

export async function fetchDistribucionGeneroMunicipio(
    anio: number
): Promise<ApiResponse<DistribucionGeneroMunicipioData[]>> {
    try {
        const response = await api.get<DistribucionGeneroMunicipioResponse>(
            `/analytics/distribucion-genero-municipio?anio=${anio}`
        );

        if (response.data) {
            return { data: response.data.series };
        }

        return { error: response.error };
    } catch (err) {
        return {
            error: {
                message: 'Error al cargar distribución de género por municipio'
            }
        };
    }
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

export async function fetchMetodosMasUsados(): Promise<ApiResponse<MetodoDistribution[]>> {
    const response = await api.get<VistaMetodosMasUsadosResponse>('/analytics/vista-metodos-mas-usados');

    // Desempacar la respuesta del backend (viene en formato { data: [...] })
    if (response.data) {
        return { data: response.data.data };
    }

    // Si hay error, retornarlo
    return { error: response.error };
}

export async function fetchHospitalizacion(): Promise<ApiResponse<HospitalizacionDistribution[]>> {
    const response = await api.get<VistaHospitalizacionResponse>('/analytics/vista-hospitalizacion');

    // Desempacar la respuesta del backend (viene en formato { data: [...] })
    if (response.data) {
        return { data: response.data.data };
    }

    // Si hay error, retornarlo
    return { error: response.error };
}

// Interfaces para Tendencia Temporal
export interface TendenciaTemporalData {
    anio: number;
    mes: number;
    nombreMes: string;
    totalEventos: number;
    porcentajeEventos: number;
    hospitalizados: number;
    porcentajeHospitalizados: number;
}

interface TendenciaTemporalResponse {
    periodo: {
        anio: number;
    };
    series: TendenciaTemporalData[];
}

export async function fetchTendenciaTemporal(anio: number): Promise<ApiResponse<TendenciaTemporalData[]>> {
    const response = await api.get<TendenciaTemporalResponse>(`/analytics/tendencia-temporal?anio=${anio}`);

    // Desempacar la respuesta del backend
    if (response.data) {
        return { data: response.data.series };
    }

    // Si hay error, retornarlo
    return { error: response.error };
}