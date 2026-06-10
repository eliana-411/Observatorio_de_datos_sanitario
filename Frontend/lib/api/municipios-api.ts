'use client';

/**
 * Servicio para consumir municipios desde el endpoint del Backend
 * Endpoint: GET /api/Brotes/municipios
 * Devuelve: Array de nombres de municipios de Caldas
 * 
 * Características:
 * - Caché en localStorage (1 hora de duración)
 * - Manejo de errores con fallback
 * - Tipado TypeScript
 */

const CACHE_KEY = 'municipios_caldas_cache';
const CACHE_DURATION = 3600000; // 1 hora en ms
const API_BASE_URL = 'https://localhost:7083';

export interface MunicipiosApiResponse {
    status: string;
    municipios: string[];
}

/**
 * Obtiene la lista de municipios desde el endpoint del Backend
 * Usa caché para evitar múltiples llamadas
 * 
 * @returns Array de nombres de municipios de Caldas
 */
export async function fetchMunicipiosDelEndpoint(): Promise<string[]> {
    try {
        // Verificar si existe caché válido
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const isValid = Date.now() - timestamp < CACHE_DURATION;
            if (isValid) {
                console.log('Municipios obtenidos del caché local');
                return data;
            }
        }
    } catch (error) {
        console.warn('Error al acceder al caché:', error);
    }

    try {
        console.log('Fetching municipios desde endpoint...');
        const response = await fetch(`${API_BASE_URL}/api/Brotes/municipios`);

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const result: MunicipiosApiResponse = await response.json();

        if (!result.municipios || !Array.isArray(result.municipios)) {
            throw new Error('Respuesta inválida del servidor');
        }

        // Guardar en caché
        try {
            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                    data: result.municipios,
                    timestamp: Date.now()
                })
            );
        } catch (cacheError) {
            console.warn('No se pudo guardar en caché:', cacheError);
        }

        console.log(`Municipios obtenidos: ${result.municipios.length} municipios`);
        return result.municipios;
    } catch (error) {
        console.error('Error al obtener municipios desde endpoint:', error);

        // Fallback: intentar obtener del caché aunque esté expirado
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data } = JSON.parse(cached);
                console.log('Usando caché expirado como fallback');
                return data;
            }
        } catch (fallbackError) {
            console.error('Error al acceder al fallback:', fallbackError);
        }

        // Retornar array vacío como último recurso
        console.warn('Retornando array vacío como fallback');
        return [];
    }
}

/**
 * Limpia el caché de municipios
 * Útil para testing o cuando se necesita forzar una recarga
 */
export function clearMunicipiosCache(): void {
    try {
        localStorage.removeItem(CACHE_KEY);
        console.log('Caché de municipios limpiado');
    } catch (error) {
        console.warn('Error al limpiar caché:', error);
    }
}

/**
 * Obtiene el timestamp del caché actual
 * Útil para debugging
 */
export function getMunicipiosCacheTimestamp(): number | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { timestamp } = JSON.parse(cached);
            return timestamp;
        }
    } catch (error) {
        console.warn('Error al obtener timestamp del caché:', error);
    }
    return null;
}
