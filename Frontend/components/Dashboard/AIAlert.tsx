'use client';

export function AIAlert() {
    return (
        <div className="bg-linear-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4">
                <span
                    className="material-symbols-outlined text-secondary-container"
                    data-icon="psychiatry"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    psychiatry
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest">Información del Observatorio</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-80 mb-4">
                Los modelos de aprendizaje automático detectan un potencial{' '}
                <span className="text-secondary-container font-bold underline">resurgimiento de Malaria</span> en los
                Llanos Orientales debido a patrones de precipitación inusuales.
            </p>
            <button className="w-full bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors border border-white/10">
                Ejecutar Simulación Completa
            </button>
        </div>
    );
}
