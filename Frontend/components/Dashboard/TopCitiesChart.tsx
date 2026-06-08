'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface CityData {
    ciudad: string;
    casos: number;
}

// Datos sintéticos para demostración
const SYNTHETIC_DATA: CityData[] = [
    { ciudad: 'Córdoba', casos: 485 },
    { ciudad: 'La Plata', casos: 328 },
    { ciudad: 'Rosario', casos: 267 },
    { ciudad: 'Mendoza', casos: 194 },
    { ciudad: 'Mar del Plata', casos: 152 },
];

export function TopCitiesChart() {
    const [data, setData] = useState<CityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                // TODO: Reemplazar con API call cuando esté disponible
                setData(SYNTHETIC_DATA);
                setError(null);
            } catch (err) {
                setError('Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <Card className="p-6 bg-white border border-[#e4efff]">
                <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-4">
                    Top 5 Ciudades con más casos
                </h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-1">
                            <div className="h-4 bg-[#f0f0f0] rounded animate-pulse"></div>
                            <div className="h-2 bg-[#f0f0f0] rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    if (error || data.length === 0) {
        return (
            <Card className="p-6 bg-white border border-[#e4efff]">
                <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-4">
                    Top 5 Ciudades con más casos
                </h3>
                <div className="p-3 bg-[#f7f9ff] border border-[#e4efff] rounded text-sm text-[#8d919b]">
                    {error || 'Sin datos disponibles'}
                </div>
            </Card>
        );
    }

    const maxCasos = Math.max(...data.map(item => item.casos));

    return (
        <Card className="p-6 bg-white border border-[#e4efff]">
            <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-4">
                Top 5 Ciudades con más casos
            </h3>

            <div className="space-y-4">
                {data.map((city, index) => {
                    const porcentaje = (city.casos / maxCasos) * 100;
                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#0b1d2d]">{city.ciudad}</span>
                                <span className="font-mono text-xs font-bold text-[#0059bb]">
                                    {city.casos}
                                </span>
                            </div>
                            <div className="w-full bg-[#f7f9ff] h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#0059bb] h-full transition-all"
                                    style={{ width: `${porcentaje}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
