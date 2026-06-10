'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface SeverityDistributionProps {
    highCount?: number;
    mediumCount?: number;
}

interface AnomalyDistributionResponse {
    status: string;
    totalAnomalias: number;
    distribucion: Record<string, number>;
    porSeveridad: Record<string, number>;
}

export function SeverityDistributionChart({
    highCount: initialHighCount,
    mediumCount: initialMediumCount,
}: SeverityDistributionProps) {
    const [highCount, setHighCount] = useState<number>(initialHighCount || 0);
    const [mediumCount, setMediumCount] = useState<number>(initialMediumCount || 0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSeverityData = async () => {
            try {
                const response = await api.get<AnomalyDistributionResponse>('/anomalias/distribucion');
                if (response.data?.porSeveridad) {
                    const alta = response.data.porSeveridad['Alta'] || response.data.porSeveridad['alta'] || 0;
                    const media = response.data.porSeveridad['Media'] || response.data.porSeveridad['media'] || 0;

                    setHighCount(alta);
                    setMediumCount(media);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (error) {
                console.error('Error fetching severity distribution:', error);
                setError('Error al cargar la distribución');
            } finally {
                setLoading(false);
            }
        };

        fetchSeverityData();
    }, []);

    const total = highCount + mediumCount;
    const highPercentage = total > 0 ? (highCount / total) * 100 : 0;
    const mediumPercentage = total > 0 ? (mediumCount / total) * 100 : 0;

    // Calculate pie slice angles
    const highAngle = (highCount / total) * 360;
    const mediumAngle = (mediumCount / total) * 360;

    const getPieSlicePath = (startAngle: number, angle: number, radius: number = 40, innerRadius: number = 0) => {
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (startAngle + angle - 90) * (Math.PI / 180);

        const x1 = 50 + radius * Math.cos(startRad);
        const y1 = 50 + radius * Math.sin(startRad);
        const x2 = 50 + radius * Math.cos(endRad);
        const y2 = 50 + radius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)] flex flex-col items-center justify-center">
                <div className="h-64 bg-gray-200 rounded-lg animate-pulse w-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)]">
                <p className="text-sm text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)]">
            {/* Header */}
            <h3 className="text-lg font-bold text-[#0b1d2d] mb-6">
                Distribución por Severidad
            </h3>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                {/* Pie Chart SVG */}
                <div className="flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-48 h-48">
                        {/* High severity slice */}
                        <path
                            d={getPieSlicePath(0, highAngle)}
                            fill="#9e3d00"
                            stroke="white"
                            strokeWidth="1"
                        />

                        {/* Medium severity slice */}
                        <path
                            d={getPieSlicePath(highAngle, mediumAngle)}
                            fill="#0059bb"
                            stroke="white"
                            strokeWidth="1"
                        />
                    </svg>
                </div>

                {/* Legend and Stats */}
                <div className="flex flex-col gap-6">
                    {/* Total */}
                    <div className="text-center lg:text-left">
                        <p className="text-sm text-[#414754] font-medium">Total de Anomalías</p>
                        <p className="text-3xl font-bold text-[#0b1d2d]">{total}</p>
                    </div>

                    {/* Severity Items */}
                    <div className="space-y-4">
                        {/* Alta */}
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-4 h-4 rounded-full bg-[#9e3d00]"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0b1d2d]">Alta</p>
                                <div className="flex gap-4 text-sm text-[#414754]">
                                    <span>{highCount} anomalías</span>
                                    <span className="font-bold text-[#0b1d2d]">{highPercentage.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-4 h-4 rounded-full bg-[#0059bb]"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0b1d2d]">Media</p>
                                <div className="flex gap-4 text-sm text-[#414754]">
                                    <span>{mediumCount} anomalías</span>
                                    <span className="font-bold text-[#0b1d2d]">{mediumPercentage.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
