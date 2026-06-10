'use client';

export function AlertBanner() {
    return (
        <div className="bg-[#93000a] dark:bg-[#93000a] text-white p-3 rounded-lg flex items-center justify-between border border-[#e74c3c]/20 animate-pulse">
            <div className="flex items-center gap-2">
                <span
                    className="material-symbols-outlined text-lg shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    warning
                </span>
                <span className="font-semibold text-xs uppercase tracking-wide">
                    Alerta: 4 Municipios con Tendencia Alta
                </span>
            </div>
            <span className="text-xs opacity-70 shrink-0">hace 4 min</span>
        </div>
    );
}
