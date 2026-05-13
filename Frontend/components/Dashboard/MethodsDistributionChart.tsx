'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchMetodosMasUsados, MetodoDistribution } from '@/lib/api/analytics';
import { useColorblindMode } from '@/contexts/ColorblindModeContext';

const COLORS = ['#022030', '#004a5c', '#007876', '#2aa97e', '#8fd576', '#f9f970', '#9ae881'];

// Patrones SVG para accesibilidad (inclusive para daltónicos)
const PATTERNS = [
    'url(#pattern0)',
    'url(#pattern1)',
    'url(#pattern2)',
    'url(#pattern3)',
    'url(#pattern4)',
    'url(#pattern5)',
    'url(#pattern6)',
    'url(#pattern7)',
];

export function MethodsDistributionChart() {
    const [data, setData] = useState<MetodoDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isColorblindMode } = useColorblindMode();

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const response = await fetchMetodosMasUsados();
                if (response.data) {
                    // Ordenar por cantidad descendente y limitar a los 8 métodos más usados
                    const sortedData = response.data.sort((a, b) => b.total - a.total).slice(0, 8);
                    setData(sortedData);
                    setError(null);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (err) {
                setError('Error al cargar los datos de métodos más usados');
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
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Métodos Más Usados</h3>
            <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 220, bottom: 5 }}
                    >
                        <defs>
                            {/* Líneas diagonales - Pattern 0 */}
                            <pattern id="pattern0" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[0]} />
                                <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Líneas diagonales inversas - Pattern 1 */}
                            <pattern id="pattern1" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[1]} />
                                <path d="M2,-2 l4,4 M8,0 l-8,8 M10,6 l4,4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Puntos - Pattern 2 */}
                            <pattern id="pattern2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[2]} />
                                <circle cx="4" cy="4" r="2" fill="rgba(255,255,255,0.4)" />
                            </pattern>
                            {/* Líneas verticales - Pattern 3 */}
                            <pattern id="pattern3" x="0" y="0" width="6" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="6" height="8" fill={COLORS[3]} />
                                <path d="M2,0 v8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Líneas horizontales - Pattern 4 */}
                            <pattern id="pattern4" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="6" fill={COLORS[4]} />
                                <path d="M0,3 h8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Cruces - Pattern 5 */}
                            <pattern id="pattern5" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[5]} />
                                <path d="M4,0 v8 M0,4 h8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                            </pattern>
                            {/* Cuadros - Pattern 6 */}
                            <pattern id="pattern6" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[6]} />
                                <rect x="2" y="2" width="4" height="4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
                            </pattern>
                            {/* Diagonal densa - Pattern 7 */}
                            <pattern id="pattern7" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="4" height="4" fill={COLORS[7]} />
                                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                            </pattern>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis
                            dataKey="metodo"
                            type="category"
                            width={210}
                            tick={{ fontSize: 14, fill: '#6b7280', fontWeight: 500 }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const value = payload[0].value as number;
                                    const porcentaje = ((value / total) * 100).toFixed(1);
                                    const nombre = payload[0].payload.metodo;
                                    const index = data.findIndex(d => d.metodo === nombre);
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
                        <Bar
                            dataKey="total"
                            radius={[0, 8, 8, 0]}
                            onClick={() => { }}
                        >
                            {data.map((entry, index) => (
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
