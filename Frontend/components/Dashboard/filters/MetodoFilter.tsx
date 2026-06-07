'use client';

import { FilterCombobox } from './FilterCombobox';
import { FilterOption } from './types';

interface MetodoFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const METODOS: FilterOption[] = [
    { value: "todos", label: "Todos los métodos" },
    { value: "ahogamiento", label: "Ahogamiento" },
    { value: "ahorcamiento", label: "Ahorcamiento" },
    { value: "intoxicacion_medicamentos", label: "Intoxicación Por Medicamentos" },
    { value: "intoxicacion_otras_sustancias", label: "Intoxicación Por Otras Sustancias" },
    { value: "intoxicacion_plaguicidas", label: "Intoxicación Por Plaguicidas" },
    { value: "lesion_arma_cortopunzante", label: "Lesión Por Arma Cortopunzante" },
    { value: "lesion_arma_fuego", label: "Lesión Por Arma De Fuego" },
    { value: "precipitacion_caida", label: "Precipitación (Caída Desde Altura)" },
    { value: "quemadura", label: "Quemadura" },
    { value: "otro", label: "Otro" }
];

export function MetodoFilter({ value, onChange }: MetodoFilterProps) {
    return (
        <FilterCombobox
            value={value}
            options={METODOS}
            label="Método Usado"
            icon="settings_suggest"
            onChange={onChange}
            showSearch={true}
            hasScroll={true}
            minWidth="w-[280px]"
            popoverMinWidth="310px"
        />
    );
}
