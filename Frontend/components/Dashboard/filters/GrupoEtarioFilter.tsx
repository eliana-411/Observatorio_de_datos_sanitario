'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface GrupoEtarioFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const GRUPOS_ETARIOS: FilterOption[] = [
    { value: "todos", label: "Todos" },
    { value: "Adolescente", label: "Adolescente" },
    { value: "Joven", label: "Jóven" },
    { value: "Adulto", label: "Adulto" },
    { value: "AdultoMayor", label: "Adulto Mayor" },
];

export function GrupoEtarioFilter({ value, onChange }: GrupoEtarioFilterProps) {
    return (
        <FilterCombobox
            value={value}
            options={GRUPOS_ETARIOS}
            label="Rango de Edad"
            icon="person"
            onChange={onChange}
            showSearch={false}
            minWidth="w-[190px]"
        />
    );
}
