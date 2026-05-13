'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { fetchDistribucionGrupoEtario, GrupoEtarioDistribution } from '@/lib/api/analytics';

const COLORS = ['#7ccc63', '#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c'];

export function AgeGroupDistributionChart() {
    const [data, setData] = useState<GrupoEtarioDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const response = await fetchDistribucionGrupoEtario();
                if (response.data) {
                    setData(response.data);
                    setError(null);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (err) {
                setError('Error al cargar los datos de distribución por grupo etario');
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

    // Preparar datos para el gráfico con labels en formato legible
    const chartData = data.map((item) => ({
        ...item,
        nombre: item.grupoEtario,
        porcentaje: ((item.total / total) * 100).toFixed(1),
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full/2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Grupo Etario</h3>
            <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="nombre"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Casos', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const value = payload[0].value as number;
                                    const porcentaje = ((value / total) * 100).toFixed(1);
                                    const nombre = payload[0].payload.nombre;
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
                                            <div style={{ color: '#1f2937', marginBottom: '8px', fontWeight: 700, fontSize: '14px' }}>
                                                {nombre}
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
                        <Bar
                            dataKey="total"
                            radius={[8, 8, 0, 0]}
                            onClick={() => { }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
