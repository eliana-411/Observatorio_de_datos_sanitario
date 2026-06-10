'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface AnomalyType {
    label: string;
    count: number;
    total: number;
}

interface AnomalyDistributionResponse {
    status: string;
    totalAnomalias: number;
    distribucion: Record<string, number>;
    porSeveridad: Record<string, number>;
}

interface AnomalyDistributionChartProps {
    data?: AnomalyType[];
}

const colors = ['bg-[#0070ea]', 'bg-[#0070ea]/70', 'bg-[#0070ea]/50', 'bg-[#9e3d00]', 'bg-[#405e96]'];

export function AnomalyDistributionChart({ data: initialData }: AnomalyDistributionChartProps) {
    const [data, setData] = useState<AnomalyType[]>(initialData || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
    const [totalAnomalias, setTotalAnomalias] = useState(0);

    useEffect(() => {
        const fetchDistribution = async () => {
            try {
                const response = await api.get<AnomalyDistributionResponse>('/anomalias/distribucion');
                if (response.data && response.data.distribucion) {
                    const total = response.data.totalAnomalias;
                    setTotalAnomalias(total);
                    const formattedData: AnomalyType[] = Object.entries(response.data.distribucion).map(
                        ([tipo, casos]) => ({
                            label: tipo,
                            count: casos,
                            total: total,
                        })
                    );
                    setData(formattedData);
                } else if (response.error) {
                    setError(response.error.message);
                } else {
                    setError('Estructura de datos inválida del servidor');
                }
            } catch (error) {
                console.error('Error fetching anomaly distribution:', error);
                setError('Error al cargar la distribución');
                if (initialData) {
                    setData(initialData);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDistribution();
    }, [initialData]);

    if (loading && data.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)]">
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    if (error && data.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)]">
                <p className="text-sm text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)]">
            {/* Header */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-[#0b1d2d]">
                    Distribución por Tipo de Anomalía
                </h3>
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
