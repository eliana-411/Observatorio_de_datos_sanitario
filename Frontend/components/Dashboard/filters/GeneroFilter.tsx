'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface GeneroFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const GENEROS: FilterOption[] = [
    { value: "todos", label: "Todos" },
    { value: "masculino", label: "Masculino" },
    { value: "femenino", label: "Femenino" },
    { value: "otro", label: "No Binario/Otro" },
];

export function GeneroFilter({ value, onChange }: GeneroFilterProps) {
    return (
        <FilterCombobox
            value={value}
            options={GENEROS}
            label="Género"
            icon="diversity_3"
            onChange={onChange}
            showSearch={false}
            minWidth="w-48"
        />
    );
}
