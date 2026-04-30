'use client';

import { FilterBar } from '@/components/Dashboard/FilterBar';
import { KPICard } from '@/components/Dashboard/KPICard';
import { MapContainer } from '@/components/Dashboard/MapContainer';
import { TimeSeriesChart } from '@/components/Dashboard/TimeSeriesChart';
import { AIAlert } from '@/components/Dashboard/AIAlert';
import { OutbreakTable } from '@/components/Dashboard/OutbreakTable';

export default function DashboardPage() {
    return (
        <div className="bg-[#f7f9ff] min-h-screen pt-6 px-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filter Bar */}
                <FilterBar />

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

                {/* Asymmetric Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Heat Map */}
                    <div className="lg:col-span-8">
                        <MapContainer />
                    </div>

                    {/* Secondary Column */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col">
                        <TimeSeriesChart />
                        <AIAlert />
                    </div>
                </div>

                {/* Table Section */}
            </div>
            <OutbreakTable />
        </div>
    );
}
