'use client';

export function TimeSeriesChart() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex-1 flex flex-col border border-gray-200">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">
                    Serie Temporal Semanal
                </h2>
                <span className="material-symbols-outlined text-primary-container" data-icon="show_chart">
                    show_chart
                </span>
            </div>

            <div className="flex-1 flex flex-col justify-end gap-2">
                {/* Simulated Chart Visual */}
                <div className="flex items-end gap-1.5 h-32 w-full">
                    <div className="flex-1 bg-gray-200 h-[20%] rounded-t-sm"></div>
                    <div className="flex-1 bg-gray-200 h-[35%] rounded-t-sm"></div>
                    <div className="flex-1 bg-gray-200 h-[30%] rounded-t-sm"></div>
                    <div className="flex-1 bg-gray-200 h-[55%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary h-[85%] rounded-t-sm relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">
                            Pico
                        </div>
                    </div>
                    <div className="flex-1 bg-primary h-[70%] rounded-t-sm"></div>
                    <div className="flex-1 bg-primary h-[60%] rounded-t-sm"></div>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-200 text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mié</span>
                    <span>Jue</span>
                    <span>Vie</span>
                    <span>Sáb</span>
                    <span>Dom</span>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-surface-container">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-on-surface">Confianza Predictiva</p>
                    <p className="text-xs font-black text-primary">88,4%</p>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary h-full w-[88%] rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
