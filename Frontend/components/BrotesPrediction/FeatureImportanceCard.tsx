'use client';

import { Card } from '@/components/ui/card';

const features = [
    { name: 'Zona Geográfica', importance: 0.88 },
    { name: 'Consumo Sustancias', importance: 0.72 },
    { name: 'Edad (15-24)', importance: 0.65 },
    { name: 'Historial Clínico', importance: 0.58 },
    { name: 'Factor Socioeconómico', importance: 0.44 },
];

export function FeatureImportanceCard() {
    return (
        <Card className="p-6 bg-white border border-[#e4efff]">
            <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-4">
                Variables de Impacto (Top 5)
            </h3>
            <div className="space-y-4">
                {features.map((feature, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-[#0b1d2d]">{feature.name}</span>
                            <span className="font-mono text-xs font-bold text-[#0059bb]">
                                {(feature.importance * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-[#f7f9ff] h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-[#0059bb] h-full transition-all"
                                style={{ width: `${feature.importance * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
