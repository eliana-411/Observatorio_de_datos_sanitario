'use client';

interface PredictionAlertCardProps {
    label: string;
    value: string | number;
    badge?: string;
    badgeColor?: 'error' | 'primary' | 'tertiary';
    icon?: string;
    backgroundColor?: string;
    valueColor?: string;
    description?: string;
}

export function PredictionAlertCard({
    label,
    value,
    badge,
    badgeColor = 'error',
    icon = 'warning',
    backgroundColor = 'bg-[#ffdad6]',
    valueColor = 'text-[#93000a]',
    description,
}: PredictionAlertCardProps) {
    const badgeColorMap = {
        error: 'bg-[#ba1a1a] text-white',
        primary: 'bg-[#0059bb] text-white',
        tertiary: 'bg-[#9e3d00] text-white',
    };

    return (
        <div className={`${backgroundColor} p-6 rounded-2xl flex flex-col justify-between h-full`}>
            <div className="flex justify-between items-start mb-4">
                <span className={`${badgeColorMap[badgeColor]} text-[10px] px-2 py-1 rounded font-black tracking-widest uppercase`}>
                    {badge || 'Alerta'}
                </span>
                <span className="material-symbols-outlined text-[#93000a]">
                    {icon}
                </span>
            </div>
            <div>
                <p className={`text-[11px] font-bold text-[#93000a] uppercase tracking-widest opacity-70 ${description ? 'mb-2' : 'mb-3'}`}>
                    {label}
                </p>
                <h4 className={`text-3xl font-black ${valueColor} leading-none`}>
                    {value}
                </h4>
                {description && (
                    <p className="text-[10px] text-[#93000a] opacity-60 mt-2 font-medium">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
