'use client';

import React from 'react';

interface AnomalyType {
    label: string;
    count: number;
    total: number;
}

interface AnomalyDistributionChartProps {
    data?: AnomalyType[];
}

const defaultData: AnomalyType[] = [
    { label: 'Primeriza + letalidad alta', count: 412, total: 1248 },
    { label: 'Desplazamiento geográfico', count: 285, total: 1248 },
    { label: 'Gravedad individual', count: 198, total: 1248 },
    { label: 'Salud Mental + Sustancias', count: 165, total: 1248 },
    { label: 'Patrones multivariados complejos', count: 188, total: 1248 },
];

const colors = ['bg-[#0070ea]', 'bg-[#0070ea]/70', 'bg-[#0070ea]/50', 'bg-[#9e3d00]', 'bg-[#405e96]'];

export function AnomalyDistributionChart({ data = defaultData }: AnomalyDistributionChartProps) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-[#0b1d2d]">
                        Distribución por Tipo de Anomalía
                    </h3>
                    <p className="text-xs text-[#414754]">
                        Clasificación según el motor de inferencia neuronal
                    </p>
                </div>
                <button className="text-xs font-bold text-[#0059bb] flex items-center gap-1 hover:underline transition-colors">
                    Exportar Detalles
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>
            </div>

            {/* Bars */}
            <div className="space-y-6">
                {data.map((item, index) => {
                    const percentage = (item.count / item.total) * 100;
                    return (
                        <div key={item.label} className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#0b1d2d]">{item.label}</span>
                                <span className="text-[#414754]">
                                    {item.count} casos
                                </span>
                            </div>
                            <div className="h-3 w-full bg-[#e4efff] rounded-full overflow-hidden">
                                <div
                                    className={`
                                        h-full
                                        rounded-full
                                        transition-all
                                        duration-500
                                        ${colors[index % colors.length]}
                                    `}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
