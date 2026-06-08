'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { fetchDistribucionGrupoEtario, GrupoEtarioDistribution } from '@/lib/api/analytics';
import { useColorblindMode } from '@/contexts/ColorblindModeContext';

const COLORS = ['#7ccc63', '#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c'];

// Patrones SVG para accesibilidad (inclusive para daltónicos)
const PATTERNS = [
    'url(#patternAge0)',
    'url(#patternAge1)',
    'url(#patternAge2)',
    'url(#patternAge3)',
    'url(#patternAge4)',
    'url(#patternAge5)',
];

export function AgeGroupDistributionChart() {
    const [data, setData] = useState<GrupoEtarioDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isColorblindMode } = useColorblindMode();

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
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-95">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Grupo Etario</h3>
            <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    >
                        <defs>
                            {/* Líneas diagonales - Pattern 0 */}
                            <pattern id="patternAge0" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[0]} />
                                <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Líneas diagonales inversas - Pattern 1 */}
                            <pattern id="patternAge1" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[1]} />
                                <path d="M2,-2 l4,4 M8,0 l-8,8 M10,6 l4,4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Puntos - Pattern 2 */}
                            <pattern id="patternAge2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[2]} />
                                <circle cx="4" cy="4" r="2" fill="rgba(255,255,255,0.4)" />
                            </pattern>
                            {/* Líneas verticales - Pattern 3 */}
                            <pattern id="patternAge3" x="0" y="0" width="6" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="6" height="8" fill={COLORS[3]} />
                                <path d="M2,0 v8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Líneas horizontales - Pattern 4 */}
                            <pattern id="patternAge4" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="6" fill={COLORS[4]} />
                                <path d="M0,3 h8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Cruces - Pattern 5 */}
                            <pattern id="patternAge5" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[5]} />
                                <path d="M4,0 v8 M0,4 h8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                            </pattern>
                        </defs>
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
                                <Cell
                                    key={`cell-${index}`}
                                    fill={isColorblindMode ? PATTERNS[index % PATTERNS.length] : COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
