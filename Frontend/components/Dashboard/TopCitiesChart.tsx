'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fetchResumenMunicipal, ResumenMunicipalData } from '@/lib/api/analytics';

interface CityData {
    ciudad: string;
    casos: number;
}

interface TopCitiesChartProps {
    selectedAnio?: number | null;
    selectedMunicipio?: string;
}

export function TopCitiesChart({ selectedAnio, selectedMunicipio }: TopCitiesChartProps) {
    const [data, setData] = useState<CityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const response = await fetchResumenMunicipal(
                    selectedAnio !== undefined && selectedAnio !== null ? selectedAnio : undefined,
                    selectedMunicipio && selectedMunicipio !== 'todos' ? selectedMunicipio : undefined
                );

                if (response.data && response.data.length > 0) {
                    // Mapear datos y limitar a top 5
                    const topCities: CityData[] = response.data
                        .slice(0, 5)
                        .map((municipio: ResumenMunicipalData) => ({
                            ciudad: municipio.nombreMunicipio,
                            casos: municipio.totalCasos
                        }));
                    setData(topCities);
                    setError(null);
                } else {
                    setData([]);
                    setError(response.error?.message || 'Sin datos disponibles');
                }
            } catch (err) {
                setError('Error al cargar los datos');
                setData([]);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [selectedAnio, selectedMunicipio]);

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
