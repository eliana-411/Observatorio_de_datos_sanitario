'use client';

interface MunicipalityData {
    name: string;
    trend: 'alza' | 'estable' | 'baja';
    prediction: number;
    deviation: string;
    alertLevel: 'critica' | 'moderada' | 'estable';
}

const municipalities: MunicipalityData[] = [
    {
        name: 'Manizales',
        trend: 'alza',
        prediction: 48,
        deviation: '+14.2%',
        alertLevel: 'critica',
    },
    {
        name: 'La Dorada',
        trend: 'estable',
        prediction: 18,
        deviation: '+2.1%',
        alertLevel: 'moderada',
    },
    {
        name: 'Chinchiná',
        trend: 'alza',
        prediction: 14,
        deviation: '+8.5%',
        alertLevel: 'critica',
    },
    {
        name: 'Riosucio',
        trend: 'baja',
        prediction: 11,
        deviation: '-5.4%',
        alertLevel: 'estable',
    },
    {
        name: 'Villamaría',
        trend: 'estable',
        prediction: 9,
        deviation: '+1.0%',
        alertLevel: 'moderada',
    },
];

const trendIcons = {
    alza: 'trending_up',
    estable: 'trending_flat',
    baja: 'trending_down',
};

const trendColors = {
    alza: '#ffb4ab',
    estable: '#ffb77e',
    baja: '#0059bb',
};

const alertBgColors = {
    critica: '#ffb4ab',
    moderada: '#ffb77e',
    estable: '#a7c8ff',
};

const alertTextColors = {
    critica: '#690005',
    moderada: '#4d2600',
    estable: '#003061',
};

export function MunicipalityTable() {
    return (
        <section className="bg-white dark:bg-[#1a2b3b] border border-[#e4efff] rounded-lg overflow-hidden">
            <div className="p-6 border-b border-[#e4efff] flex justify-between items-center">
                <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest">
                    Matriz de Monitoreo por Municipio (Caldas)
                </h3>
                <button className="bg-[#f7f9ff] border border-[#e4efff] px-4 py-2 rounded text-sm text-[#0059bb] hover:bg-[#eef4ff] flex items-center gap-2 transition-colors">
                    <span className="material-symbols-outlined text-base" data-icon="download">
                        download
                    </span>
                    Exportar PDF
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#f7f9ff] text-[#8d919b] border-b border-[#e4efff]">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Municipio</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Tendencia</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Predicción Oct.</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Desv. Histórica</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Estado de Alerta</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {municipalities.map((municipality, index) => (
                            <tr
                                key={index}
                                className={`border-b border-[#e4efff] hover:bg-[#f7f9ff] transition-colors ${index % 2 === 1 ? 'bg-[#fafbff]' : ''
                                    }`}
                            >
                                <td className="px-6 py-3 text-sm font-medium text-[#0b1d2d]">
                                    {municipality.name}
                                </td>
                                <td className="px-6 py-3 text-sm flex items-center gap-1" style={{ color: trendColors[municipality.trend] }}>
                                    <span
                                        className="material-symbols-outlined text-base"
                                        data-icon={trendIcons[municipality.trend]}
                                    >
                                        {trendIcons[municipality.trend]}
                                    </span>
                                    {municipality.trend.charAt(0).toUpperCase() + municipality.trend.slice(1)}
                                </td>
                                <td className="px-6 py-3 text-sm font-mono font-bold text-[#0b1d2d]">
                                    {municipality.prediction}
                                </td>
                                <td className="px-6 py-3 text-sm" style={{ color: trendColors[municipality.trend] }}>
                                    {municipality.deviation}
                                </td>
                                <td className="px-6 py-3">
                                    <span
                                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border"
                                        style={{
                                            backgroundColor: `${alertBgColors[municipality.alertLevel]}20`,
                                            color: alertTextColors[municipality.alertLevel],
                                            borderColor: alertBgColors[municipality.alertLevel],
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: alertBgColors[municipality.alertLevel] }}
                                        ></span>
                                        {municipality.alertLevel.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <button className="text-[#0059bb] hover:underline text-sm font-medium">
                                        Ver Reporte
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-4 bg-[#f7f9ff] text-center border-t border-[#e4efff]">
                    <button className="text-sm text-[#8d919b] hover:text-[#0059bb] transition-colors font-medium">
                        Cargar 20 municipios restantes...
                    </button>
                </div>
            </div>
        </section>
    );
}
