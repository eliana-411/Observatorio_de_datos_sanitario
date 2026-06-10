'use client';

import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { useDemandaApi, DemandaPredictionMes } from '@/hooks/useDemandaApi';
import { useFilterStore } from '@/store/filterStore';

interface ChartDataPoint extends DemandaPredictionMes {
    fecha: string;
}

interface ProjectionChartProps {
    monthsProjection: number;
}

const meses = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
];

export function ProjectionChart({ monthsProjection }: ProjectionChartProps) {
    const { selectedMunicipio } = useFilterStore();
    const monthsToDisplay = monthsProjection;

    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [mediaHistorica, setMediaHistorica] = useState<number>(0);
    const [umbral, setUmbral] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fetchPredict } = useDemandaApi();

    useEffect(() => {
        if (!selectedMunicipio || selectedMunicipio === 'todos') return;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const predictionResponse = await fetchPredict(selectedMunicipio, monthsToDisplay);

                if (!predictionResponse) {
                    setError('No se pudieron cargar las predicciones');
                    setChartData([]);
                    return;
                }

                // Transformar datos
                const data = predictionResponse.predicciones.map(
                    (item: DemandaPredictionMes) => ({
                        ...item,
                        fecha: `${meses[item.mes - 1]} ${item.anio}`,
                    })
                );

                setChartData(data);

                // Obtener datos del perfil histórico
                const perfil = predictionResponse.perfil_historico;
                if (perfil) {
                    setMediaHistorica(perfil.media_historica);
                    setUmbral(perfil.umbral_alerta);
                    // Guardar perfil en store
                    const { setPerfilHistorico } = useFilterStore.getState();
                    setPerfilHistorico(perfil);
                }
            } catch (err) {
                setError('Error al cargar los datos');
                console.error('Error loading demanda data:', err);
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedMunicipio, monthsToDisplay, fetchPredict]);

    const getAlertColor = (nivelAlerta: string): string => {
        switch (nivelAlerta.toUpperCase()) {
            case 'CRÍTICO':
                return 'bg-red-100 text-red-700 hover:bg-red-100';
            case 'ALTO':
                return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
            case 'MODERADO':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
            case 'NORMAL':
                return 'bg-green-100 text-green-700 hover:bg-green-100';
            default:
                return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
        }
    };

    return (
        <div className="xl:col-span-3 bg-white rounded-2xl p-8 shadow-[0px_12px_32px_rgba(11,29,45,0.04)] relative overflow-hidden">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#0b1d2d]">Tendencia de Ingresos Proyectados</h3>
                        <p className="text-xs text-[#414754]">Proyección de hospitalizaciones futuras</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Predicción</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#2563EB] opacity-30"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Proyección</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado de carga/error */}
            {loading && (
                <div className="h-64 w-full flex items-center justify-center">
                    <span className="text-gray-500">Cargando datos...</span>
                </div>
            )}

            {error && (
                <div className="h-64 w-full flex items-center justify-center">
                    <span className="text-red-500">{error}</span>
                </div>
            )}

            {!loading && !error && chartData.length === 0 && (
                <div className="h-64 w-full flex items-center justify-center">
                    <span className="text-gray-400">No hay datos disponibles</span>
                </div>
            )}

            {!loading && !error && chartData.length > 0 && (
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 0,
                                bottom: 60,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="predictionArea"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#3B82F6"
                                        stopOpacity={0.20}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3B82F6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                opacity={0.25}
                            />

                            <XAxis
                                dataKey="fecha"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                domain={[
                                    0,
                                    Math.max(
                                        Math.max(...chartData.map(d => d.hospitalizaciones_predichas)),
                                        mediaHistorica,
                                        umbral
                                    ) * 1.2
                                ]}
                            />

                            <Tooltip
                                content={({ active, payload }) => {
                                    if (
                                        !active ||
                                        !payload ||
                                        payload.length === 0
                                    ) {
                                        return null;
                                    }

                                    const item = payload[0].payload;

                                    return (
                                        <div className="rounded-xl border bg-white p-4 shadow-xl min-w-[230px]">
                                            <p className="font-semibold text-sm mb-3">
                                                {item.fecha}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-muted-foreground text-sm">
                                                        Hospitalizaciones
                                                    </span>

                                                    <span className="font-semibold">
                                                        {Math.round(
                                                            item.hospitalizaciones_predichas
                                                        )}
                                                    </span>
                                                </div>

                                                <div>
                                                    <Badge
                                                        className={getAlertColor(item.nivel_alerta)}
                                                    >
                                                        {item.nivel_alerta}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />

                            {/* Área suave */}
                            <Area
                                type="monotone"
                                dataKey="hospitalizaciones_predichas"
                                stroke="transparent"
                                fill="url(#predictionArea)"
                                name="Proyección"
                            />

                            {/* Línea principal */}
                            <Line
                                type="monotone"
                                dataKey="hospitalizaciones_predichas"
                                stroke="#2563EB"
                                strokeWidth={3}
                                dot={{
                                    r: 5,
                                    fill: '#2563EB',
                                    strokeWidth: 2,
                                    stroke: '#fff',
                                }}
                                activeDot={{
                                    r: 8,
                                }}
                                name="Hospitalizaciones predichas"
                            />

                            {/* Media histórica */}
                            <ReferenceLine
                                y={mediaHistorica}
                                stroke="#64748B"
                                strokeDasharray="6 6"
                                strokeWidth={2}
                            />

                            {/* Umbral */}
                            <ReferenceLine
                                y={umbral}
                                stroke="#EF4444"
                                strokeDasharray="6 6"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* Leyenda personalizada para referencias */}
                    <div className="flex gap-2 mt-1 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-px bg-[#2563EB]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #2563EB 0px, #2563EB 6px, transparent 6px, transparent 12px)' }}></div>
                            <span className="text-sm text-gray-600">Hospitalizaciones predichas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-px bg-[#64748B]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #64748B 0px, #64748B 6px, transparent 6px, transparent 12px)' }}></div>
                            <span className="text-sm text-gray-600">Media histórica: <span className="font-semibold text-gray-800">{mediaHistorica.toFixed(1)}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-px bg-[#EF4444]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #EF4444 0px, #EF4444 6px, transparent 6px, transparent 12px)' }}></div>
                            <span className="text-sm text-gray-600">Umbral: <span className="font-semibold text-gray-800">{umbral.toFixed(1)}</span></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}