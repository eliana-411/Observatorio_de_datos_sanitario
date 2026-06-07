'use client';

import { useState, useEffect } from 'react';
import { FilterBar } from '@/components/Dashboard/FilterBar';
import { KPICard } from '@/components/Dashboard/KPICard';
import { MapContainer } from '@/components/Dashboard/MapContainer';
import { TimeSeriesChart } from '@/components/Dashboard/TimeSeriesChart';
import { GenderDistributionChart } from '@/components/Dashboard/GenderDistributionChart';
import { AgeGroupDistributionChart } from '@/components/Dashboard/AgeGroupDistributionChart';
import { MethodsDistributionChart } from '@/components/Dashboard/MethodsDistributionChart';
import { HospitalizationChart } from '@/components/Dashboard/HospitalizationChart';
import { useMunicipios } from '@/hooks/useMunicipios';
import { useFilterStore } from '@/store/filterStore';
import { fetchDistribucionGeneroMunicipio, DistribucionGeneroMunicipioData } from '@/lib/api/analytics';

export default function DashboardPage() {
    const [municipiosData, setMunicipiosData] = useState<DistribucionGeneroMunicipioData[]>([]);
    const [loading, setLoading] = useState(false);
    const { municipios: municipiosCoordenadas } = useMunicipios();
    const { selectedGenero, selectedAnio } = useFilterStore();

    const loadMunicipiosData = async () => {
        setLoading(true);
        const response = await fetchDistribucionGeneroMunicipio(selectedAnio);
        if (response.data) {
            setMunicipiosData(response.data);
        }
        setLoading(false);
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadMunicipiosData();
    }, [selectedAnio]);

    const handleGeneroChange = (genero: string) => {
        // El filtrado de género se hace automáticamente en MapContainer
    };

    const handleAnioChange = (anio: number) => {
        // El filtrado de año se hace automáticamente en MapContainer
    };

    return (
        <div className="bg-[#f7f9ff] min-h-screen pt-6 px-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filter Bar */}
                <FilterBar onGeneroChange={handleGeneroChange} onAnioChange={handleAnioChange} />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        label="Total de Casos Reportados"
                        value="14.282"
                        trend="+12.4%"
                        trendType="positive"
                        icon="monitoring"
                        subtitle="vs semana anterior"
                    />
                    <KPICard
                        label="Brotes Activos"
                        value="08"
                        trend="Riesgo Alto"
                        trendType="negative"
                        icon="emergency"
                        subtitle="3 requieren intervención"
                    />
                    <KPICard
                        label="Tasa de Mortalidad"
                        value="0,42%"
                        trend="-0,05%"
                        trendType="positive"
                        icon="medical_services"
                        subtitle="Estable"
                    />
                    <KPICard
                        label="Tendencia de Recuperación"
                        value="92,8%"
                        trend="Fuerte"
                        trendType="positive"
                        icon="health_and_safety"
                        subtitle="+2,1% de mejora"
                    />
                </div>

                {/* Map + Distribution Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Heat Map */}
                    <div className="lg:col-span-8">
                        <MapContainer
                            municipiosData={municipiosData}
                            municipiosCoordenadas={municipiosCoordenadas}
                        />
                    </div>

                    {/* Distribution Charts Stack */}
                    <div className="lg:col-span-4 space-y-6">
                        <GenderDistributionChart />
                        <AgeGroupDistributionChart />
                    </div>
                </div>

                {/* Methods Distribution Chart and Hospitalization Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <MethodsDistributionChart />
                    </div>
                    <div className="lg:col-span-4">
                        <HospitalizationChart />
                    </div>
                </div>

                {/* Time Series Chart */}
                <div>
                    <TimeSeriesChart />
                </div>

            </div>
        </div>
    );
}
