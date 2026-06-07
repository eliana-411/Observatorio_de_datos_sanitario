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
    onGeneroChange?: (genero: string) => void;
    onGrupoEtarioChange?: (grupoEtario: string) => void;
    onAnioChange?: (anio: number) => void;
}

export function FilterBar({ onGeneroChange, onGrupoEtarioChange, onAnioChange }: FilterBarProps) {
    const { selectedGenero, selectedGrupoEtario, selectedAnio, setSelectedGenero, setSelectedGrupoEtario, setSelectedAnio } = useFilterStore();

    // Estados locales para filtros que no persisten en store
    const [municipioSeleccionado, setMunicipioSeleccionado] = React.useState("todos");
    const [hospitalizacionSeleccionada, setHospitalizacionSeleccionada] = React.useState("todos");
    const [metodoSeleccionado, setMetodoSeleccionado] = React.useState("todos");

    // Manejadores de cambio
    const handleAnioChange = (value: number) => {
        setSelectedAnio(value);
        onAnioChange?.(value);
    };

    const handleGeneroChange = (value: string) => {
        setSelectedGenero(value);
        onGeneroChange?.(value);
    };

    const handleGrupoEtarioChange = (value: string) => {
        setSelectedGrupoEtario(value);
        onGrupoEtarioChange?.(value);
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
                value={municipioSeleccionado}
                onChange={setMunicipioSeleccionado}
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
                onChange={setMetodoSeleccionado}
            />

            {/* Hospitalización */}
            <HospitalizacionFilter
                value={hospitalizacionSeleccionada}
                onChange={setHospitalizacionSeleccionada}
            />

        </section>
    );
}
