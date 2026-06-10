'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface MatrizData {
    municipio: string;
    tendencia: string;
    casos_predichos: number;
    desviacion_pct: number;
    nivel_alerta: string;
    media_historica: number;
    umbral_alerta: number;
}

interface MatrizDataWithAlertLevel extends MatrizData {
    alertLevel: 'alto' | 'medio' | 'bajo';
}

// Colores del mapa de riesgo
const colorPalette = {
    alto: {
        fill: '#dc2626',
        stroke: '#991b1b',
    },
    medio: {
        fill: '#f97316',
        stroke: '#ea580c',
    },
    bajo: {
        fill: '#3b82f6',
        stroke: '#1e40af',
    },
};

const alertBgColors = {
    alto: colorPalette.alto.fill,
    medio: colorPalette.medio.fill,
    bajo: colorPalette.bajo.fill,
};

const alertTextColors = {
    alto: '#7f1d1d',
    medio: '#92400e',
    bajo: '#082f49',
};

// Mapeo de tendencias a íconos
const trendIcons = {
    'al alza': 'trending_up',
    'alza': 'trending_up',
    'estable': 'trending_flat',
    'a la baja': 'trending_down',
    'baja': 'trending_down',
} as Record<string, string>;

const trendColors = {
    'al alza': colorPalette.alto.fill,
    'alza': colorPalette.alto.fill,
    'estable': colorPalette.medio.fill,
    'a la baja': colorPalette.bajo.fill,
    'baja': colorPalette.bajo.fill,
} as Record<string, string>;

/**
 * Mapea nivel_alerta del endpoint a niveles internos
 */
function mapAlertLevel(nivelAlerta: string): 'alto' | 'medio' | 'bajo' {
    const nivel = nivelAlerta?.toLowerCase().trim() || 'bajo';
    if (nivel === 'alto' || nivel === 'crítico') return 'alto';
    if (nivel === 'moderado' || nivel === 'medio') return 'medio';
    return 'bajo';
}

/**
 * Obtiene el ícono para una tendencia
 */
function getTrendIcon(tendencia: string): string {
    const normalized = tendencia.toLowerCase().trim();
    return trendIcons[normalized] || 'trending_flat';
}

/**
 * Obtiene el color para una tendencia
 */
function getTrendColor(tendencia: string): string {
    const normalized = tendencia.toLowerCase().trim();
    return trendColors[normalized] || colorPalette.medio.fill;
}

export function MunicipalityTable() {
    const [data, setData] = useState<MatrizDataWithAlertLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMatrizData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get<MatrizData[]>('/Brotes/matriz');

                if (response.error) {
                    setError('Error al cargar la matriz de monitoreo');
                    console.error('Error:', response.error);
                    setData([]);
                } else {
                    // Mapear los datos y agregar alertLevel
                    const mappedData = (response.data || []).map((item) => ({
                        ...item,
                        alertLevel: mapAlertLevel(item.nivel_alerta),
                    }));
                    setData(mappedData);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                setError(errorMessage);
                console.error('Error fetching matriz data:', err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMatrizData();
    }, []);

    if (loading) {
        return (
            <section className="bg-white dark:bg-[#1a2b3b] border border-[#e4efff] rounded-lg overflow-hidden">
                <div className="p-6 text-center text-[#8d919b]">Cargando datos...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-white dark:bg-[#1a2b3b] border border-[#e4efff] rounded-lg overflow-hidden">
                <div className="p-6 text-center text-red-600">{error}</div>
            </section>
        );
    }

    return (
        <section className="bg-white dark:bg-[#1a2b3b] border border-[#e4efff] rounded-lg overflow-hidden">
            <div className="p-6 border-b border-[#e4efff] flex justify-between items-center">
                <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest">
                    Matriz de Monitoreo por Municipio (Caldas)
                </h3>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#f7f9ff] text-[#8d919b] border-b border-[#e4efff]">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Municipio</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Tendencia</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Casos Predichos</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Desv. %</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Media Histórica</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Umbral Alerta</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Estado de Alerta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className={`border-b border-[#e4efff] hover:bg-[#f7f9ff] transition-colors ${index % 2 === 1 ? 'bg-[#fafbff]' : ''
                                    }`}
                            >
                                <td className="px-6 py-3 text-sm font-medium text-[#0b1d2d]">
                                    {item.municipio}
                                </td>
                                <td
                                    className="px-6 py-3 text-sm flex items-center gap-1"
                                    style={{ color: getTrendColor(item.tendencia) }}
                                >
                                    <span
                                        className="material-symbols-outlined text-base"
                                        data-icon={getTrendIcon(item.tendencia)}
                                    >
                                        {getTrendIcon(item.tendencia)}
                                    </span>
                                    {item.tendencia}
                                </td>
                                <td className="px-6 py-3 text-sm font-mono font-bold text-[#0b1d2d]">
                                    {item.casos_predichos}
                                </td>
                                <td className="px-6 py-3 text-sm font-bold text-[#0b1d2d]">
                                    {item.desviacion_pct.toFixed(1)}%
                                </td>
                                <td className="px-6 py-3 text-sm text-[#0b1d2d]">
                                    {item.media_historica.toFixed(2)}
                                </td>
                                <td className="px-6 py-3 text-sm text-[#0b1d2d]">
                                    {item.umbral_alerta.toFixed(2)}
                                </td>
                                <td className="px-6 py-3">
                                    <span
                                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border"
                                        style={{
                                            backgroundColor: `${alertBgColors[item.alertLevel]}20`,
                                            color: alertTextColors[item.alertLevel],
                                            borderColor: alertBgColors[item.alertLevel],
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: alertBgColors[item.alertLevel] }}
                                        ></span>
                                        {item.alertLevel.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="px-6 py-8 text-center text-[#8d919b]">
                        No hay datos disponibles
                    </div>
                )}
                {data.length > 0 && (
                    <div className="px-6 py-4 bg-[#f7f9ff] text-center border-t border-[#e4efff]">
                        <p className="text-xs text-[#8d919b]">
                            Mostrando {data.length} municipio{data.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
