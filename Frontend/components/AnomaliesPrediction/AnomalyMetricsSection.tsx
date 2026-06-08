'use client';

import React from 'react';
import { AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { KPICard } from './KPICard';

export function AnomalyMetricsSection() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI 1: Model Reliability */}
            <KPICard
                label="Model Reliability"
                value="94.2%"
                trend="+0.4% vs last week"
                percentage={94.2}
                icon={<CheckCircle className="w-5 h-5 text-[#0059bb]" />}
            />

            {/* KPI 2: Detection Rate */}
            <KPICard
                label="Detection Rate"
                value="3.8%"
                subtext="Incremento marginal en patrones de salud mental multivariados detectados hoy."
                isHighlight={true}
                icon={<AlertCircle className="w-5 h-5 text-[#9e3d00]" />}
            />

            {/* KPI 3: Total Anomalies */}
            <KPICard
                label="Total Anomalies"
                value="1,248"
                isDark={true}
                icon={<TrendingUp className="w-5 h-5" />}
                subtext=""
            />
        </section>
    );
}
