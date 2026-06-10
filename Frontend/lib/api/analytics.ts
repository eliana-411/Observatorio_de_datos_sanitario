import { api, ApiResponse } from './client';
import { obtenerCoordenadas } from '../utils/municipios';

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

export interface GrupoEtarioDistribucion {
    grupoEtario: string;
    total: number;
}

export interface DistribucionGeneroMunicipioData {
    codigoMunicipio: string;
    municipio: string;
    totalEventos: number;
    generos: GeneroDistribucion[];
}

export interface DistribucionGrupoEtarioMunicipioData {
    codigoMunicipio: string;
    municipio: string;
    totalEventos: number;
    gruposEtarios: GrupoEtarioDistribucion[];
}

interface DistribucionGeneroMunicipioResponse {
    periodo?: { anio: number };
    series: DistribucionGeneroMunicipioData[];
}

interface DistribucionGrupoEtarioMunicipioResponse {
    periodo?: { anio: number };
    series: DistribucionGrupoEtarioMunicipioData[];
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

export async function fetchDistribucionGrupoEtarioMunicipio(
    anio: number
): Promise<ApiResponse<DistribucionGrupoEtarioMunicipioData[]>> {
    try {
        const response = await api.get<DistribucionGrupoEtarioMunicipioResponse>(
            `/analytics/distribucion-grupo-etario-municipio?anio=${anio}`
        );

        if (response.data) {
            return { data: response.data.series };
        }

        return { error: response.error };
    } catch (err) {
        return {
            error: {
                message: 'Error al cargar distribución de grupo etario por municipio'
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

// Interfaz para el nuevo endpoint consolidado de distribución geográfica
export interface DistribucionGeograficaData {
    codigoMunicipio: string;
    nombreMunicipio: string;
    latitud: number | null;
    longitud: number | null;
    totalCasos: number;
    hospitalizados: number;
    noHospitalizados: number;
    tasaHospitalizacion: number;
    tasaNoHospitalizacion: number;
}

// El backend devuelve directamente un array, no envuelto en { data: [] }
interface DistribucionGeograficaResponse {
    totalGlobal: number;
    municipios: DistribucionGeograficaData[];
}

// Respuesta completa con totalGlobal incluido
export interface DistribucionGeograficaCompleta {
    totalGlobal: number;
    municipios: DistribucionGeograficaData[];
}

// Función auxiliar para construir query string con parámetros opcionales
function construirQueryParams(params: Record<string, any>): string {
    const queryParams = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== 'todos' && value !== 'Todos')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    return queryParams ? `?${queryParams}` : '';
}

export async function fetchDistribucionGeografica(
    anio?: number,
    genero?: string,
    edad?: string,
    municipio?: string,
    hospitalizacion?: string,
    metodo?: string
): Promise<ApiResponse<DistribucionGeograficaCompleta>> {
    try {
        // Construir query params con los nombres correctos que espera el backend
        const queryParams = new URLSearchParams();

        const queryString = construirQueryParams({
            anio: anio !== undefined ? String(anio) : '',
            genero: genero ?? '',
            rangoEdad: edad ?? '',
            municipio: municipio ?? '',
            hospitalizado: hospitalizacion ?? ''
        });

        console.log('Fetching distribucion-geografica:', `/analytics/distribucion-geografica${queryString}`);

        const response = await api.get<DistribucionGeograficaResponse>(
            `/analytics/distribucion-geografica${queryString}`
        );

        console.log('Response data:', response.data);

        // El backend devuelve {totalGlobal, municipios}
        if (response.data && Array.isArray(response.data.municipios)) {
            console.log('Datos recibidos correctamente, cantidad:', response.data.municipios.length);

            // Extraer códigos de municipios únicos para buscar coordenadas en el CSV
            const codigosMunicipios = [...new Set(response.data.municipios.map(d => d.codigoMunicipio))];

            // Obtener coordenadas del CSV por código
            const coordenadaMap = await obtenerCoordenadas(codigosMunicipios);

            // Enriquecer los datos con las coordenadas del CSV
            const datosEnriquecidos = response.data.municipios.map(dato => ({
                ...dato,
                latitud: coordenadaMap.get(dato.codigoMunicipio)?.latitud ?? null,
                longitud: coordenadaMap.get(dato.codigoMunicipio)?.longitud ?? null
            }));

            return { 
                data: {
                    totalGlobal: response.data.totalGlobal,
                    municipios: datosEnriquecidos
                }
            };
        }

        return { error: response.error };
    } catch (err) {
        console.error('Error en fetchDistribucionGeografica:', err);
        return {
            error: {
                message: 'Error al cargar distribución geográfica'
            }
        };
    }
}

// Interfaces para Pirámide Poblacional
export interface PiramidePoblacionalData {
    genero: string;
    grupoEtario: string;
    total: number;
}

interface PiramidePoblacionalResponse {
    data: PiramidePoblacionalData[];
}

export async function fetchPiramidePoblacional(): Promise<ApiResponse<PiramidePoblacionalData[]>> {
    try {
        const response = await api.get<PiramidePoblacionalResponse>('/analytics/piramide-poblacional');

        if (response.data) {
            return { data: response.data.data };
        }

        return { error: response.error };
    } catch (err) {
        return {
            error: {
                message: 'Error al cargar la pirámide poblacional'
            }
        };
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Interfaces para Distribucion Geográfica por Municipio (Comparador Municipal)
// ──────────────────────────────────────────────────────────────────────────────

export interface DistribucionGeneroDato {
    nombre: string;
    cantidad: number;
    porcentaje: number;
}

export interface DistribucionGrupoEtarioDato {
    nombre: string;
    cantidad: number;
    porcentaje: number;
}

export interface MetodoTopDato {
    nombre: string;
    cantidad: number;
    porcentaje: number;
}

export interface DistribucionMunicipalData {
    codigoMunicipio: string;
    nombreMunicipio: string;
    totalCasos: number;
    hospitalizados: number;
    noHospitalizados: number;
    tasaHospitalizacion: number;
    tasaNoHospitalizacion: number;
    distribucionGenero: DistribucionGeneroDato[];
    distribucionGrupoEtario: DistribucionGrupoEtarioDato[];
    topMetodos: MetodoTopDato[];
}

export interface DistribucionMunicipalResponse {
    totalGlobal: number;
    municipios: DistribucionMunicipalData[];
}

/**
 * Obtiene información detallada de distribución geográfica para un municipio específico
 * Usado por el comparador municipal para mostrar datos del municipio seleccionado
 * 
 * @param municipio - Nombre o código del municipio
 * @returns Datos detallados del municipio con distribuciones y tasas
 */
export async function fetchDistribucionMunicipal(
    municipio: string
): Promise<ApiResponse<DistribucionMunicipalData>> {
    try {
        if (!municipio || municipio.trim() === '') {
            return {
                error: {
                    message: 'Municipio no especificado'
                }
            };
        }

        const encodedMunicipio = encodeURIComponent(municipio);
        const response = await api.get<DistribucionMunicipalResponse>(
            `/Analytics/distribucion-geografica?municipio=${encodedMunicipio}`
        );

        if (response.data && response.data.municipios && response.data.municipios.length > 0) {
            // Extraer el primer municipio del array
            const municipioDatos = response.data.municipios[0];

            // Mapear y formatear los datos correctamente
            const datosFormateados: DistribucionMunicipalData = {
                codigoMunicipio: municipioDatos.codigoMunicipio || '',
                nombreMunicipio: municipioDatos.nombreMunicipio || '',
                totalCasos: municipioDatos.totalCasos || 0,
                hospitalizados: municipioDatos.hospitalizados || 0,
                noHospitalizados: municipioDatos.noHospitalizados || 0,
                tasaHospitalizacion: typeof municipioDatos.tasaHospitalizacion === 'number'
                    ? Number(municipioDatos.tasaHospitalizacion)
                    : 0,
                tasaNoHospitalizacion: typeof municipioDatos.tasaNoHospitalizacion === 'number'
                    ? Number(municipioDatos.tasaNoHospitalizacion)
                    : 0,
                distribucionGenero: Array.isArray(municipioDatos.distribucionGenero)
                    ? municipioDatos.distribucionGenero.map(item => ({
                        nombre: item.nombre || '',
                        cantidad: item.cantidad || 0,
                        porcentaje: typeof item.porcentaje === 'number' ? Number(item.porcentaje) : 0
                    }))
                    : [],
                distribucionGrupoEtario: Array.isArray(municipioDatos.distribucionGrupoEtario)
                    ? municipioDatos.distribucionGrupoEtario.map(item => ({
                        nombre: item.nombre || '',
                        cantidad: item.cantidad || 0,
                        porcentaje: typeof item.porcentaje === 'number' ? Number(item.porcentaje) : 0
                    }))
                    : [],
                topMetodos: Array.isArray(municipioDatos.topMetodos)
                    ? municipioDatos.topMetodos.map(item => ({
                        nombre: item.nombre || '',
                        cantidad: item.cantidad || 0,
                        porcentaje: typeof item.porcentaje === 'number' ? Number(item.porcentaje) : 0
                    }))
                    : []
            };

            console.log('✅ Datos del municipio formateados:', datosFormateados);
            return { data: datosFormateados };
        }

        return {
            error: {
                message: 'No se encontraron datos para el municipio especificado'
            }
        };
    } catch (err) {
        console.error('❌ Error en fetchDistribucionMunicipal:', err);
        return {
            error: {
                message: 'Error al cargar información del municipio'
            }
        };
    }
}