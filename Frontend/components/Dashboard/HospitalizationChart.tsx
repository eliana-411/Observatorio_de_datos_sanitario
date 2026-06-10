'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchHospitalizacion, HospitalizacionDistribution } from '@/lib/api/analytics';
import { useColorblindMode } from '@/contexts/ColorblindModeContext';

const COLORS = ['#10B981', '#F59E0B'];

// Patrones SVG para accesibilidad (inclusive para daltónicos)
const PATTERNS = [
    'url(#patternHosp0)',
    'url(#patternHosp1)',
];

export function HospitalizationChart() {
    const [data, setData] = useState<HospitalizacionDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isColorblindMode } = useColorblindMode();

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const response = await fetchHospitalizacion();
                if (response.data) {
                    // Usar el estado que viene del backend, que ya tiene las etiquetas correctas
                    const mappedData = response.data
                        .map(item => ({
                            ...item,
                            nombre: item.estado || (item.hospitalizado === 1 ? 'Hospitalizado' : 'No Hospitalizado'),
                        }))
                        .sort((a, b) => b.total - a.total); // Ordenar por cantidad descendente

                    setData(mappedData);
                    setError(null);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (err) {
                setError('Error al cargar los datos de hospitalización');
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

    // Obtener el máximo (el que va ganando)
    const máximo = data.length > 0 ? data[0] : null;
    const porcentajeMáximo = máximo ? ((máximo.total / total) * 100).toFixed(1) : '0';

    // Componente para renderizar en el centro del doughnut
    const CenterLabel = () => {
        if (!máximo) return null;
        return (
            <g>
                <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        fill: '#1f2937'
                    }}
                >
                    {porcentajeMáximo}%
                </text>
                <text
                    x="50%"
                    y="57%"
                    textAnchor="middle"
                    style={{
                        fontSize: '13px',
                        fill: '#6b7280',
                        fontWeight: '500'
                    }}
                >
                    {máximo.nombre}
                </text>
            </g>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full/2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Hospitalización</h3>
            <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <defs>
                            {/* Líneas horizontales - Pattern 0 */}
                            <pattern id="patternHosp0" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="6" fill={COLORS[0]} />
                                <path d="M0,3 h8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                            </pattern>
                            {/* Puntos - Pattern 1 */}
                            <pattern id="patternHosp1" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="8" height="8" fill={COLORS[1]} />
                                <circle cx="4" cy="4" r="2" fill="rgba(255,255,255,0.4)" />
                            </pattern>
                        </defs>
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="nombre"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            label={false}
                            onClick={() => { }}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={isColorblindMode ? PATTERNS[index % PATTERNS.length] : COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <CenterLabel />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const value = payload[0].value as number;
                                    const porcentaje = ((value / total) * 100).toFixed(1);
                                    const nombre = payload[0].payload.nombre;  // ← USÁ DIRECTAMENTE LO QUE YA ESTÁ MAPEADO
                                    const isHospitalized = nombre === 'Hospitalizado';
                                    const color = isHospitalized ? COLORS[0] : COLORS[1];
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
