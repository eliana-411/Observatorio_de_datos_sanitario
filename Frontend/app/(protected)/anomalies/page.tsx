'use client';

import React, { useState } from 'react';
import { AnomalyMetricsSection } from '@/components/AnomaliesPrediction/AnomalyMetricsSection';
import { AnomalyDistributionChart } from '@/components/AnomaliesPrediction/AnomalyDistributionChart';
import { SeverityDistributionChart } from '@/components/AnomaliesPrediction/SeverityDistributionChart';
import { AnomaliesTable } from '@/components/AnomaliesPrediction/AnomaliesTable';
import { AnomalyDetailDrawer } from '@/components/AnomaliesPrediction/AnomalyDetailDrawer';

// Mock data for detail drawer
const mockAnomalyDetails = {
    'AN-8892': {
        id: 'AN-8892',
        type: 'Patrón Multivariado Complejo',
        score: 0.92,
        description:
            'Detección de comportamiento atípico en la recurrencia de métodos de asfixia en el sector nororiental, cruzado con historial de abuso de sustancias sintéticas.',
        category: 'Prioridad Clínica 1',
        date: '24 Nov, 2023 - 08:45 AM',
        age: 28,
        stratum: 2,
        yearMonth: '2023/11',
        previousHospitalization: true,
        medicalHistory: 'Múltiple',
        sameLocation: true,
        substanceAbuse: true,
    },
    'AN-8893': {
        id: 'AN-8893',
        type: 'Patrón Geográfico',
        score: 0.84,
        description: 'Concentración anómala de intentos en zona metropolitana sur.',
        category: 'Prioridad Clínica 2',
        date: '24 Nov, 2023 - 10:20 AM',
        age: 35,
        stratum: 3,
        yearMonth: '2023/11',
        previousHospitalization: false,
        medicalHistory: 'Leve',
        sameLocation: false,
        substanceAbuse: false,
    },
    'AN-8894': {
        id: 'AN-8894',
        type: 'Primeriza con Alta Letalidad',
        score: 0.96,
        description: 'Primer evento registrado con patrón de altísimo riesgo.',
        category: 'Prioridad Clínica 1',
        date: '23 Nov, 2023 - 14:30 PM',
        age: 22,
        stratum: 1,
        yearMonth: '2023/11',
        previousHospitalization: false,
        medicalHistory: 'Ninguno',
        sameLocation: true,
        substanceAbuse: false,
    },
};

export default function AnomaliesPredictionPage() {
    const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleRowClick = (id: string) => {
        setSelectedAnomalyId(id);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedAnomalyId(null), 300);
    };

    const selectedAnomaly =
        selectedAnomalyId && mockAnomalyDetails[selectedAnomalyId as keyof typeof mockAnomalyDetails]
            ? mockAnomalyDetails[selectedAnomalyId as keyof typeof mockAnomalyDetails]
            : null;

    return (
        <div className="bg-[#f7f9ff] min-h-screen pt-6 px-6">
            <div className="max-w-360 mx-auto space-y-8">
                {/* Page Title */}
                <div>
                    <h1 className="text-3xl font-black text-[#0b1d2d] tracking-tight">
                        The Clinical Sentinel
                    </h1>
                    <p className="text-sm font-medium tracking-tight text-[#0059bb] uppercase">
                        Anomaly Intelligence Lab
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
                        <SeverityDistributionChart highPercentage={62} mediumPercentage={38} />
                    </div>
                </section>

                {/* Data Table */}
                <AnomaliesTable onRowClick={handleRowClick} />
            </div>

            {/* Detail Drawer */}
            <AnomalyDetailDrawer
                anomaly={selectedAnomaly}
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
            />
        </div>
    );
}
