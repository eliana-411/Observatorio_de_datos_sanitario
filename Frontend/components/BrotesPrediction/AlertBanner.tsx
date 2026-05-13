'use client';

export function AlertBanner() {
    return (
        <div className="bg-[#93000a] dark:bg-[#93000a] text-white p-4 rounded-lg flex items-center justify-between border border-[#e74c3c]/20 animate-pulse">
            <div className="flex items-center gap-3">
                <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    data-icon="warning"
                >
                    warning
                </span>
                <span className="font-bold text-sm uppercase tracking-wide">
                    Alerta Crítica Detectada: Tendencia Superior al Umbral en 4 Municipios
                </span>
            </div>
            <span className="text-xs font-mono opacity-80">Última actualización: hace 4 min</span>
        </div>
    );
}
