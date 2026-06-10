'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchPiramidePoblacional, PiramidePoblacionalData } from '@/lib/api/analytics';
import { useColorblindMode } from '@/contexts/ColorblindModeContext';

// Colores: azul para masculino, rojo oscuro para femenino
const COLORS = {
    masculino: '#3B82F6',
    femenino: '#c03a37'
};

// Patrones SVG para accesibilidad (inclusive para daltónicos)
const PATTERNS = {
    masculino: 'url(#patternMasc)',
    femenino: 'url(#patternFem)'
};

interface PyramidDataPoint {
    grupoEtario: string;
    Masculino: number;
    Femenino: number;
}

export function PyramidChart() {
    const [data, setData] = useState<PyramidDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isColorblindMode } = useColorblindMode();

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const response = await fetchPiramidePoblacional();

                if (response.data) {
                    // Transformar datos: agrupar por grupoEtario
                    const groupedData = new Map<string, { grupoEtario: string; Masculino: number; Femenino: number }>();

                    response.data.forEach(item => {
                        const existing = groupedData.get(item.grupoEtario) || {
                            grupoEtario: item.grupoEtario,
                            Masculino: 0,
                            Femenino: 0
                        };

                        if (item.genero.toLowerCase() === 'masculino') {
                            existing.Masculino = -item.total; // Negativo para que aparezca a la izquierda
                        } else if (item.genero.toLowerCase() === 'femenino') {
                            existing.Femenino = item.total; // Positivo para que aparezca a la derecha
                        }

                        groupedData.set(item.grupoEtario, existing);
                    });

                    // Convertir a array y ordenar: adolescente, joven, adulto, adulto mayor
                    const orderMap: Record<string, number> = {
                        'adolescente': 1,
                        'joven': 2,
                        'adulto': 3,
                        'adulto mayor': 4
                    };
                    const pyramidData = Array.from(groupedData.values()).sort((a, b) => {
                        const orderA = orderMap[a.grupoEtario.toLowerCase()] ?? 999;
                        const orderB = orderMap[b.grupoEtario.toLowerCase()] ?? 999;
                        return orderA - orderB;
                    });
                    console.log('PIRAMIDE DATA:', pyramidData);

                    setData(pyramidData);
                    setError(null);
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (err) {
                setError('Error al cargar los datos de la pirámide poblacional');
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

    const maxValue = Math.max(
        ...data.flatMap(item => [
            Math.abs(item.Masculino),
            Math.abs(item.Femenino)
        ])
    );

    const ticks = [
    0,
    maxValue * 0.25,
    maxValue * 0.5,
    maxValue * 0.75,
    maxValue
];
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full/2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pirámide Poblacional</h3>
            <div className="flex items-center h-[200px]">

                {/* HOMBRES */}
                <div className="w-[45%] h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
                        >
                            <XAxis
                                type="number"
                                domain={[maxValue, 0]}
                                tickFormatter={(v) => String(v)}
                            />

                            <YAxis
                                type="category"
                                dataKey="grupoEtario"
                                hide
                            />

                            <Tooltip />

                            <Bar
                                dataKey="Masculino"
                                fill={isColorblindMode ? PATTERNS.masculino : COLORS.masculino}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ETIQUETAS CENTRALES */}
                <div className="w-[10%] flex flex-col justify-around h-full">
                    {data.map(item => (
                        <div
                            key={item.grupoEtario}
                            className="text-center text-xs font-medium text-gray-600"
                        >
                            {item.grupoEtario}
                        </div>
                    ))}
                </div>

                {/* MUJERES */}
                <div className="w-[45%] h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
                        >
                            <XAxis
                                type="number"
                                domain={[0, maxValue]}
                                tickFormatter={(v) => String(v)}
                            />

                            <YAxis
                                type="category"
                                dataKey="grupoEtario"
                                hide
                            />

                            <Tooltip />

                            <Bar
                                dataKey="Femenino"
                                fill={isColorblindMode ? PATTERNS.femenino : COLORS.femenino}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}
