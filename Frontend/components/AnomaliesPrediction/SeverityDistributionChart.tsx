'use client';

import React from 'react';

interface SeverityDistributionProps {
    highPercentage?: number;
    mediumPercentage?: number;
}

export function SeverityDistributionChart({
    highPercentage = 62,
    mediumPercentage = 38,
}: SeverityDistributionProps) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)] flex flex-col items-center justify-center relative">
            {/* Header */}
            <div className="absolute top-8 left-8">
                <h3 className="text-lg font-bold text-[#0b1d2d] leading-tight">
                    Distribución por Severidad
                </h3>
                <p className="text-xs text-[#414754]">
                    Índice de Prioridad de Respuesta
                </p>
            </div>

            {/* Doughnut Chart SVG */}
            <div className="relative w-48 h-48 mt-12 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e4efff"
                        strokeWidth="12"
                    />

                    {/* High severity segment */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#9e3d00"
                        strokeWidth="12"
                        strokeDasharray={`${(highPercentage / 100) * 282.7} 282.7`}
                        style={{ transition: 'stroke-dasharray 0.5s' }}
                    />

                    {/* Medium severity segment */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#0059bb"
                        strokeWidth="12"
                        strokeDasharray={`${(mediumPercentage / 100) * 282.7} 282.7`}
                        strokeDashoffset={-((highPercentage / 100) * 282.7)}
                        style={{ transition: 'stroke-dasharray 0.5s' }}
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#0b1d2d]">S-Score</span>
                    <p className="text-[10px] text-[#414754] uppercase font-bold">
                        Priority
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#9e3d00]"></div>
                    <div>
                        <p className="text-xs font-bold text-[#0b1d2d]">Alta</p>
                        <p className="text-lg font-black text-[#0b1d2d]">{highPercentage}%</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#0059bb]"></div>
                    <div>
                        <p className="text-xs font-bold text-[#0b1d2d]">Media</p>
                        <p className="text-lg font-black text-[#0b1d2d]">{mediumPercentage}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
