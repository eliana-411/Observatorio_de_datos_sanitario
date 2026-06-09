'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchTendenciaTemporal, TendenciaTemporalData } from '@/lib/api/analytics';
import { useFilterStore } from '@/store/filterStore';

export function TimeSeriesChart() {
    const [data, setData] = useState<TendenciaTemporalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const { selectedAnio, setSelectedAnio } = useFilterStore();

    useEffect(() => {
        // Generar años disponibles desde 2020 hasta el año actual
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);
        setAvailableYears(years);
    }, []);

    // Sincronizar con cambios del store global
    useEffect(() => {
        // Si selectedAnio es null (todos), usar el año actual
        const yearToUse = selectedAnio ?? new Date().getFullYear();
        setSelectedYear(yearToUse);
    }, [selectedAnio]);

    // Handler para cambios del selector local
    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        setSelectedAnio(year); // Actualizar también el estado global
    };

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const response = await fetchTendenciaTemporal(selectedYear);
                if (response.data) {
                    setData(response.data);
                    setError(null);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (err) {
                setError('Error al cargar los datos de tendencia temporal');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [selectedYear]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex-1 flex flex-col border border-gray-200">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Tendencia Temporal Mensual
                </h3>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedYear}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined text-blue-500">show_chart</span>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Cargando datos...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center min-h-100">
                    <p className="text-red-500 text-center">{error}</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-85">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="nombreMes"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                label={{ value: 'Total de Eventos', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                label={{ value: 'Hospitalizados', angle: 90, position: 'insideRight' }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    fontSize: '12px',
                                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                                                }}
                                            >
                                                <p className="font-bold text-gray-900">{data.nombreMes}</p>
                                                <p style={{ color: '#3B82F6' }}>
                                                    Eventos: {data.totalEventos} ({data.porcentajeEventos.toFixed(1)}%)
                                                </p>
                                                <p style={{ color: '#10B981' }}>
                                                    Hospitalizados: {data.hospitalizados} ({data.porcentajeHospitalizados.toFixed(1)}%)
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                                cursor={false}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="totalEventos"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Total de Eventos"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="hospitalizados"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ fill: '#10B981', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Hospitalizados"
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex gap-6 mb-0">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                            <span className="text-xs font-medium text-gray-700">Total de Eventos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                            <span className="text-xs font-medium text-gray-700">Hospitalizados</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
