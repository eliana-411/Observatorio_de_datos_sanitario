'use client';

import { Card } from '@/components/ui/card';

export function PredictionSummaryCard() {
    return (
        <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff] h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-1">
                        Resumen de Predicción
                    </h3>
                    <p className="text-sm text-[#666]">Próximos 30 días proyectados</p>
                </div>
                <div className="bg-[#ffb4ab] text-[#690005] px-3 py-1 rounded text-xs font-bold border border-[#ffb4ab]">
                    CRÍTICO
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-4">
                <div className="flex flex-col">
                    <span className="text-[#666] text-sm">Casos Predichos</span>
                    <span className="font-display-lg text-4xl font-bold text-[#0059bb]">142</span>
                    <div className="flex items-center gap-1 text-[#ffb4ab] text-xs mt-1">
                        <span className="material-symbols-outlined text-sm" data-icon="trending_up">
                            trending_up
                        </span>
                        <span>+12.4% vs Mes Ant.</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[#666] text-sm">Nivel Alerta</span>
                    <span className="font-display-lg text-4xl font-bold text-[#ffb4ab]">92.4%</span>
                    <span className="text-[#666] text-xs mt-1">Confiabilidad del Modelo</span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e4efff] grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#666]">Media Histórica</span>
                    <span className="text-sm font-mono font-bold">112</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#666]">Umbral Seguridad</span>
                    <span className="text-sm font-mono font-bold">125</span>
                </div>
            </div>
        </Card>
    );
}
