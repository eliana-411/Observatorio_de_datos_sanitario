'use client';

import React from 'react';
import { FilterCombobox } from './FilterCombobox';
import { Municipio } from './types';

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

// Función para parsear CSV y extraer municipios
const parseMunicipiosFromCSV = (csvContent: string): Municipio[] => {
    const lines = csvContent.trim().split('\n');
    const municipios: Municipio[] = [{ value: "todos", label: "Todos los municipios" }];
    const seen = new Set<string>();

    // Ignorar la primera línea (encabezados)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Parsear CSV respetando comillas
        const matches = line.match(/"([^"]*)"/g);
        if (matches && matches.length >= 4) {
            const nombreMunicipio = matches[3].replace(/"/g, '').trim();
            const valueKey = nombreMunicipio.toLowerCase().replace(/\s+/g, '_');

            if (!seen.has(valueKey)) {
                seen.add(valueKey);
                municipios.push({
                    value: valueKey,
                    label: capitalizeLabel(nombreMunicipio),
                });
            }
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
    const [csvContent, setCsvContent] = React.useState<string | null>(null);

    // Cargar municipios desde CSV al montar
    React.useEffect(() => {
        const loadMunicipios = async () => {
            try {
                const response = await fetch('/data/municipios-divipola.csv');
                const csvContent = await response.text();
                setCsvContent(csvContent);
            } catch (error) {
                console.error('Error cargando municipios:', error);
                // Fallback a lista vacía con "Todos"
                setMunicipios([{ value: "todos", label: "Todos los municipios" }]);
            } finally {
                setLoading(false);
            }
        };

        loadMunicipios();
    }, []);

    // Usar useMemo para cachear el parsing del CSV
    const municipiosParsed = React.useMemo(() => {
        if (!csvContent) {
            return [{ value: "todos", label: "Todos los municipios" }];
        }
        return parseMunicipiosFromCSV(csvContent);
    }, [csvContent]);

    React.useEffect(() => {
        if (csvContent) {
            setMunicipios(municipiosParsed);
        }
    }, [municipiosParsed, csvContent]);

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
