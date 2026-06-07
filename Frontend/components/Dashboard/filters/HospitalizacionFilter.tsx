'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface HospitalizacionFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const HOSPITALIZACION: FilterOption[] = [
    { value: "todos", label: "Todos" },
    { value: "hospitalizado", label: "Hospitalizado" },
    { value: "no_hospitalizado", label: "No Hospitalizado" },
];

export function HospitalizacionFilter({ value, onChange }: HospitalizacionFilterProps) {
    return (
        <FilterCombobox
            value={value}
            options={HOSPITALIZACION}
            label="Hospitalización"
            icon="local_hospital"
            onChange={onChange}
            showSearch={false}
            minWidth="w-52"
        />
    );
}
