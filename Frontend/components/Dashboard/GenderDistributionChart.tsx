'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDistribucionGenero, GeneroDistribution } from '@/lib/api/analytics';

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6', '#F59E0B', '#6366F1'];

export function GenderDistributionChart() {
    const [data, setData] = useState<GeneroDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [outerRadius, setOuterRadius] = useState(80);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const response = await fetchDistribucionGenero();
                if (response.data) {
                    setData(response.data);
                    setError(null);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (err) {
                setError('Error al cargar los datos de distribución por género');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (error || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">{error || 'No hay datos disponibles'}</p>
            </div>
        );
    }

    // Calcular total para porcentajes
    const total = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full/2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Distribución por Género</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOuterRadius(prev => Math.max(60, prev - 10))}
                        className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors duration-200"
                        title="Reducir zoom"
                    >
                        −
                    </button>
                    <button
                        onClick={() => setOuterRadius(prev => Math.min(140, prev + 10))}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200"
                        title="Aumentar zoom"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setOuterRadius(80)}
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded-lg transition-colors duration-200"
                        title="Resetear zoom"
                    >
                        ↺
                    </button>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="genero"
                            cx="50%"
                            cy="50%"
                            outerRadius={outerRadius}
                            label={false}
                            onClick={() => { }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const value = payload[0].value as number;
                                    const porcentaje = ((value / total) * 100).toFixed(1);
                                    const nombre = payload[0].payload.genero;
                                    const index = data.findIndex(d => d.genero === nombre);
                                    const color = COLORS[index % COLORS.length];
                                    return (
                                        <div
                                            style={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '16px 12px',
                                                fontSize: '14px',
                                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                                                width: 'fit-content',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '14px',
                                                        height: '14px',
                                                        borderRadius: '4px',
                                                        backgroundColor: color,
                                                    }}
                                                />
                                                <div style={{ color: '#1f2937', fontWeight: 700, fontSize: '14px' }}>
                                                    {nombre}
                                                </div>
                                            </div>
                                            <div style={{ color: '#374151', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                                                {value} casos
                                            </div>
                                            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>
                                                {porcentaje}%
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                            cursor={false}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
