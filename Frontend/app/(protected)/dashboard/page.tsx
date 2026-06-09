'use client';

import { useState, useEffect } from 'react';
import { FilterBar } from '@/components/Dashboard/FilterBar';
import { KPICard } from '@/components/Dashboard/KPICard';
import { MapContainer } from '@/components/Dashboard/MapContainer';
import { TimeSeriesChart } from '@/components/Dashboard/TimeSeriesChart';
import { TopCitiesChart } from '@/components/Dashboard/TopCitiesChart';
import { GenderDistributionChart } from '@/components/Dashboard/GenderDistributionChart';
import { AgeGroupDistributionChart } from '@/components/Dashboard/AgeGroupDistributionChart';
import { MethodsDistributionChart } from '@/components/Dashboard/MethodsDistributionChart';
import { HospitalizationChart } from '@/components/Dashboard/HospitalizationChart';
import { PyramidChart } from '@/components/Dashboard/PyramidChart';
import { MunicipalComparator } from '@/components/Dashboard/MunicipalComparator';
import { Toast } from '@/components/Toast/Toast';
import { useMunicipios } from '@/hooks/useMunicipios';
import { useToast } from '@/hooks/useToast';
import { useFilterStore } from '@/store/filterStore';
import { fetchDistribucionGeografica, fetchDistribucionGeneroMunicipio, fetchDistribucionGrupoEtarioMunicipio, DistribucionGeograficaData, DistribucionGeneroMunicipioData, DistribucionGrupoEtarioMunicipioData } from '@/lib/api/analytics';

export default function DashboardPage() {
    const [distribucionGeograficaData, setDistribucionGeograficaData] = useState<DistribucionGeograficaData[]>([]);
    const [municipiosData, setMunicipiosData] = useState<DistribucionGeneroMunicipioData[]>([]);
    const [municipiosGrupoEtarioData, setMunicipiosGrupoEtarioData] = useState<DistribucionGrupoEtarioMunicipioData[]>([]);
    const [loading, setLoading] = useState(false);
    const [noDataNotified, setNoDataNotified] = useState(false);

    // Filtros locales para el mapa
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState("todos");
    const [hospitalizacionSeleccionada, setHospitalizacionSeleccionada] = useState("todos");
    const [metodoSeleccionado, setMetodoSeleccionado] = useState("todos");

    const { municipios: municipiosCoordenadas } = useMunicipios();
    const { selectedGenero, selectedGrupoEtario, selectedAnio } = useFilterStore();
    const { toasts, showWarning, removeToast } = useToast();

    const loadMunicipiosData = async () => {
        setLoading(true);
        console.log('Dashboard - Cargando datos con filtros:', {
            anio: selectedAnio,
            genero: selectedGenero,
            edad: selectedGrupoEtario,
            municipio: municipioSeleccionado,
            hospitalizacion: hospitalizacionSeleccionada,
            metodo: metodoSeleccionado
        });

        const response = await fetchDistribucionGeografica(
            selectedAnio !== null ? selectedAnio : undefined,
            selectedGenero !== "Género: Todos" ? selectedGenero.replace("Género: ", "") : undefined,
            selectedGrupoEtario !== "todos" ? selectedGrupoEtario : undefined,
            municipioSeleccionado !== "todos" ? municipioSeleccionado : undefined,
            hospitalizacionSeleccionada !== "todos" ? hospitalizacionSeleccionada : undefined,
            metodoSeleccionado !== "todos" ? metodoSeleccionado : undefined
        );

        console.log('Dashboard - Respuesta del API:', response);
        if (response.data) {
            console.log('Dashboard - Datos recibidos, cantidad:', response.data.length);
            setDistribucionGeograficaData(response.data);
        } else if (response.error) {
            console.error('Dashboard - Error en API:', response.error);
        }
        setLoading(false);
    };

    // Cargar datos al montar el componente y cuando cambian los filtros
    useEffect(() => {
        loadMunicipiosData();
    }, [selectedAnio, selectedGenero, selectedGrupoEtario, municipioSeleccionado, hospitalizacionSeleccionada, metodoSeleccionado]);

    // Mostrar notificación cuando no hay datos
    useEffect(() => {
        if (!loading && distribucionGeograficaData.length === 0 && !noDataNotified) {
            showWarning(
                'No hay datos disponibles para los filtros seleccionados. Por favor, intenta con otros criterios.',
                6000
            );
            setNoDataNotified(true);
        } else if (distribucionGeograficaData.length > 0) {
            setNoDataNotified(false);
        }
    }, [distribucionGeograficaData, loading, noDataNotified, showWarning]);

    // Manejadores de filtros locales para el mapa
    const handleMunicipioChange = (municipio: string) => {
        setMunicipioSeleccionado(municipio);
    };

    const handleHospitalizacionChange = (hospitalizacion: string) => {
        setHospitalizacionSeleccionada(hospitalizacion);
    };

    const handleMetodoChange = (metodo: string) => {
        setMetodoSeleccionado(metodo);
    };

    return (
        <div className="bg-[#f7f9ff] min-h-screen pt-6 px-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filter Bar */}
                <FilterBar
                    municipioSeleccionado={municipioSeleccionado}
                    onMunicipioChange={handleMunicipioChange}
                    hospitalizacionSeleccionada={hospitalizacionSeleccionada}
                    onHospitalizacionChange={handleHospitalizacionChange}
                    metodoSeleccionado={metodoSeleccionado}
                    onMetodoChange={handleMetodoChange}
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        label="Total de Casos Reportados"
                        value="2.457"
                        icon="monitoring"
                        infoTooltip="Cantidad total de eventos sanitarios."
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
                        infoTooltip="El municipio con más casos."
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
                    <div className="lg:col-span-8">
                        <MapContainer
                            distribucionGeograficaData={distribucionGeograficaData}
                            municipiosCoordenadas={municipiosCoordenadas}
                        />
                        <MunicipalComparator
                            municipiosCoordenadas={municipiosCoordenadas}
                            municipiosData={municipiosData}
                        />
                        <div className="lg:col-span-8 mt-6">
                            <MethodsDistributionChart />
                        </div>
                    </div>

                    {/* Distribution Charts Stack */}
                    <div className="lg:col-span-4 space-y-6">
                        <TopCitiesChart />
                        <GenderDistributionChart />
                        <AgeGroupDistributionChart />
                        <HospitalizationChart />
                        <PyramidChart />
                    </div>
                </div>

                {/* Time Series Chart */}
                <div>
                    <TimeSeriesChart />
                </div>

            </div>

            {/* Toast Notifications */}
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
