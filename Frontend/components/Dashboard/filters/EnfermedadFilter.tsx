'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface EnfermedadFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const ENFERMEDADES: FilterOption[] = [
    { value: "dengue", label: "Dengue" },
    { value: "malaria", label: "Malaria" },
    { value: "influenza", label: "Influenza A" },
    { value: "zika", label: "Virus Zika" },
];

export function EnfermedadFilter({ value, onChange }: EnfermedadFilterProps) {
    return (
        <FilterCombobox
            value={value}
            options={ENFERMEDADES}
            label="Enfermedad"
            icon="coronavirus"
            onChange={onChange}
            showSearch={false}
        />
    );
}
