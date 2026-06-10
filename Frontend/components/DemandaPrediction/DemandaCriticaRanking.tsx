'use client';

import { useState, useEffect } from 'react';

interface MunicipalityRank {
    rank: number;
    name: string;
    value: number;
    alertLevel: 'normal' | 'moderado' | 'alto' | 'critico';
    percentage: number;
    mediaHistorica: number;
}

interface ApiResponse {
    posicion: number;
    municipio: string;
    hospitalizaciones_predichas: number;
    nivel_alerta: string;
    media_historica: number;
}

interface DemandaCriticaRankingProps {
    municipalities?: MunicipalityRank[];
}

export function DemandaCriticaRanking({ municipalities }: DemandaCriticaRankingProps) {
    const [data, setData] = useState<MunicipalityRank[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para mapear nivel de alerta del API al formato del componente
    const mapAlertLevel = (nivel: string): 'normal' | 'moderado' | 'alto' | 'critico' => {
        const normalized = nivel.toLowerCase();
        if (normalized === 'normal') return 'normal';
        if (normalized === 'moderado') return 'moderado';
        if (normalized === 'alto') return 'alto';
        if (normalized === 'critico') return 'critico';
        return 'normal'; // default
    };

    // Función para calcular el porcentaje de la barra (basado en las hospitalizaciones predichas)
    const calculatePercentage = (value: number, maxValue: number = 200): number => {
        return Math.min((value / maxValue) * 100, 100);
    };

    const getDefaultMunicipalities = (): MunicipalityRank[] => [
        {
            rank: 1,
            name: 'Alpha Manizales',
            value: 184,
            alertLevel: 'critico',
            percentage: 95,
            mediaHistorica: 148,
        },
        {
            rank: 2,
            name: 'Beta Pereira',
            value: 156,
            alertLevel: 'alto',
            percentage: 80,
            mediaHistorica: 130,
        },
        {
            rank: 3,
            name: 'Delta Cartago',
            value: 148,
            alertLevel: 'alto',
            percentage: 75,
            mediaHistorica: 125,
        },
        {
            rank: 4,
            name: 'Epsilon Chinchiná',
            value: 142,
            alertLevel: 'alto',
            percentage: 70,
            mediaHistorica: 120,
        },
        {
            rank: 5,
            name: 'Zeta Salamina',
            value: 135,
            alertLevel: 'alto',
            percentage: 65,
            mediaHistorica: 115,
        },
    ];

    useEffect(() => {
        const fetchDemandaData = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://localhost:7083/api/Demanda/top5');

                if (!response.ok) {
                    throw new Error(`Error fetching data: ${response.status}`);
                }

                const apiData: ApiResponse[] = await response.json();

                // Transformar datos del API al formato de MunicipalityRank
                const transformedData: MunicipalityRank[] = apiData.map((item) => ({
                    rank: item.posicion,
                    name: item.municipio,
                    value: item.hospitalizaciones_predichas,
                    alertLevel: mapAlertLevel(item.nivel_alerta),
                    percentage: calculatePercentage(item.hospitalizaciones_predichas),
                    mediaHistorica: item.media_historica,
                }));

                setData(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching demanda data:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
                // Usar datos por defecto si hay error
                setData(getDefaultMunicipalities());
            } finally {
                setLoading(false);
            }
        };

        fetchDemandaData();
    }, []);

    const displayData = municipalities || data.length > 0 ? data : getDefaultMunicipalities();

    const alertColorMap = {
        normal: { bg: 'bg-[#4CAF50]', text: 'text-[#4CAF50]' },
        moderado: { bg: 'bg-[#FFC107]', text: 'text-[#FFC107]' },
        alto: { bg: 'bg-[#9e3d00]', text: 'text-[#9e3d00]' },
        critico: { bg: 'bg-[#ba1a1a]', text: 'text-[#ba1a1a]' },
    };

    const alertLabelMap = {
        normal: 'NORMAL',
        moderado: 'MODERADO',
        alto: 'ALTO',
        critico: 'CRÍTICO',
    };

    return (
        <div className="bg-[#eef4ff] rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-[#0059bb]">format_list_numbered</span>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#0b1d2d]">
                        Ranking de Demanda Crítica
                    </h3>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <span className="text-sm text-[#414754]">Cargando datos...</span>
                </div>
            )}

            {error && !loading && (
                <div className="flex justify-center items-center py-8 text-sm text-[#ba1a1a]">
                    Error: {error}
                </div>
            )}

            {!loading && (
                <div className="space-y-3">
                    {displayData.map((municipality) => (
                        <div
                            key={municipality.rank}
                            className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-white hover:bg-white transition-colors cursor-default"
                        >
                            <span className="text-lg font-black text-[#717786] w-4">{municipality.rank}</span>
                            <span
                                className={`material-symbols-outlined ${alertColorMap[municipality.alertLevel].text}`}
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                flag
                            </span>
                            <div className="flex-grow">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-xs font-black text-[#0b1d2d] uppercase">{municipality.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-[#0059bb]">{municipality.value}</span>
                                        <span
                                            className={`text-[9px] font-black px-1.5 py-0.5 ${alertColorMap[municipality.alertLevel].bg} text-white rounded uppercase`}
                                        >
                                            {alertLabelMap[municipality.alertLevel]}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-[#d2e4fb] rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`${alertColorMap[municipality.alertLevel].bg} h-full`}
                                        style={{ width: `${municipality.percentage}%` }}
                                    ></div>
                                </div>
                                {/* Media Histórica */}
                                <div className="flex justify-between items-center text-[10px] text-[#414754]">
                                    <span className="font-bold uppercase tracking-widest">Media Histórica:</span>
                                    <span className="font-black text-[#0059bb]">{municipality.mediaHistorica.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
