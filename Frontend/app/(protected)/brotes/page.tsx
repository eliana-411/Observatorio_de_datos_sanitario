'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertBanner } from '@/components/BrotesPrediction/AlertBanner';
import { PredictionSummaryCard } from '@/components/BrotesPrediction/PredictionSummaryCard';
import { RiskMap } from '@/components/BrotesPrediction/RiskMap';
import { TimeSeriesChart } from '@/components/BrotesPrediction/TimeSeriesChart';
import { ModelMetricsCard } from '@/components/BrotesPrediction/ModelMetricsCard';
import { FeatureImportanceCard } from '@/components/BrotesPrediction/FeatureImportanceCard';
import { MunicipalityTable } from '@/components/BrotesPrediction/MunicipalityTable';
import { BrotesMunicipioFilter } from '@/components/BrotesPrediction/BrotesMunicipioFilter';
import { BrotesMonthsFilter } from '@/components/BrotesPrediction/BrotesMonthsFilter';
import { useFilterStore } from '@/store/filterStore';
import { useBrotesApi } from '@/hooks/useBrotesApi';
import { transformBrotesData, ChartDataPoint, ChartMetadata } from '@/lib/brotes/dataTransformation';

export default function BrotesPredictionPage() {
    // Ref para scroll
    const predictionSummaryRef = useRef<HTMLDivElement>(null);

    // Estado global (Zustand)
    const { selectedMunicipio, setSelectedMunicipio } = useFilterStore();

    // Estado local
    const [monthsToDisplay, setMonthsToDisplay] = useState<number>(1);
    const [municipios, setMunicipios] = useState<string[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [chartMetadata, setChartMetadata] = useState<ChartMetadata>({
        umbralAlerta: 0,
        mediaHistorica: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API hooks
    const { fetchMunicipios, fetchHistorico, fetchPredict } = useBrotesApi();

    // Función para hacer scroll al cuadro de casos de riesgo crítico
    const handleScrollToCriticalCases = () => {
        if (predictionSummaryRef.current) {
            predictionSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // 1. Cargar lista de municipios al montar
    useEffect(() => {
        const loadMunicipios = async () => {
            setLoading(true);
            const municipiosData = await fetchMunicipios();
            setMunicipios(municipiosData);
            setLoading(false);
        };

        loadMunicipios();
    }, [fetchMunicipios]);

    // 2. Cargar histórico + predicción cuando cambian municipio o meses
    useEffect(() => {
        if (municipios.length === 0 || !selectedMunicipio || selectedMunicipio === 'todos') return;

        // Validar que el municipio existe en la lista
        const municipioValido = municipios.find(
            m => m.toLowerCase().replace(/\s+/g, '_') === selectedMunicipio || m === selectedMunicipio
        );

        if (!municipioValido) return;

        const loadBrotesData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Usar el nombre completo del municipio
                const municipioNombre = municipioValido;

                // Fetch histórico y predicción en paralelo
                const [historicoData, predictionResponse] = await Promise.all([
                    fetchHistorico(municipioNombre),
                    fetchPredict(municipioNombre, monthsToDisplay),
                ]);

                // Transformar datos
                const { data, metadata } = transformBrotesData(
                    historicoData,
                    predictionResponse,
                    monthsToDisplay
                );

                setChartData(data);
                setChartMetadata(metadata);
            } catch (err) {
                setError('Error al cargar los datos de brotes');
                console.error('Error loading brotes data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBrotesData();
    }, [selectedMunicipio, monthsToDisplay, municipios, fetchHistorico, fetchPredict]);

    return (
        <div className="bg-[#f7f9ff] dark:bg-[#0b1d2d] min-h-screen pt-6 px-6">
            <div className="max-w-360 mx-auto space-y-6">
                {/* Título y Filtros */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Predicción de Brotes
                    </h1>

                    {/* Barra de Filtros */}
                    <div className="flex flex-wrap gap-4 items-end">
                        <BrotesMunicipioFilter
                            municipios={municipios}
                            loading={loading}
                        />
                        <BrotesMonthsFilter
                            value={monthsToDisplay}
                            onChange={setMonthsToDisplay}
                        />
                        {/* Alert Banner - Compacto a la derecha */}
                        <div className="ml-auto"><AlertBanner onScrollToCard={handleScrollToCriticalCases} /></div>
                    </div>
                </div>

                {/* Bento Grid - Second Row */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Time Series Chart */}
                    <div className="col-span-12 lg:col-span-8">
                        <TimeSeriesChart
                            data={chartData}
                            mediaHistorica={chartMetadata.mediaHistorica}
                            umbralAlerta={chartMetadata.umbralAlerta}
                            municipio={selectedMunicipio}
                            loading={loading}
                        />
                    </div>

                    {/* Model Performance & Feature Importance */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <ModelMetricsCard />
                        <FeatureImportanceCard />
                    </div>
                </div>

                {/* Bento Grid - First Row */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Prediction Summary */}
                    <div className="col-span-12 lg:col-span-5" ref={predictionSummaryRef}>
                        <PredictionSummaryCard />
                    </div>

                    {/* Risk Map */}
                    <div className="col-span-12 lg:col-span-7">
                        <RiskMap />
                    </div>
                </div>

                {/* Municipality Table */}
                <MunicipalityTable />
            </div>
        </div>
    );
}
