'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { KPICard } from './KPICard';

interface ConfiabilidadDto {
    reliabilityPct: number;
    separability: number;
    stabilityCv: number;
}

interface ModelInfoDto {
    totalAnomalias: number;
    pctAnomalias: number;
    entrenado: string;
}

interface TestDto {
    pctAnomalies: number;
    nAnomalies: number;
}

interface AnomaliesInfoResponse {
    confiabilidad: ConfiabilidadDto;
    modelInfo: ModelInfoDto;
    test: TestDto;
}

interface CompactMetricProps {
    value: string;
    label: string;
    subtext?: string;
}

function CompactMetric({ value, label, subtext }: CompactMetricProps) {
    return (
        <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
            </div>
            <p className="text-lg font-bold text-[#0b1d2d] whitespace-nowrap">{value}</p>
        </div>
    );
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

export function AnomalyMetricsSection() {
    const [metricsData, setMetricsData] = useState<AnomaliesInfoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get<AnomaliesInfoResponse>('/anomalias/info');
                if (response.data) {
                    setMetricsData(response.data);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (error) {
                console.error('Error fetching anomaly metrics:', error);
                setError('Error al cargar las métricas');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            </section>
        );
    }

    if (error || !metricsData) {
        console.error('Error loading metrics:', error);
        return (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-xl text-xs text-red-600">Error: {error}</div>
            </section>
        );
    }

    const reliabilityValue = metricsData.confiabilidad?.reliabilityPct ?? 0;
    const separability = metricsData.confiabilidad?.separability ?? 0;
    const stabilityCv = metricsData.confiabilidad?.stabilityCv ?? 0;
    const totalAnomalies = metricsData.modelInfo?.totalAnomalias ?? 0;
    const pctAnomalies = metricsData.modelInfo?.pctAnomalias ?? 0;
    const entrenado = metricsData.modelInfo?.entrenado ?? 'N/A';

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KPI 1: Confiabilidad */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-[#0059bb]" />
                    <h3 className="text-sm font-semibold text-gray-900">Confiabilidad</h3>
                </div>
                <div className="space-y-3">
                    <CompactMetric
                        value={`${reliabilityValue.toFixed(1)}%`}
                        label="Confiabilidad del modelo"
                    />
                    <div className="border-t border-gray-100 pt-3">
                        <CompactMetric
                            value={`${separability.toFixed(3)}`}
                            label="Capacidad de separación"
                        />
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                        <CompactMetric
                            value={`${stabilityCv.toFixed(3)}`}
                            label="Estabilidad"
                        />
                    </div>
                </div>
            </div>

            {/* KPI 2: Resumen */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-[#9e3d00]" />
                    <h3 className="text-sm font-semibold text-gray-900">Resumen</h3>
                </div>
                <div className="space-y-3">
                    <CompactMetric
                        value={totalAnomalies.toString()}
                        label="Anomalías detectadas"
                    />
                    <div className="border-t border-gray-100 pt-3">
                        <CompactMetric
                            value={`${pctAnomalies.toFixed(2)}%`}
                            label="De los casos son anómalos"
                        />
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                        <CompactMetric
                            value={formatDate(entrenado)}
                            label="Último entrenamiento"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
