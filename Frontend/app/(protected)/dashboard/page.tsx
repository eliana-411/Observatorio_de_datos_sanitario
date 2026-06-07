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
import { fetchDistribucionGeneroMunicipio, fetchDistribucionGrupoEtarioMunicipio, DistribucionGeneroMunicipioData, DistribucionGrupoEtarioMunicipioData } from '@/lib/api/analytics';

export default function DashboardPage() {
    const [municipiosData, setMunicipiosData] = useState<DistribucionGeneroMunicipioData[]>([]);
    const [municipiosGrupoEtarioData, setMunicipiosGrupoEtarioData] = useState<DistribucionGrupoEtarioMunicipioData[]>([]);
    const [loading, setLoading] = useState(false);
    const { municipios: municipiosCoordenadas } = useMunicipios();
    const { selectedGenero, selectedGrupoEtario, selectedAnio } = useFilterStore();

    const loadMunicipiosData = async () => {
        setLoading(true);
        const [responseGenero, responseGrupoEtario] = await Promise.all([
            fetchDistribucionGeneroMunicipio(selectedAnio),
            fetchDistribucionGrupoEtarioMunicipio(selectedAnio)
        ]);

        if (responseGenero.data) {
            setMunicipiosData(responseGenero.data);
        }
        if (responseGrupoEtario.data) {
            setMunicipiosGrupoEtarioData(responseGrupoEtario.data);
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

    const handleGrupoEtarioChange = (grupoEtario: string) => {
        // El filtrado de grupo etario se hace automáticamente en MapContainer
    };

    const handleAnioChange = (anio: number) => {
        // El filtrado de año se hace automáticamente en MapContainer
    };

    return (
        <div className="bg-[#f7f9ff] min-h-screen pt-6 px-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filter Bar */}
                <FilterBar onGeneroChange={handleGeneroChange} onGrupoEtarioChange={handleGrupoEtarioChange} onAnioChange={handleAnioChange} />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        label="Total de Casos Reportados"
                        value="2.457"
                        icon="monitoring"
                        infoTooltip="Cantidad total de eventos sanitarios según los filtros aplicados."
                    />
                    <KPICard
                        label="Tasa de Hospitalización"
                        value="18,5%"
                        icon="local_hospital"
                        infoTooltip="Porcentaje de casos que requirieron hospitalización."
                    />
                    <KPICard
                        label="Municipio con Mayor Incidencia"
                        value="Córdoba"
                        icon="location_on"
                        infoTooltip="El municipio con más casos dentro de los filtros actuales."
                    />
                    <KPICard
                        label="Índice de Severidad"
                        value="7,2/10"
                        icon="warning"
                        infoTooltip="Hospitalización (70%) + Reincidencia (30%). Peso de hospitalización refleja gravedad clínica directa."
                    />
                </div>

                {/* Map + Distribution Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Heat Map */}
                    <div className="lg:col-span-8">
                        <MapContainer
                            municipiosData={municipiosData}
                            municipiosGrupoEtarioData={municipiosGrupoEtarioData}
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
