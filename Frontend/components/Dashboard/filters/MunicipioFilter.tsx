'use client';

import React from 'react';
import { FilterCombobox } from './FilterCombobox';
import { Municipio } from './types';
import { fetchMunicipiosDelEndpoint } from '@/lib/api/municipios-api';

interface MunicipioFilterProps {
    value: string;
    onChange: (value: string) => void;
}

// Función para capitalizar texto
const capitalizeLabel = (text: string): string => {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// Función para convertir array de nombres de municipios a opciones del combobox
const convertMunicipiosToOptions = (nombresMunicipios: string[]): Municipio[] => {
    const municipios: Municipio[] = [{ value: "todos", label: "Todos los municipios" }];
    const seen = new Set<string>();

    for (const nombre of nombresMunicipios) {
        if (!nombre || !nombre.trim()) continue;

        const valueKey = nombre.toLowerCase().replace(/\s+/g, '_');

        if (!seen.has(valueKey)) {
            seen.add(valueKey);
            municipios.push({
                value: valueKey,
                label: capitalizeLabel(nombre),
            });
        }
    }

    return municipios.sort((a, b) => {
        if (a.value === 'todos') return -1;
        if (b.value === 'todos') return 1;
        return a.label.localeCompare(b.label);
    });
};

export function MunicipioFilter({ value, onChange }: MunicipioFilterProps) {
    const [municipios, setMunicipios] = React.useState<Municipio[]>([
        { value: "todos", label: "Todos los municipios" }
    ]);
    const [loading, setLoading] = React.useState(true);

    // Cargar municipios desde el endpoint del Backend al montar
    React.useEffect(() => {
        const loadMunicipios = async () => {
            try {
                const nombresMunicipios = await fetchMunicipiosDelEndpoint();
                const opciones = convertMunicipiosToOptions(nombresMunicipios);
                setMunicipios(opciones);
                console.log(`Municipios cargados: ${opciones.length - 1} municipios (incluyendo "Todos")`);
            } catch (error) {
                console.error('Error cargando municipios:', error);
                // Mantener la opción "Todos" como fallback
                setMunicipios([{ value: "todos", label: "Todos los municipios" }]);
            } finally {
                setLoading(false);
            }
        };

        loadMunicipios();
    }, []);

    return (
        <FilterCombobox
            value={value}
            options={municipios}
            label="Municipio"
            icon="location_on"
            onChange={onChange}
            minWidth="w-[220px]"
            loading={loading}
            placeholder="Buscar..."
            hasScroll={true}
        />
    );
}
