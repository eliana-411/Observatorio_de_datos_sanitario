'use client';

import * as React from 'react';
import { useFilterStore } from '@/store/filterStore';
import {
    MunicipioFilter,
    GeneroFilter,
    AnioFilter,
    GrupoEtarioFilter,
    EnfermedadFilter,
} from './filters';

interface FilterBarProps {
    onGeneroChange?: (genero: string) => void;
    onAnioChange?: (anio: number) => void;
}

export function FilterBar({ onGeneroChange, onAnioChange }: FilterBarProps) {
    const { selectedGenero, selectedAnio, setSelectedGenero, setSelectedAnio } = useFilterStore();

    // Estados locales para filtros que no persisten en store
    const [municipioSeleccionado, setMunicipioSeleccionado] = React.useState("todos");
    const [grupoEtarioSeleccionado, setGrupoEtarioSeleccionado] = React.useState("todos");
    const [enfermedadSeleccionada, setEnfermedadSeleccionada] = React.useState("dengue");

    // Manejadores de cambio
    const handleAnioChange = (value: number) => {
        setSelectedAnio(value);
        onAnioChange?.(value);
    };

    const handleGeneroChange = (value: string) => {
        setSelectedGenero(value);
        onGeneroChange?.(value);
    };

    return (
        <section className="bg-surface-container bg-[#e4efff] rounded-xl p-4 flex gap-4 items-center shadow-sm">
            {/* Municipios */}
            <MunicipioFilter
                value={municipioSeleccionado}
                onChange={setMunicipioSeleccionado}
            />

            {/* Grupo Etario */}
            <GrupoEtarioFilter
                value={grupoEtarioSeleccionado}
                onChange={setGrupoEtarioSeleccionado}
            />

            {/* Género */}
            <GeneroFilter
                value={selectedGenero}
                onChange={handleGeneroChange}
            />

            {/* Enfermedad */}
            <EnfermedadFilter
                value={enfermedadSeleccionada}
                onChange={setEnfermedadSeleccionada}
            />

            {/* Año */}
            <AnioFilter
                value={selectedAnio}
                onChange={handleAnioChange}
            />
        </section>
    );
}
