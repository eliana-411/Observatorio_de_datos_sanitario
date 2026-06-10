'use client';

import * as React from 'react';
import { useFilterStore } from '@/store/filterStore';
import {
    AnioFilter,
    MunicipioFilter,
    GrupoEtarioFilter,
    GeneroFilter,
    HospitalizacionFilter,
    MetodoFilter,
} from './filters';

interface FilterBarProps {
    hospitalizacionSeleccionada: string;
    onHospitalizacionChange: (hospitalizacion: string) => void;
    metodoSeleccionado: string;
    onMetodoChange: (metodo: string) => void;
}

export function FilterBar({
    hospitalizacionSeleccionada,
    onHospitalizacionChange,
    metodoSeleccionado,
    onMetodoChange
}: FilterBarProps) {
    const { selectedGenero, selectedGrupoEtario, selectedAnio, selectedMunicipio, setSelectedGenero, setSelectedGrupoEtario, setSelectedAnio, setSelectedMunicipio } = useFilterStore();

    // Manejadores de cambio
    const handleAnioChange = (value: number | null) => {
        setSelectedAnio(value);
    };

    const handleGeneroChange = (value: string) => {
        setSelectedGenero(value);
    };

    const handleGrupoEtarioChange = (value: string) => {
        setSelectedGrupoEtario(value);
    };

    const handleMunicipioChange = (value: string) => {
        setSelectedMunicipio(value);
    };

    const handleHospitalizacionChange = (value: string) => {
        onHospitalizacionChange(value);
    };

    const handleMetodoChange = (value: string) => {
        onMetodoChange(value);
    };

    return (
        <section className="bg-surface-container bg-[#e4efff] rounded-xl p-4 flex gap-4 items-center shadow-sm overflow-x-auto pb-2 flex-nowrap">
            {/* Año - Primer Filtro */}
            <AnioFilter
                value={selectedAnio}
                onChange={handleAnioChange}
            />

            {/* Municipios */}
            <MunicipioFilter
                value={selectedMunicipio}
                onChange={handleMunicipioChange}
            />

            {/* Grupo Etario */}
            <GrupoEtarioFilter
                value={selectedGrupoEtario}
                onChange={handleGrupoEtarioChange}
            />

            {/* Género */}
            <GeneroFilter
                value={selectedGenero}
                onChange={handleGeneroChange}
            />

            {/* Método Usado */}
            <MetodoFilter
                value={metodoSeleccionado}
                onChange={handleMetodoChange}
            />

            {/* Hospitalización */}
            <HospitalizacionFilter
                value={hospitalizacionSeleccionada}
                onChange={handleHospitalizacionChange}
            />

        </section>
    );
}
