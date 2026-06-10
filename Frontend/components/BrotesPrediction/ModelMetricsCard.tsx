'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useBrotesApi, ModelMetrics } from '@/hooks/useBrotesApi';

export function ModelMetricsCard() {
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { fetchModelInfo } = useBrotesApi();

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                setLoading(true);
                const data = await fetchModelInfo();
                if (!data) {
                    setError('No se pudieron cargar las métricas del modelo');
                    // Valores por defecto para desarrollo
                    setMetrics({
                        rmse: 0,
                        mae: 0,
                        r2: 0,
                        confiabilidad_modelo: 0,
                        municipios_entrenados: 0,
                    });
                } else {
                    setMetrics(data);
                    setError(null);
                }
            } catch (err) {
                console.error('Error loading model metrics:', err);
                setError('Error al cargar las métricas');
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, [fetchModelInfo]);

    // Formatear números a 2 decimales
    const formatMetric = (value: number | undefined) => {
        return (value ?? 0).toFixed(2);
    };

    return (
        <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff]">
            <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-0">
                Métricas del Modelo
            </h3>

            {error && (
                <p className="text-xs text-red-500 mb-4">{error}</p>
            )}

            <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded">
                    <p className="text-xs text-[#8d919b] mb-1 uppercase font-bold">RMSE</p>
                    <p className="text-lg font-bold text-[#0b1d2d]">
                        {loading ? '...' : formatMetric(metrics?.rmse)}
                    </p>
                </div>
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded">
                    <p className="text-xs text-[#8d919b] mb-1 uppercase font-bold">MAE</p>
                    <p className="text-lg font-bold text-[#0b1d2d]">
                        {loading ? '...' : formatMetric(metrics?.mae)}
                    </p>
                </div>
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded">
                    <p className="text-xs text-[#8d919b] mb-1 uppercase font-bold">R²</p>
                    <p className="text-lg font-bold text-[#0059bb]">
                        {loading ? '...' : formatMetric(metrics?.r2)}
                    </p>
                </div>
            </div>
        </Card>
    );
}
