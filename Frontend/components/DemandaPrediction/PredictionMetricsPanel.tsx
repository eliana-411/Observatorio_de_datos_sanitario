'use client';

interface MetricsPanel {
    title: string;
    icon: string;
    items: Array<{
        label: string;
        value: string | number;
    }>;
}

interface PredictionMetricsPanelProps {
    panels?: MetricsPanel[];
}

export function PredictionMetricsPanel({ panels }: PredictionMetricsPanelProps) {
    const defaultPanels: MetricsPanel[] = [
        {
            title: 'Model Confidence',
            icon: 'analytics',
            items: [
                { label: 'R² Score', value: '99.45%' },
                { label: 'RMSE', value: '5.47' },
                { label: 'F1-Score', value: '93.24%' },
                { label: 'Precision', value: '94.52%' },
            ],
        },
        {
            title: 'Historical Profile',
            icon: 'history',
            items: [
                { label: 'Tasa Hospitalización Media', value: '14.2%' },
                { label: 'Mes Crítico del Año', value: 'Diciembre' },
                { label: 'Tendencia Reciente', value: 'Al alza' },
            ],
        },
        {
            title: 'Demographics',
            icon: 'groups',
            items: [
                { label: 'Grupo Etario Predominante', value: '45-60 Años' },
                { label: 'Salud Mental', value: '28.4%' },
                { label: 'Uso Sustancias', value: '12.1%' },
            ],
        },
    ];

    const data = panels || defaultPanels;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((panel, idx) => (
                <div key={idx} className="bg-[#eef4ff] rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-[#0059bb]">{panel.icon}</span>
                        </div>
                        <h5 className="text-sm font-black uppercase tracking-widest text-[#0b1d2d]">
                            {panel.title}
                        </h5>
                    </div>

                    {panel.title === 'Model Confidence' ? (
                        <div className="grid grid-cols-2 gap-4">
                            {panel.items.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[10px] text-[#414754] font-bold uppercase tracking-wider">
                                        {item.label}
                                    </p>
                                    <p className="text-xl font-black text-[#0b1d2d]">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    ) : panel.title === 'Historical Profile' ? (
                        <div className="space-y-4">
                            {panel.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-[#c1c6d7]/10">
                                    <span className="text-xs font-medium text-[#414754]">{item.label}</span>
                                    <span className="text-sm font-black text-[#0b1d2d]">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {panel.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#0059bb]"></div>
                                        <span className="text-[10px] font-bold text-[#414754] uppercase">
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-xs font-black">{item.value}</span>
                                </div>
                            ))}
                            <div className="w-full bg-[#e4efff] h-2 rounded-full overflow-hidden mt-4">
                                <div className="bg-[#0059bb] h-full w-[65%]"></div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
