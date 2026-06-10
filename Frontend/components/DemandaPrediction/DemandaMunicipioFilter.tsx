'use client';

import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { FilterCombobox } from '@/components/Dashboard/filters/FilterCombobox';
import { useFilterStore } from '@/store/filterStore';
import { useDemandaApi } from '@/hooks/useDemandaApi';
import { FilterOption } from '@/components/Dashboard/filters/types';

export const DemandaMunicipioFilter = React.memo(function DemandaMunicipioFilter() {
    const { selectedMunicipio, setSelectedMunicipio } = useFilterStore();
    const [municipios, setMunicipios] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { fetchMunicipios } = useDemandaApi();

    // Cargar municipios al montar
    useEffect(() => {
        const loadMunicipios = async () => {
            setLoading(true);
            const data = await fetchMunicipios();
            setMunicipios(data);
            setLoading(false);
        };

        loadMunicipios();
    }, [fetchMunicipios]);

    // Convertir lista de municipios a opciones del filtro (memoizado)
    const options: FilterOption[] = useMemo(() => {
        if (!municipios || municipios.length === 0) return [];

        return [...municipios]
            .sort()
            .map(m => ({
                value: m,
                label: m
            }));
    }, [municipios]);

    // Validar que el municipio seleccionado esté en la lista
    useEffect(() => {
        if (municipios.length === 0) return;

        const municipioValido = municipios.some(m => m === selectedMunicipio);

        // Solo actualizar si el municipio actual no es válido
        if (!municipioValido) {
            setSelectedMunicipio(municipios[0]);
        }
    }, [municipios, selectedMunicipio, setSelectedMunicipio]);

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