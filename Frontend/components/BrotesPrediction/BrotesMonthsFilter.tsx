'use client';

import React from 'react';
import { FilterCombobox } from '@/components/Dashboard/filters/FilterCombobox';
import { FilterOption } from '@/components/Dashboard/filters/types';

interface BrotesMonthsFilterProps {
    value: number;
    onChange: (value: number) => void;
}

export function BrotesMonthsFilter({ value, onChange }: BrotesMonthsFilterProps) {
    // Convertir lista de meses a opciones del filtro
    const options: FilterOption[] = React.useMemo(() => {
        return [1, 2, 3, 4, 5, 6].map(month => ({
            value: String(month),
            label: `${month} mes${month > 1 ? 'es' : ''}`
        }));
    }, []);

    const handleChange = (value: string) => {
        const numVal = parseInt(value, 10);
        if (!isNaN(numVal)) {
            onChange(numVal);
        }
    };

    return (
        <FilterCombobox
            value={String(value)}
            options={options}
            label="Meses a Predecir"
            icon="calendar_today"
            onChange={handleChange}
            minWidth="w-[190px]"
            showSearch={false}
        />
    );
}
