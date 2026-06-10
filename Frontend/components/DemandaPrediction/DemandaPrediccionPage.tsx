'use client';

import { useState } from 'react';
import { FilterSection } from './FilterSection';
import { ProjectionChart } from './ProjectionChart';
import { DemandaCriticaRanking } from './DemandaCriticaRanking';
import { PredictionMetricsPanel } from './PredictionMetricsPanel';
import { useFilterStore } from '@/store/filterStore';

export function DemandaPrediccionPage() {
    const [selectedMunicipio, setSelectedMunicipio] = useState('Alpha Hospital / Manizales');
    const [selectedMonth, setSelectedMonth] = useState('2024-10');
    const [monthsProjection, setMonthsProjection] = useState(6);
    const { perfilHistorico } = useFilterStore();

    return (
        <div className="p-8 space-y-8 bg-[#f7f9ff] min-h-screen">
            {/* Page Header & Filters */}
            <FilterSection
                selectedMunicipio={selectedMunicipio}
                onMunicipioChange={setSelectedMunicipio}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                monthsProjection={monthsProjection}
                onMonthsProjectionChange={setMonthsProjection}
            />

            {/* Main Forecast Visualization Area */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Large Chart Card */}
                <ProjectionChart monthsProjection={monthsProjection} />

                {/* Prediction Highlights */}
                <div className="space-y-6">
                    {perfilHistorico && (
                        <div className="bg-white rounded-2xl p-6 shadow-[0px_12px_32px_rgba(11,29,45,0.04)]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#e4efff] rounded-lg">
                                    <span className="material-symbols-outlined text-[#0059bb] text-xl">history</span>
                                </div>
                                <h3 className="text-sm font-bold text-[#0b1d2d] uppercase tracking-widest">Perfil Histórico</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-xs text-[#414754] uppercase tracking-widest">Tasa de Hospitalización</span>
                                    <span className="text-lg font-bold text-[#0b1d2d]">{perfilHistorico.tasa_hospitalizacion_media}%</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-xs text-[#414754] uppercase tracking-widest">Mes Crítico</span>
                                    <span className="text-lg font-bold text-[#EF4444]">Mes {perfilHistorico.mes_critico}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-xs text-[#414754] uppercase tracking-widest">Tendencia Reciente</span>
                                    <span className="text-xs font-bold px-2 py-1 bg-[#e4efff] text-[#0059bb] rounded capitalize">{perfilHistorico.tendencia_reciente}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-xs text-[#414754] uppercase tracking-widest">Género Predominante</span>
                                    <span className="text-xs font-bold text-[#0b1d2d]">{perfilHistorico.genero_predominante}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-xs text-[#414754] uppercase tracking-widest">Grupo Etario Predominante</span>
                                    <span className="text-xs font-bold text-[#0b1d2d]">{perfilHistorico.grupo_etario_predominante}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-xs text-[#414754] uppercase tracking-widest">Antecedentes Mentales</span>
                                    <span className="text-lg font-bold text-[#0b1d2d]">{perfilHistorico.antecedentes_mental_promedio.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#414754] uppercase tracking-widest">Consumo de Sustancias</span>
                                    <span className="text-lg font-bold text-[#0b1d2d]">{perfilHistorico.consumo_sustancias_promedio.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* NEW SECTION 2 & 3: Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Model Metrics */}
                <PredictionMetricsPanel />

                {/* Critical Demand Ranking */}
                <DemandaCriticaRanking />
            </div>
        </div>
    );
}
