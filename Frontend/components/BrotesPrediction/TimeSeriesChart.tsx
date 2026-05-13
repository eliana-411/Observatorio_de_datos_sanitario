'use client';

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
} from 'recharts';
import { Card } from '@/components/ui/card';

const data = [
    { month: 'ENE 24', historico: 85, prediccion: null, umbral: 125 },
    { month: 'FEB 24', historico: 92, prediccion: null, umbral: 125 },
    { month: 'MAR 24', historico: 78, prediccion: null, umbral: 125 },
    { month: 'ABR 24', historico: 98, prediccion: null, umbral: 125 },
    { month: 'MAY 24', historico: 105, prediccion: null, umbral: 125 },
    { month: 'JUN 24', historico: 112, prediccion: null, umbral: 125 },
    { month: 'JUL 24', historico: 118, prediccion: null, umbral: 125 },
    { month: 'AGO 24', historico: 115, prediccion: null, umbral: 125 },
    { month: 'SEP 24', historico: 128, prediccion: null, umbral: 125 },
    { month: 'OCT 24 (P)', historico: null, prediccion: 142, umbral: 125 },
];

export function TimeSeriesChart() {
    return (
        <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff]">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest">
                    Serie Temporal: Histórico vs Predicción
                </h3>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-[#8d919b]"></span>
                        Histórico
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-0.5 bg-[#0059bb]"></span>
                        Predicción
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-0.5 border-t border-dashed border-[#ffb4ab]"></span>
                        Umbral
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4efff" />
                    <XAxis
                        dataKey="month"
                        stroke="#8d919b"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#8d919b" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e4efff',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend />
                    <ReferenceLine
                        y={125}
                        stroke="#ffb4ab"
                        strokeDasharray="5 5"
                        name="Umbral"
                    />
                    <Line
                        type="monotone"
                        dataKey="historico"
                        stroke="#8d919b"
                        name="Histórico"
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="prediccion"
                        stroke="#0059bb"
                        name="Predicción"
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
}
