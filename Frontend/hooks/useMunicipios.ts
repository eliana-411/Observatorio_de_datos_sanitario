'use client';

import { useEffect, useState } from 'react';
import { fetchMunicipiosDelEndpoint } from '@/lib/api/municipios-api';
import { obtenerCoordenadasPorNombre } from '@/lib/utils/municipios';

export interface Municipio {
    codigoMunicipio: string;
    nombreMunicipio: string;
    latitud: number | null;
    longitud: number | null;
}

export function useMunicipios() {
    const [municipios, setMunicipios] = useState<Map<string, Municipio>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMunicipios() {
            try {
                // Obtener nombres de municipios desde el endpoint
                const nombresMunicipios = await fetchMunicipiosDelEndpoint();

                if (!nombresMunicipios || nombresMunicipios.length === 0) {
                    console.warn('No se obtuvieron municipios del endpoint');
                    setMunicipios(new Map());
                    return;
                }

                // Crear map con municipios
                const map = new Map<string, Municipio>();

                for (const nombre of nombresMunicipios) {
                    if (!nombre || !nombre.trim()) continue;

                    // Obtener coordenadas para este municipio
                    const coords = await obtenerCoordenadasPorNombre(nombre);

                    const valueKey = nombre.toLowerCase().replace(/\s+/g, '_');
                    map.set(valueKey, {
                        codigoMunicipio: valueKey,
                        nombreMunicipio: nombre,
                        latitud: coords.latitud,
                        longitud: coords.longitud
                    });
                }

                setMunicipios(map);
                console.log(`useMunicipios: ${map.size} municipios cargados con coordenadas`);
            } catch (error) {
                console.error('Error loading municipios:', error);
                setMunicipios(new Map());
            } finally {
                setLoading(false);
            }
        }

        loadMunicipios();
    }, []);

    return { municipios, loading };
}