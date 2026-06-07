'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface AnioFilterProps {
    value: number;
    onChange: (value: number) => void;
}

const ANOS: FilterOption[] = [
    { value: "2020", label: "2020" },
    { value: "2021", label: "2021" },
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
];

export function AnioFilter({ value, onChange }: AnioFilterProps) {
    const handleChange = (selectedValue: string) => {
        onChange(Number(selectedValue));
    };

    return (
        <FilterCombobox
            value={String(value)}
            options={ANOS}
            label="Año"
            icon="calendar_month"
            onChange={handleChange}
            showSearch={false}
            minWidth="w-[130px]"
        />
    );
}
