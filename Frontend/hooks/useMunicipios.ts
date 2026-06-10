'use client';

import { useEffect, useState } from 'react';

export interface Municipio {
    codigoMunicipio: string;
    nombreMunicipio: string;
    latitud: number;
    longitud: number;
}

export function useMunicipios() {
    const [municipios, setMunicipios] = useState<Map<string, Municipio>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMunicipios() {
            try {
                const response = await fetch('/data/municipios-divipola.csv');
                const csv = await response.text();
                const lines = csv.split('\n').slice(1); // Skip header
                const map = new Map<string, Municipio>();

                lines.forEach(line => {
                    if (!line.trim()) return;
                    
                    // Parser CSV con comillas
                    const parts = line.match(/"([^"]*)"/g)?.map(p => p.replace(/"/g, '')) || [];
                    
                    if (parts.length >= 7) {
                        const codigoMunicipio = parts[2];
                        const nombreMunicipio = parts[3];
                        const longitud = parseFloat(parts[5].replace(',', '.'));
                        const latitud = parseFloat(parts[6].replace(',', '.'));

                        map.set(codigoMunicipio, {
                            codigoMunicipio,
                            nombreMunicipio,
                            latitud,
                            longitud
                        });
                    }
                });

                setMunicipios(map);
            } catch (error) {
                console.error('Error loading municipios:', error);
            } finally {
                setLoading(false);
            }
        }

        loadMunicipios();
    }, []);

    return { municipios, loading };
}