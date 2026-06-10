// Interfaz para los datos del municipio del CSV
export interface MunicipioCSV {
    codigoDepartamento: string;
    nombreDepartamento: string;
    codigoMunicipio: string;
    nombreMunicipio: string;
    tipo: string;
    longitud: number;
    latitud: number;
}

// Cache global para los datos del CSV
let municipiosCache: Map<string, MunicipioCSV> | null = null;

/**
 * Carga el CSV de municipios y lo parsea
 * Cachea los resultados para evitar cargar múltiples veces
 */
async function cargarMunicipios(): Promise<Map<string, MunicipioCSV>> {
    // Si ya tenemos los datos en cache, retornarlos
    if (municipiosCache) {
        return municipiosCache;
    }

    try {
        const response = await fetch('/data/municipios-divipola.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar CSV: ${response.statusText}`);
        }

        const csvText = await response.text();
        const lineas = csvText.trim().split('\n');

        // La primera línea contiene los headers
        const headers = lineas[0].split(',').map(h => h.trim().replace(/"/g, ''));

        // Crear un Map para acceso rápido por código de municipio
        const municipios = new Map<string, MunicipioCSV>();

        // Procesar cada línea (excepto el header)
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i];
            if (!linea.trim()) continue;

            // Parsear CSV respetando comillas
            const valores = parsearLineaCSV(linea);

            if (valores.length >= 7) {
                const municipio: MunicipioCSV = {
                    codigoDepartamento: valores[0],
                    nombreDepartamento: valores[1],
                    codigoMunicipio: valores[2],
                    nombreMunicipio: valores[3],
                    tipo: valores[4],
                    longitud: parseFloat(valores[5].replace(',', '.')),
                    latitud: parseFloat(valores[6].replace(',', '.'))
                };

                // Guardar en el map usando el código de municipio como clave
                municipios.set(municipio.codigoMunicipio, municipio);
            }
        }

        municipiosCache = municipios;
        return municipios;
    } catch (error) {
        console.error('Error al cargar municipios desde CSV:', error);
        // Retornar map vacío en caso de error
        return new Map();
    }
}

/**
 * Parsea una línea CSV respetando las comillas
 * Maneja correctamente campos entre comillas que contengan comas
 */
function parsearLineaCSV(linea: string): string[] {
    const resultado: string[] = [];
    let actual = '';
    let dentroDeComillas = false;

    for (let i = 0; i < linea.length; i++) {
        const char = linea[i];
        const charAnterior = i > 0 ? linea[i - 1] : '';

        if (char === '"') {
            dentroDeComillas = !dentroDeComillas;
        } else if (char === ',' && !dentroDeComillas) {
            resultado.push(actual.trim().replace(/"/g, ''));
            actual = '';
        } else {
            actual += char;
        }
    }

    // Agregar el último campo
    if (actual) {
        resultado.push(actual.trim().replace(/"/g, ''));
    }

    return resultado;
}

/**
 * Obtiene las coordenadas de un municipio por su código
 * @param codigoMunicipio - El código del municipio (ej: "05001")
 * @returns Las coordenadas o null si no se encuentra
 */
export async function obtenerCoordenadasMunicipio(
    codigoMunicipio: string
): Promise<{ latitud: number | null; longitud: number | null }> {
    try {
        const municipios = await cargarMunicipios();
        const municipio = municipios.get(codigoMunicipio);

        if (municipio) {
            return {
                latitud: municipio.latitud,
                longitud: municipio.longitud
            };
        }

        console.warn(`Municipio con código ${codigoMunicipio} no encontrado en CSV`);
        return { latitud: null, longitud: null };
    } catch (error) {
        console.error(`Error al obtener coordenadas para municipio ${codigoMunicipio}:`, error);
        return { latitud: null, longitud: null };
    }
}

/**
 * Obtiene las coordenadas para múltiples municipios
 * @param codigosMunicipios - Array de códigos de municipios
 * @returns Map con el código del municipio como clave y las coordenadas como valor
 */
export async function obtenerCoordenadas(
    codigosMunicipios: string[]
): Promise<Map<string, { latitud: number | null; longitud: number | null }>> {
    const municipios = await cargarMunicipios();
    const coordenadas = new Map<string, { latitud: number | null; longitud: number | null }>();

    for (const codigo of codigosMunicipios) {
        const municipio = municipios.get(codigo);
        if (municipio) {
            coordenadas.set(codigo, {
                latitud: municipio.latitud,
                longitud: municipio.longitud
            });
        } else {
            coordenadas.set(codigo, { latitud: null, longitud: null });
        }
    }

    return coordenadas;
}

/**
 * Normaliza un nombre de municipio removiendo tildes, acentos y espacios extra
 * Convierte a minúsculas para comparación consistente
 * 
 * Ejemplos:
 * - "José María" → "jose maria"
 * - "MANIZALES" → "manizales"
 * - "La Dorada" → "la dorada"
 * 
 * @param texto - Texto a normalizar
 * @returns Texto normalizado
 */
export function normalizarMunicipio(texto: string): string {
    if (!texto) return '';

    return texto
        .normalize('NFD')                           // Descomponer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')            // Remover marcas diacríticas
        .toLowerCase()                              // Convertir a minúsculas
        .replace(/\s+/g, ' ')                       // Normalizar espacios múltiples
        .trim();                                    // Remover espacios al inicio/final
}

/**
 * Obtiene coordenadas buscando un municipio por nombre normalizado
 * Busca en el CSV de DIVIPOLA usando la normalización para manejar variaciones
 * de mayúsculas, tildes, etc.
 * 
 * @param nombreMunicipio - Nombre del municipio (puede tener variaciones)
 * @returns Las coordenadas o { latitud: null, longitud: null } si no se encuentra
 */
export async function obtenerCoordenadasPorNombre(
    nombreMunicipio: string
): Promise<{ latitud: number | null; longitud: number | null }> {
    try {
        if (!nombreMunicipio || nombreMunicipio.trim() === '') {
            return { latitud: null, longitud: null };
        }

        const municipios = await cargarMunicipios();
        const nombreNormalizado = normalizarMunicipio(nombreMunicipio);

        // Buscar por nombre normalizado
        for (const municipio of municipios.values()) {
            if (normalizarMunicipio(municipio.nombreMunicipio) === nombreNormalizado) {
                return {
                    latitud: municipio.latitud,
                    longitud: municipio.longitud
                };
            }
        }

        console.warn(`Municipio "${nombreMunicipio}" no encontrado en CSV (buscado como "${nombreNormalizado}")`);
        return { latitud: null, longitud: null };
    } catch (error) {
        console.error(`Error al obtener coordenadas para municipio "${nombreMunicipio}":`, error);
        return { latitud: null, longitud: null };
    }
}

/**
 * Obtiene coordenadas para múltiples municipios buscando por nombre normalizado
 * Útil cuando se tienen nombres de municipios desde el endpoint del Backend
 * 
 * @param nombresMunicipios - Array de nombres de municipios
 * @returns Map con el nombre del municipio como clave y las coordenadas como valor
 */
export async function obtenerCoordenadalePorNombres(
    nombresMunicipios: string[]
): Promise<Map<string, { latitud: number | null; longitud: number | null }>> {
    const municipios = await cargarMunicipios();
    const coordenadas = new Map<string, { latitud: number | null; longitud: number | null }>();

    for (const nombre of nombresMunicipios) {
        const nombreNormalizado = normalizarMunicipio(nombre);
        let encontrado = false;

        for (const municipio of municipios.values()) {
            if (normalizarMunicipio(municipio.nombreMunicipio) === nombreNormalizado) {
                coordenadas.set(nombre, {
                    latitud: municipio.latitud,
                    longitud: municipio.longitud
                });
                encontrado = true;
                break;
            }
        }

        if (!encontrado) {
            coordenadas.set(nombre, { latitud: null, longitud: null });
        }
    }

    return coordenadas;
}
