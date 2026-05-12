'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDistribucionGenero, GeneroDistribution } from '@/lib/api/analytics';

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6', '#F59E0B', '#6366F1'];

export function GenderDistributionChart() {
    const [data, setData] = useState<GeneroDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Género</h3>
            <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="genero"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ genero, total }) => `${genero}: ${total}`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => `${value} casos`}
                            labelFormatter={(label) => `Género: ${label}`}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => `${value}`}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
