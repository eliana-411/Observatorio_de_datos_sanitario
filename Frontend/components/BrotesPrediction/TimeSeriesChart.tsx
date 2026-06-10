'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    TooltipProps,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartDataPoint } from '@/lib/brotes/dataTransformation';

interface TimeSeriesChartProps {
    data: ChartDataPoint[];
    mediaHistorica: number;
    umbralAlerta: number;
    municipio: string;
    loading?: boolean;
}

/**
 * Custom Tooltip que muestra información diferente para histórico vs predicción
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string> & { payload?: any }) {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload as ChartDataPoint;

    if (data.isPrediction) {
        // Tooltip para predicción
        return (
            <div className="bg-white dark:bg-[#1a2b3b] border border-[#e4efff] rounded-lg p-3 shadow-lg">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {data.displayLabel}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                    Casos predichos: <span className="font-bold">{data.prediccion}</span>
                </p>
                {data.nivel_alerta && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                        Nivel de alerta: <span className="font-bold">{data.nivel_alerta}</span>
                    </p>
                )}
            </div>
        );
    } else {
        // Tooltip para histórico
        return (
            <div className="bg-white dark:bg-[#1a2b3b] border border-[#e4efff] rounded-lg p-3 shadow-lg">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {data.displayLabel}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                    Casos: <span className="font-bold">{data.historico}</span>
                </p>
            </div>
        );
    }
}

/**
 * Leyenda personalizada
 */
function CustomLegend() {
    return (
        <div className="flex gap-6 justify-center">
            <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#8d919b]"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Histórico</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#0059bb]"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Predicción</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#ffb4ab]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ffb4ab 0, #ffb4ab 5px, transparent 5px, transparent 10px)' }}></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Umbral</span>
            </div>
        </div>
    );
}

export function TimeSeriesChart({
    data,
    mediaHistorica,
    umbralAlerta,
    municipio,
    loading = false,
}: TimeSeriesChartProps) {
    if (loading) {
        return (
            <Card className="p-6 bg-white dark:bg-[#1a2b3b] border dark:border-[#e4efff]">
                <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Cargando gráfico...</p>
                </div>
            </Card>
        );
    }

    // Separar históricos y predicciones
    const historicos = data.filter(d => !d.isPrediction);
    const predicciones = data.filter(d => d.isPrediction);

    // Tomar solo los últimos 7 históricos
    const historicosVisibles = historicos.slice(-7);

    // Combinar para el gráfico: 7 históricos + N predicciones
    const datosGrafico = [...historicosVisibles, ...predicciones];

    if (datosGrafico.length === 0) {
        return (
            <Card className="p-6 bg-white dark:bg-[#1a2b3b] border dark:border-[#e4efff]">
                <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
                </div>
            </Card>
        );
    }
//console.table(datosGrafico)
    return (
        <Card className="p-6 bg-white dark:bg-[#1a2b3b] border dark:border-[#e4efff]">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest">
                        Serie Temporal: Histórico vs Predicción
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase">
                        {municipio}
                    </p>
                </div>

                {/* Información del umbral y media en esquina superior derecha */}
                <div className="flex flex-col gap-2 text-right">
                    <div className="text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Umbral de Alerta: </span>
                        <span className="font-bold text-[#ff6b6b]">
                            {umbralAlerta.toFixed(1)}
                        </span>
                    </div>
                    <div className="text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Media Histórica: </span>
                        <span className="font-bold text-[#0059bb]">
                            {mediaHistorica.toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosGrafico} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4efff" />
                    <XAxis
                        dataKey="displayLabel"
                        stroke="#8d919b"
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        stroke="#8d919b"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Referencia del umbral */}
                    <ReferenceLine
                        y={umbralAlerta}
                        stroke="#ffb4ab"
                        strokeDasharray="5 5"
                        name="Umbral"
                    />

                    {/* Línea de histórico */}
                    <Line
                        type="monotone"
                        dataKey="historico"
                        stroke="#8d919b"
                        name="Histórico"
                        connectNulls
                        strokeWidth={2}
                        dot={false}
                    />

                    {/* Línea de predicción */}
                    <Line
                        type="monotone"
                        dataKey="prediccion"
                        stroke="#0059bb"
                        name="Predicción"
                        connectNulls
                        strokeWidth={2}
                        dot={false}
                    />

                    {/* Línea de transición entre histórico y predicción */}
                    <Line
                        type="linear"
                        dataKey="transicion"
                        stroke="#0059bb"
                        strokeWidth={2}
                        dot={false}
                        name={undefined}
                        isAnimationActive={false}
                        connectNulls={true}
                    />

                    {/* Leyenda personalizada */}
                    <Legend content={<CustomLegend />} wrapperStyle={{ paddingTop: '20px' }} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
}
