'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api/client';

interface VariableImportancia {
    variable: string;
    importancia: number;
    porcentaje: number;
}

export function FeatureImportanceCard() {
    const [features, setFeatures] = useState<VariableImportancia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVariablesImportancia = async () => {
            try {
                setLoading(true);
                const response = await api.get<VariableImportancia[]>('/Brotes/variables-importancia');

                if (response.error) {
                    setError(response.error.message);
                    setFeatures([]);
                } else if (response.data) {
                    setFeatures(response.data.slice(0, 5));
                    setError(null);
                }
            } catch (err) {
                setError('Error al cargar las variables de importancia');
                setFeatures([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVariablesImportancia();
    }, []);

    return (
        <Card className="p-6 bg-white border border-[#e4efff]">
            <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-4">
                Top 5 Variables de Impacto
            </h3>

            {loading && (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-1">
                            <div className="h-4 bg-[#f0f0f0] rounded animate-pulse"></div>
                            <div className="h-2 bg-[#f0f0f0] rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="p-3 bg-[#fee] border border-[#fcc] rounded text-sm text-[#c33]">
                    {error}
                </div>
            )}

            {!loading && !error && features.length > 0 && (
                <div className="space-y-4">
                    {features.map((feature, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#0b1d2d]">{feature.variable}</span>
                                <span className="font-mono text-xs font-bold text-[#0059bb]">
                                    {feature.porcentaje.toFixed(2)}%
                                </span>
                            </div>
                            <div className="w-full bg-[#f7f9ff] h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#0059bb] h-full transition-all"
                                    style={{ width: `${feature.porcentaje}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && features.length === 0 && (
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded text-sm text-[#8d919b]">
                    No hay datos de variables disponibles
                </div>
            )}
        </Card>
    );
}
