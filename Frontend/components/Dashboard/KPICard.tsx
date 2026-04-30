'use client';

import { ReactNode } from 'react';

interface KPICardProps {
    label: string;
    value: string;
    trend: string;
    trendType: 'positive' | 'negative' | 'neutral';
    icon: string;
    subtitle: string;
}

export function KPICard({ label, value, trend, trendType, icon, subtitle }: KPICardProps) {
    const getBgColor = () => {
        switch (trendType) {
            case 'positive':
                return 'bg-[#d1fae5]';
            case 'negative':
                return 'bg-error-container';
            default:
                return 'bg-surface-container';
        }
    };

    const getTextColor = () => {
        switch (trendType) {
            case 'positive':
                return 'text-[#065f46]';
            case 'negative':
                return 'text-on-error-container';
            default:
                return 'text-on-secondary-container';
        }
    };

    const getTrendIcon = () => {
        if (trendType === 'positive') return 'trending_up';
        if (trendType === 'negative') return 'trending_down';
        return 'trending_down';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border-none relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[#414754] text-[11px] font-bold uppercase tracking-widest mb-1">
                    {label}
                </p>
                <h3 className="text-3xl font-black text-[#0b1d2d] tracking-tighter">{value}</h3>
                <div className="mt-4 flex items-center gap-2">
                    <span className={`flex items-center text-[10px] font-bold ${getBgColor()} ${getTextColor()} px-2 py-0.5 rounded-full`}>
                        <span className="material-symbols-outlined text-xs mr-1">
                            {getTrendIcon()}
                        </span>
                        {trend}
                    </span>
                    <span className="text-[10px] text-[#0b1d2d] font-medium">{subtitle}</span>
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-9xl" data-icon={icon}>
                    {icon}
                </span>
            </div>
        </div>
    );
}
