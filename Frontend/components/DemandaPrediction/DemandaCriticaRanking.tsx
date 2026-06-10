'use client';

interface MunicipalityRank {
    rank: number;
    name: string;
    value: number;
    alertLevel: 'normal' | 'moderado' | 'alto' | 'critico';
    percentage: number;
}

interface DemandaCriticaRankingProps {
    municipalities?: MunicipalityRank[];
}

export function DemandaCriticaRanking({ municipalities }: DemandaCriticaRankingProps) {
    const defaultMunicipalities: MunicipalityRank[] = [
        { rank: 1, name: 'Alpha Manizales', value: 184, alertLevel: 'critico', percentage: 95 },
        { rank: 2, name: 'Beta Pereira', value: 156, alertLevel: 'alto', percentage: 80 },
        { rank: 3, name: 'Delta Cartago', value: 148, alertLevel: 'alto', percentage: 75 },
        { rank: 4, name: 'Epsilon Chinchiná', value: 142, alertLevel: 'alto', percentage: 70 },
        { rank: 5, name: 'Zeta Salamina', value: 135, alertLevel: 'alto', percentage: 65 },
    ];

    const data = municipalities || defaultMunicipalities;

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
                <span className="text-[9px] font-black px-2 py-1 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-full border border-[#ba1a1a]/20 uppercase tracking-widest">
                    Alertas: ALTO/CRÍTICO
                </span>
            </div>

            <div className="space-y-3">
                {data.map((municipality) => (
                    <div
                        key={municipality.rank}
                        className="flex items-center gap-4 p-3 bg-white/50 rounded-xl border border-white hover:bg-white transition-colors cursor-default"
                    >
                        <span className="text-lg font-black text-[#717786] w-4">{municipality.rank}</span>
                        <span className={`material-symbols-outlined ${alertColorMap[municipality.alertLevel].text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            flag
                        </span>
                        <div className="flex-grow">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-xs font-black text-[#0b1d2d] uppercase">{municipality.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-[#0059bb]">{municipality.value}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 ${alertColorMap[municipality.alertLevel].bg} text-white rounded uppercase`}>
                                        {alertLabelMap[municipality.alertLevel]}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-[#d2e4fb] rounded-full overflow-hidden">
                                <div
                                    className={`${alertColorMap[municipality.alertLevel].bg} h-full`}
                                    style={{ width: `${municipality.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
