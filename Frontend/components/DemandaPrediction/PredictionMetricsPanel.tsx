'use client';

import { useState, useEffect } from 'react';
import { useDemandaApi, DemandaModelMetrics } from '@/hooks/useDemandaApi';

interface PredictionMetricsPanelProps {
    metrics?: DemandaModelMetrics;
}

export function PredictionMetricsPanel({ metrics }: PredictionMetricsPanelProps) {
    const [modelMetrics, setModelMetrics] = useState<DemandaModelMetrics | null>(metrics || null);
    const [loading, setLoading] = useState(!metrics);
    const [error, setError] = useState<string | null>(null);

    const { fetchModelInfo } = useDemandaApi();

    useEffect(() => {
        if (metrics) {
            setModelMetrics(metrics);
            setLoading(false);
            return;
        }

        const loadModelInfo = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchModelInfo();
                if (data) {
                    setModelMetrics(data);
                } else {
                    setError('No se pudieron cargar las métricas del modelo');
                }
            } catch (err) {
                console.error('Error loading model metrics:', err);
                setError('Error al cargar las métricas del modelo');
            } finally {
                setLoading(false);
            }
        };

        loadModelInfo();
    }, [metrics, fetchModelInfo]);

    // Mapeo de claves a etiquetas legibles
    const metricLabels: Record<keyof DemandaModelMetrics, string> = {
        r2: 'R² Score',
        rmse: 'RMSE',
        mae: 'MAE',
        brote_umbral: 'Umbral de Brote',
        brote_precision: 'Precisión Brote',
        brote_recall: 'Recall Brote',
        brote_f1: 'F1-Score Brote',
    };

    // Formateador de valores según el tipo de métrica
    const formatMetricValue = (key: keyof DemandaModelMetrics, value: number): string => {
        if (['r2', 'brote_precision', 'brote_recall', 'brote_f1'].includes(key)) {
            return `${(value * 100).toFixed(2)}%`;
        }
        if (key === 'brote_umbral') {
            return value.toFixed(1);
        }
        return value.toFixed(4);
    };

    return (
        <div className="bg-[#eef4ff] rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-[#0059bb]">analytics</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0b1d2d]">
                    Métricas del Modelo de Demanda
                </h3>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <span className="text-sm text-[#414754]">Cargando métricas...</span>
                </div>
            )}

            {error && (
                <div className="flex justify-center items-center py-8 text-sm text-[#ba1a1a]">
                    {error}
                </div>
            )}

            {!loading && !error && modelMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(modelMetrics).map(([key, value]) => (
                        <div
                            key={key}
                            className="bg-white rounded-xl p-4 border border-[#d2e4fb] hover:border-[#0059bb] transition-colors"
                        >
                            <p className="text-[10px] font-bold text-[#414754] uppercase tracking-widest mb-2">
                                {metricLabels[key as keyof DemandaModelMetrics]}
                            </p>
                            <p className="text-xl font-black text-[#0b1d2d]">
                                {formatMetricValue(key as keyof DemandaModelMetrics, value)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
