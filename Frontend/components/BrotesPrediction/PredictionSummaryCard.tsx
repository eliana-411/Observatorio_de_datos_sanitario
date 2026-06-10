'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface Municipio {
    municipio: string;
    casos_predichos: number;
    nivel_alerta: string;
}

interface AlertasCriticasResponse {
    municipios: Municipio[];
    ultima_actualizacion: string;
}

export function PredictionSummaryCard() {
    const [data, setData] = useState<AlertasCriticasResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://localhost:7083/api/Brotes/alertas-criticas');
                if (!response.ok) throw new Error('Error al obtener datos');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff]">Cargando...</Card>;
    if (error) return <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff]">Error: {error}</Card>;

    return (
        <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff] h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-1">
                        Casos de riesgo crítico
                    </h3>
                    <p className="text-sm text-[#666]">Municipios en alerta</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 py-4 max-h-64 overflow-y-auto">
                {data?.municipios.map((municipio, idx) => (
                    <div key={idx} className="bg-[#f5f7fa] dark:bg-[#0f1419] p-4 rounded border border-[#e4efff]">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-[#333] dark:text-white">{municipio.municipio}</h4>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${municipio.nivel_alerta === 'ALTO'
                                    ? 'bg-[#ffb4ab] text-[#690005]'
                                    : 'bg-[#fff3cd] text-[#856404]'
                                }`}>
                                {municipio.nivel_alerta}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-[#666]">Casos predichos: </span>
                            <span className="font-bold text-[#0059bb]">{municipio.casos_predichos}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#e4efff]">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#666]">Última actualización</span>
                    <span className="text-sm font-mono font-bold">{data?.ultima_actualizacion || 'N/A'}</span>
                </div>
            </div>
        </Card>
    );
}
