'use client';

import React from 'react';

interface KPICardProps {
    label: string;
    value: string;
    subtext?: string;
    icon?: React.ReactNode;
    trend?: string;
    isHighlight?: boolean;
    isDark?: boolean;
    percentage?: number;
}

export function KPICard({
    label,
    value,
    subtext,
    icon,
    trend,
    isHighlight = false,
    isDark = false,
    percentage = 0,
}: KPICardProps) {
    return (
        <div
            className={`
                p-4
                rounded-xl
                flex
                flex-col
                justify-between
                shadow-[0px_12px_32px_rgba(11,29,45,0.04)]
                relative
                overflow-hidden
                group
                transition-all
                duration-300
                hover:shadow-lg
                ${isDark
                    ? 'bg-[#0b1d2d] text-white'
                    : 'bg-white text-[#0b1d2d]'
                }
                ${isHighlight ? 'border-l-4 border-[#9e3d00]' : ''}
            `}
        >
            {/* Decorative gradient circle */}
            {!isDark && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#0059bb]/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500"></div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <span
                    className={`
                        text-xs
                        font-bold
                        uppercase
                        tracking-widest
                        ${isDark ? 'opacity-60 text-[#d2e4fb]' : 'text-[#414754] opacity-60'}
                    `}
                >
                    {label}
                </span>

                {icon && (
                    <div className={`${isDark ? 'opacity-60' : 'text-[#0059bb]'}`}>
                        {icon}
                    </div>
                )}
            </div>

            {/* Value Section */}
            <div className="relative z-10">
                <div className="flex flex-baseline gap-1 mb-4">
                    <span className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#0b1d2d]'
                        }`}>
                        {value}
                    </span>
                </div>

                {/* Progress Bar */}
                {percentage > 0 && !isDark && (
                    <div className="h-1.5 w-full bg-[#e4efff] rounded-full overflow-hidden">
                        <div
                            className={`
                                h-full
                                rounded-full
                                transition-all
                                duration-500
                                bg-linear-to-r from-[#0059bb] to-[#0070ea]
                            `}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
}
