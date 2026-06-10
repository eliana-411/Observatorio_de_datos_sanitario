'use client';

import { useState } from 'react';
import { FilterSection } from './FilterSection';
import { ProjectionChart } from './ProjectionChart';
import { TrimestrProjectionSection } from './TrimestrProjectionSection';
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

            {/* NEW SECTION 1: Proyección Trimestral de Demanda */}
            <TrimestrProjectionSection />

            {/* NEW SECTION 2 & 3: Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Projection Details */}
                <div className="bg-[#eef4ff] rounded-2xl p-8 flex flex-col gap-8 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-[#0059bb]">analytics</span>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#0b1d2d]">
                            Detalle de Proyección Mensual
                        </h3>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <div className="flex flex-col">
                            <span className="text-5xl font-black text-[#0b1d2d] tracking-tighter">184</span>
                            <span className="text-[11px] font-bold text-[#414754] uppercase tracking-widest">
                                hospitalizaciones_predichas
                            </span>
                        </div>
                        <div className="bg-[#0059bb]/10 px-3 py-1 rounded-full border border-[#0059bb]/20">
                            <span className="text-xs font-black text-[#0059bb]">Range ±11</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#ba1a1a]/10 rounded-xl border border-[#ba1a1a]/10">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#ba1a1a]">priority_high</span>
                                <span className="text-xs font-black text-[#93000a] uppercase">Nivel de Alerta</span>
                            </div>
                            <span className="px-4 py-1 bg-[#ba1a1a] text-white text-[10px] font-black rounded uppercase tracking-widest">
                                CRÍTICO
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[#414754] uppercase tracking-widest">
                                    vs media_historica
                                </span>
                                <div className="flex items-center gap-2 text-[#ba1a1a]">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    <span className="text-lg font-black">+24.8%</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-[#e4efff] text-[9px] font-black rounded text-[#414754] uppercase">
                                    al alza
                                </span>
                                <span className="px-2 py-1 bg-[#e4efff] text-[9px] font-black rounded text-[#414754] uppercase">
                                    Dic
                                </span>
                                <span className="px-2 py-1 bg-[#e4efff] text-[9px] font-black rounded text-[#414754] uppercase">
                                    14.2% Rate
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Critical Demand Ranking */}
                <DemandaCriticaRanking />
            </div>

            {/* Metrics Bento Grid */}
            <PredictionMetricsPanel />

            {/* Observation Notes */}
            <div className="glass-panel p-6 rounded-2xl border border-white/40 shadow-sm flex items-start gap-6">
                <div className="bg-[#0059bb]/20 p-4 rounded-full">
                    <span className="material-symbols-outlined text-[#0059bb] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        lightbulb
                    </span>
                </div>
                <div className="space-y-2">
                    <h6 className="text-sm font-black text-[#0059bb] uppercase tracking-widest">
                        Inferencia del Sentinel AI
                    </h6>
                    <p className="text-sm text-[#414754] leading-relaxed max-w-4xl">
                        El modelo detecta una correlación del 88% entre el descenso de temperatura estacional y el aumento de ingresos
                        respiratorios para el periodo Ene-Feb 2025. Se recomienda incrementar la disponibilidad de camas en un 15%
                        antes de la segunda semana de enero. La precisión del modelo se mantiene estable sobre el 94% para el nodo
                        Alpha Manizales.
                    </p>
                </div>
            </div>
        </div>
    );
}
