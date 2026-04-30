'use client';

export function MapContainer() {
    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-surface-container flex justify-between items-center bg-white/50 backdrop-blur-md">
                <div>
                    <h2 className="text-lg font-black text-on-surface tracking-tight">
                        Mapa de Calor de Prevalencia Geográfica
                    </h2>
                    <p className="text-xs text-on-surface-variant font-medium">
                        Clústeres regionales de casos de Dengue detectados en tiempo real
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="zoom_in">
                            zoom_in
                        </span>
                    </button>
                    <button className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="layers">
                            layers
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex-1 relative bg-gray-50 group flex items-center justify-center">
                {/* Placeholder para mapa */}
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-8xl text-gray-300 opacity-30">
                        map
                    </span>
                    <p className="text-gray-600 text-sm font-medium">
                        Mapa interactivo - Visualización de datos
                    </p>
                </div>

                {/* Map Legend Overlay */}
                <div className="absolute bottom-6 left-6 p-4 backdrop-blur-md bg-white/80 dark:bg-on-surface/80 rounded-xl shadow-xl border border-white/20 dark:border-surface-container-high w-48">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-surface-variant mb-3">
                        Densidad de Infección
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-error shadow-[0_0_8px_rgba(186,26,26,0.6)]"></div>
                            <span className="text-[10px] font-bold text-on-surface dark:text-surface">Crítica (&gt; 150)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_8px_rgba(158,61,0,0.4)]"></div>
                            <span className="text-[10px] font-bold text-on-surface dark:text-surface">
                                Elevada (50-150)
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,112,234,0.3)]"></div>
                            <span className="text-[10px] font-bold text-gray-900">Base (&lt; 50)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
