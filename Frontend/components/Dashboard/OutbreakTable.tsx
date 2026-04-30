'use client';

export function OutbreakTable() {
    const outbreaks = [
        {
            id: '#SUR-2024-081',
            location: 'San Marcos Norte',
            pathogen: 'Influenza A',
            cases: '142',
            status: 'Respuesta Activa',
            statusColor: 'text-error',
            statusDot: 'bg-error',
            animated: true,
        },
        {
            id: '#SUR-2024-079',
            location: 'Distrito Industrial',
            pathogen: 'Tuberculosis',
            cases: '12',
            status: 'Contención',
            statusColor: 'text-tertiary',
            statusDot: 'bg-tertiary',
            animated: false,
        },
        {
            id: '#SUR-2024-072',
            location: 'Valley View Estates',
            pathogen: 'Norovirus',
            cases: '340',
            status: 'Resuelto',
            statusColor: 'text-[#065f46]',
            statusDot: 'bg-[#065f46]',
            animated: false,
        },
    ];

    return (
        <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">
                    Detecciones Recientes de Brotes
                </h2>
                <button className="text-xs font-bold text-primary hover:underline">Ver Archivo Histórico</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            <th className="px-6 py-4">ID de Detección</th>
                            <th className="px-6 py-4">Ubicación</th>
                            <th className="px-6 py-4">Patógeno</th>
                            <th className="px-6 py-4">Casos Confirmados</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {outbreaks.map((outbreak) => (
                            <tr
                                key={outbreak.id}
                                className="hover:bg-surface-container-low transition-colors"
                            >
                                <td className="px-6 py-4 text-xs font-bold text-on-surface">
                                    {outbreak.id}
                                </td>
                                <td className="px-6 py-4 text-xs text-on-surface-variant">
                                    {outbreak.location}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded bg-surface-container text-on-secondary-container text-[10px] font-bold">
                                        {outbreak.pathogen}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-on-surface">
                                    {outbreak.cases}
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${outbreak.statusColor}`}>
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${outbreak.statusDot} ${outbreak.animated ? 'animate-pulse' : ''
                                                }`}
                                        ></span>
                                        {outbreak.status}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-primary hover:text-primary-container transition-colors">
                                        <span className="material-symbols-outlined text-lg" data-icon="open_in_new">
                                            open_in_new
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
