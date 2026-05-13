'use client';

import { AlertBanner } from '@/components/BrotesPrediction/AlertBanner';
import { PredictionSummaryCard } from '@/components/BrotesPrediction/PredictionSummaryCard';
import { RiskMap } from '@/components/BrotesPrediction/RiskMap';
import { TimeSeriesChart } from '@/components/BrotesPrediction/TimeSeriesChart';
import { ModelMetricsCard } from '@/components/BrotesPrediction/ModelMetricsCard';
import { FeatureImportanceCard } from '@/components/BrotesPrediction/FeatureImportanceCard';
import { MunicipalityTable } from '@/components/BrotesPrediction/MunicipalityTable';

export default function BrotesPredictionPage() {
    return (
        <div className="bg-[#f7f9ff] dark:bg-[#0b1d2d] min-h-screen pt-6 px-6">
            <div className="max-w-[1440px] mx-auto space-y-6">
                {/* Alert Banner */}
                <AlertBanner />

                {/* Bento Grid - First Row */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Prediction Summary */}
                    <div className="col-span-12 lg:col-span-5">
                        <PredictionSummaryCard />
                    </div>

                    {/* Risk Map */}
                    <div className="col-span-12 lg:col-span-7">
                        <RiskMap />
                    </div>
                </div>

                {/* Bento Grid - Second Row */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Time Series Chart */}
                    <div className="col-span-12 lg:col-span-8">
                        <TimeSeriesChart />
                    </div>

                    {/* Model Performance & Feature Importance */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <ModelMetricsCard />
                        <FeatureImportanceCard />
                    </div>
                </div>

                {/* Municipality Table */}
                <MunicipalityTable />
            </div>
        </div>
    );
}
