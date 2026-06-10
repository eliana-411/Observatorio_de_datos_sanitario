'use client';

import React, { useState, useCallback } from 'react';
import { AnomalyMetricsSection } from '@/components/AnomaliesPrediction/AnomalyMetricsSection';
import { AnomalyDistributionChart } from '@/components/AnomaliesPrediction/AnomalyDistributionChart';
import { SeverityDistributionChart } from '@/components/AnomaliesPrediction/SeverityDistributionChart';
import { AnomaliesTable } from '@/components/AnomaliesPrediction/AnomaliesTable';
import { AnomalyDetailDrawer } from '@/components/AnomaliesPrediction/AnomalyDetailDrawer';
import { api } from '@/lib/api/client';

export default function AnomaliesPredictionPage() {
    const [selectedAnomalyId, setSelectedAnomalyId] = useState<number | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleRowClick = useCallback((id: number) => {
        setSelectedAnomalyId(id);
        setIsDrawerOpen(true);
    }, []);

    const handleDrawerClose = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const handlePrefetch = useCallback((id: number) => {
        // Prefetch en background sin mostrar loading
        api.get(`/anomalias/detalle/${id}`).catch(() => {
            // Silenciosamente ignorar errores de prefetch
        });
    }, []);

    return (
        <div className="bg-[#f7f9ff] min-h-screen pt-6 px-6">
            <div className="max-w-360 mx-auto space-y-8">
                {/* Page Title */}
                <div>
                    <h1 className="text-3xl font-black text-[#0b1d2d] tracking-tight">
                        Predicción de Anomalías
                    </h1>
                    <p className="text-sm font-medium tracking-tight text-[#0059bb] uppercase">
                        Isolation Forest
                    </p>
                </div>

                {/* KPI Metrics Section */}
                <AnomalyMetricsSection />

                {/* Visualization Row */}
                <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Distribution Chart */}
                    <div className="lg:col-span-3">
                        <AnomalyDistributionChart />
                    </div>

                    {/* Severity Distribution Chart */}
                    <div className="lg:col-span-2">
                        <SeverityDistributionChart />
                    </div>
                </section>

                {/* Data Table */}
                <AnomaliesTable onRowClick={handleRowClick} onPrefetch={handlePrefetch} />
            </div>

            {/* Detail Drawer */}
            <AnomalyDetailDrawer
                anomalyId={selectedAnomalyId}
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
            />
        </div>
    );
}
