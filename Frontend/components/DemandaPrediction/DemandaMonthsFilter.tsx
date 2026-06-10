'use client';

import React from 'react';
import { FilterCombobox } from '@/components/Dashboard/filters/FilterCombobox';
import { FilterOption } from '@/components/Dashboard/filters/types';

interface DemandaMonthsFilterProps {
    value: number;
    onChange: (value: number) => void;
}

export function DemandaMonthsFilter({ value, onChange }: DemandaMonthsFilterProps) {
    // Convertir lista de meses a opciones del filtro
    const options: FilterOption[] = React.useMemo(() => {
        return [1, 2, 3, 4, 5, 6].map(month => ({
            value: String(month),
            label: `${month} mes${month > 1 ? 'es' : ''}`
        }));
    }, []);

    const handleChange = (newValue: string) => {
        const numVal = parseInt(newValue, 10);
        if (!isNaN(numVal)) {
            onChange(numVal);
        }
    };

    return (
        <FilterCombobox
            value={String(value)}
            options={options}
            label="Meses a Proyectar"
            icon="calendar_today"
            onChange={handleChange}
            minWidth="w-[190px]"
            showSearch={false}
        />
    );
}
