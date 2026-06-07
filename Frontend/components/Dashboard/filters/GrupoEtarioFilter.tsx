'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface GrupoEtarioFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const GRUPOS_ETARIOS: FilterOption[] = [
    { value: "todos", label: "Todos" },
    { value: "pediatria", label: "0-12 Pediatría" },
    { value: "adultos", label: "13-64 Adultos" },
    { value: "geriatria", label: "65+ Geriatría" },
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
        />
    );
}
