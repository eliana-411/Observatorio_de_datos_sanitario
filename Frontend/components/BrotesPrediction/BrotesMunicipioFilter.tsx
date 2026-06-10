'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { FilterCombobox } from '@/components/Dashboard/filters/FilterCombobox';
import { useFilterStore } from '@/store/filterStore';
import { useBrotesApi } from '@/hooks/useBrotesApi';
import { FilterOption } from '@/components/Dashboard/filters/types';

interface BrotesMunicipioFilterProps {
    municipios: string[];
    loading?: boolean;
}

export const BrotesMunicipioFilter = React.memo(function BrotesMunicipioFilter({ municipios, loading = false }: BrotesMunicipioFilterProps) {
    const { selectedMunicipio, setSelectedMunicipio } = useFilterStore();

    // Normalizar municipio a formato consistente
    const normalizeMunicipio = useCallback((m: string): string => {
        return m.toLowerCase().replace(/\s+/g, '_');
    }, []);

    // Convertir lista de municipios a opciones del filtro (memoizado)
    const options: FilterOption[] = useMemo(() => {
        if (!municipios || municipios.length === 0) return [];

        return [...municipios]
            .sort()
            .map(m => ({
                value: normalizeMunicipio(m),
                label: m
            }));
    }, [municipios, normalizeMunicipio]);

    // Validar que el municipio seleccionado esté en la lista (solo se dispara cuando cambian municipios)
    useEffect(() => {
        if (municipios.length === 0) return;

        const municipioNormalizado = normalizeMunicipio(selectedMunicipio);
        const municipioValido = municipios.some(
            m => normalizeMunicipio(m) === municipioNormalizado
        );

        // Solo actualizar si el municipio actual no es válido
        if (!municipioValido) {
            setSelectedMunicipio(normalizeMunicipio(municipios[0]));
        }
    }, [municipios]); // Solo depende de cambios en municipios, no de selectedMunicipio

    const handleChange = useCallback((value: string) => {
        setSelectedMunicipio(value);
    }, [setSelectedMunicipio]);

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
});
