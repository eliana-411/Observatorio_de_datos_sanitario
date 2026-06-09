'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface AnioFilterProps {
    value: number | null;
    onChange: (value: number | null) => void;
}

const ANOS: FilterOption[] = [
    { value: "todos", label: "Todos" },
    { value: "2020", label: "2020" },
    { value: "2021", label: "2021" },
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
];

export function AnioFilter({ value, onChange }: AnioFilterProps) {
    const handleChange = (selectedValue: string) => {
        // Si es "todos", pasar null para indicar que se deben traer todos los años
        const numValue = selectedValue === "todos" ? null : Number(selectedValue);
        onChange(numValue);
    };

    return (
        <FilterCombobox
            value={String(value === null ? "todos" : value)}
            options={ANOS}
            label="Año"
            icon="calendar_month"
            onChange={handleChange}
            showSearch={false}
            minWidth="w-[130px]"
        />
    );
}
