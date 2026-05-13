'use client';

import { Card } from '@/components/ui/card';

export function ModelMetricsCard() {
    return (
        <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff]">
            <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-4">
                Métricas del Modelo
            </h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded">
                    <p className="text-xs text-[#8d919b] mb-1 uppercase font-bold">RMSE</p>
                    <p className="text-lg font-bold text-[#0b1d2d]">4.2</p>
                </div>
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded">
                    <p className="text-xs text-[#8d919b] mb-1 uppercase font-bold">MAE</p>
                    <p className="text-lg font-bold text-[#0b1d2d]">3.8</p>
                </div>
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded">
                    <p className="text-xs text-[#8d919b] mb-1 uppercase font-bold">R²</p>
                    <p className="text-lg font-bold text-[#0059bb]">0.94</p>
                </div>
            </div>
        </Card>
    );
}
