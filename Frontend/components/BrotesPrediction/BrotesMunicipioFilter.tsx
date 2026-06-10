'use client';

import React from 'react';
import { FilterCombobox } from '@/components/Dashboard/filters/FilterCombobox';
import { useFilterStore } from '@/store/filterStore';
import { useBrotesApi } from '@/hooks/useBrotesApi';
import { FilterOption } from '@/components/Dashboard/filters/types';

interface BrotesMunicipioFilterProps {
    municipios: string[];
    loading?: boolean;
}

export function BrotesMunicipioFilter({ municipios, loading = false }: BrotesMunicipioFilterProps) {
    const { selectedMunicipio, setSelectedMunicipio } = useFilterStore();

    // Convertir lista de municipios a opciones del filtro
    const options: FilterOption[] = React.useMemo(() => {
        const baseOptions: FilterOption[] = [
            
        ];

        const municipioOptions = municipios
            .sort()
            .map(m => ({
                value: m.toLowerCase().replace(/\s+/g, '_'),
                label: m
            }));

        return [...baseOptions, ...municipioOptions];
    }, [municipios]);

    // Validar que el municipio seleccionado esté en la lista
    React.useEffect(() => {
        if (municipios.length > 0) {
            // Si está en "todos", poner el primer municipio
            if (selectedMunicipio === 'todos') {
                const primerMunicipio = municipios[0].toLowerCase().replace(/\s+/g, '_');
                setSelectedMunicipio(primerMunicipio);
            } else {
                // Validar que el municipio esté en la lista
                const municipioEstaEnLista = municipios.some(
                    m => m.toLowerCase().replace(/\s+/g, '_') === selectedMunicipio || m === selectedMunicipio
                );

                if (!municipioEstaEnLista) {
                    const primerMunicipio = municipios[0].toLowerCase().replace(/\s+/g, '_');
                    setSelectedMunicipio(primerMunicipio);
                }
            }
        }
    }, [municipios, selectedMunicipio, setSelectedMunicipio]);

    const handleChange = (value: string) => {
        setSelectedMunicipio(value);
    };

    return (
        <FilterCombobox
            value={selectedMunicipio}
            options={options}
            label="Municipio"
            icon="location_on"
            onChange={handleChange}
            minWidth="w-[220px]"
            loading={loading}
            placeholder="Buscar municipio..."
            hasScroll={true}
        />
    );
}
