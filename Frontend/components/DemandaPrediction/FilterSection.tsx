'use client';

import { DemandaMunicipioFilter } from './DemandaMunicipioFilter';
import { DemandaMonthsFilter } from './DemandaMonthsFilter';

interface FilterSectionProps {
    selectedMunicipio: string;
    onMunicipioChange: (municipio: string) => void;
    selectedMonth: string;
    onMonthChange: (month: string) => void;
    monthsProjection: number;
    onMonthsProjectionChange: (months: number) => void;
}

export function FilterSection({
    selectedMunicipio,
    onMunicipioChange,
    selectedMonth,
    onMonthChange,
    monthsProjection,
    onMonthsProjectionChange,
}: FilterSectionProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Predicción de Demanda Hospitalaria
            </h1>

            <div className="flex flex-wrap items-center gap-3 bg-[#e4efff] p-2 rounded-xl">
                {/* Filtros */}
                <div className="flex flex-wrap gap-4 items-end">
                    <DemandaMunicipioFilter
                        value={selectedMunicipio}
                        onChange={onMunicipioChange}
                    />
                    <DemandaMonthsFilter
                        value={monthsProjection}
                        onChange={onMonthsProjectionChange}
                    />
                </div>
            </div>
        </div>
    );
}