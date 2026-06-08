'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { api } from '@/lib/api/client';

interface Anomaly {
    idRegistro: number;
    fecha: string;
    municipioEvento: string;
    tipoAnomalia: string;
    descripcionAnomalia: string;
    severidad: 'Alta' | 'Media' | 'Baja';
    categoria: string;
    anomalyScore: number;
    edad: number;
    genero: string;
    metodo: string;
}

interface AnomaliesListResponse {
    status: string;
    total: number;
    pagina: number;
    anomalias: Anomaly[];
}

interface AnomaliesTableProps {
    onRowClick?: (id: number) => void;
    onPrefetch?: (id: number) => void;
}

export function AnomaliesTable({ onRowClick, onPrefetch }: AnomaliesTableProps) {
    const [allData, setAllData] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [limite, setLimite] = useState(5);
    const [filters, setFilters] = useState({
        type: '',
        severity: '',
        category: '',
    });

    // Prefetch tracking para evitar multiples requests del mismo dato
    const prefetchedIds = useRef<Set<number>>(new Set());

    const getSeverityBadgeColor = useCallback((severity: string) => {
        switch (severity) {
            case 'Alta':
                return 'bg-[#ffebee] text-[#c62828]';
            case 'Media':
                return 'bg-[#fff3e0] text-[#e65100]';
            default:
                return 'bg-[#e4efff] text-[#414754]';
        }
    }, []);

    // Fetch datos del backend (solo cuando cambian los filtros)
    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    limite: '500', // Traer más registros de una vez
                    offset: '0',
                });

                if (filters.type) params.append('tipo', filters.type);
                if (filters.severity) params.append('severidad', filters.severity);
                if (filters.category) params.append('categoria', filters.category);

                const response = await api.get<AnomaliesListResponse>(
                    `/anomalias/listado?${params.toString()}`
                );

                if (response.data?.anomalias) {
                    setAllData(response.data.anomalias);
                    setTotal(response.data.total);
                    setCurrentPage(0); // Reset a primera página
                    prefetchedIds.current.clear(); // Limpiar prefetch cuando cambian datos
                } else if (response.error) {
                    setError(response.error.message);
                }
            } catch (err) {
                console.error('Error fetching anomalies:', err);
                setError('Error al cargar las anomalías');
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalies();
    }, [filters]); // Solo cuando cambian los filtros

    // Paginar en el frontend
    const displayData = useMemo(() =>
        allData.slice(currentPage * limite, (currentPage + 1) * limite),
        [allData, currentPage, limite]
    );

    const totalPages = useMemo(() => Math.ceil(total / limite), [total, limite]);

    // Manejar prefetch de datos
    const handlePrefetch = useCallback((id: number) => {
        if (!prefetchedIds.current.has(id) && onPrefetch) {
            prefetchedIds.current.add(id);
            onPrefetch(id);
        }
    }, [onPrefetch]);

    // Manejar click en fila
    const handleRowClick = useCallback((id: number) => {
        onRowClick?.(id);
    }, [onRowClick]);

    // Actualizar page size
    const handlePageSizeChange = useCallback((value: number) => {
        const newValue = parseInt(String(value)) || 5;
        setLimite(Math.max(1, Math.min(100, newValue)));
        setCurrentPage(0);
    }, []);

    // Actualizar filtro de tipo
    const handleTypeFilterChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, type: value }));
        setCurrentPage(0);
    }, []);

    // Actualizar filtro de severidad
    const handleSeverityFilterChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, severity: value }));
        setCurrentPage(0);
    }, []);

    // Actualizar filtro de categoría
    const handleCategoryFilterChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, category: value }));
        setCurrentPage(0);
    }, []);

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)] p-6">
                <p className="text-sm text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)] overflow-hidden">
            {/* Header with Filters */}
            <div className="p-6 bg-[#f7f9ff]">
                <h3 className="text-lg font-bold text-[#0b1d2d] mb-4">
                    Registro de Anomalías
                </h3>

                <div className="flex flex-wrap justify-end gap-3 items-center md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#0b1d2d] whitespace-nowrap">Registros/página:</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={limite}
                            onChange={(e) => handlePageSizeChange(parseInt(e.target.value) || 5)}
                            className="
                                w-15
                                bg-white
                                border
                                border-[#c1c6d7]
                                text-xs
                                font-semibold
                                rounded-lg
                                px-3
                                py-2
                                text-[#0b1d2d]
                                focus:ring-[#0059bb]
                                focus:border-[#0059bb]
                                transition-all
                            "
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#0b1d2d] whitespace-nowrap">Tipo Anomalías:</label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleTypeFilterChange(e.target.value)}
                            className="
                                w-68
                                bg-white
                                border
                                border-[#c1c6d7]
                                text-xs
                                font-semibold
                                rounded-lg
                                px-3
                                py-2
                                text-[#0b1d2d]
                                focus:ring-[#0059bb]
                                focus:border-[#0059bb]
                                transition-all
                            "
                        >
                            <option value="">Todos</option>
                            <option value="Primeriza + letalidad alta">Primeriza + letalidad alta</option>
                            <option value="Desplazamiento geográfico">Desplazamiento geográfico</option>
                            <option value="Gravedad individual">Gravedad individual</option>
                            <option value="Combinaciones Salud Mental + Sustancias">Combinaciones Salud Mental + Sustancias</option>
                            <option value="Patrones multivariados complejos">Patrones multivariados complejos</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#0b1d2d] whitespace-nowrap">Severidad:</label>
                        <select
                            value={filters.severity}
                            onChange={(e) => handleSeverityFilterChange(e.target.value)}
                            className="
                                w-20
                                bg-white
                                border
                                border-[#c1c6d7]
                                text-xs
                                font-semibold
                                rounded-lg
                                px-3
                                py-2
                                text-[#0b1d2d]
                                focus:ring-[#0059bb]
                                focus:border-[#0059bb]
                                transition-all
                            "
                        >
                            <option value="">Todos</option>
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#0b1d2d] whitespace-nowrap">Categoría:</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleCategoryFilterChange(e.target.value)}
                            className="
                                w-40
                                bg-white
                                border
                                border-[#c1c6d7]
                                text-xs
                                font-semibold
                                rounded-lg
                                px-3
                                py-2
                                text-[#0b1d2d]
                                focus:ring-[#0059bb]
                                focus:border-[#0059bb]
                                transition-all
                            "
                        >
                            <option value="">Todos</option>
                            <option value="Riesgo individual">Riesgo individual</option>
                            <option value="Patrón geográfico">Patrón geográfico</option>
                            <option value="Gravedad clínica">Gravedad clínica</option>
                            <option value="Perfil contextual">Perfil contextual</option>
                            <option value="Patrón complejo">Patrón complejo</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f7f9ff] text-[#414754] text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Descripción</th>
                            <th className="px-6 py-4">Edad</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4">Severidad</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Detalles</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#e4efff]">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-2 h-2 bg-[#0059bb] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#0059bb] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-[#0059bb] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </td>
                            </tr>
                        ) : displayData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-[#414754]">
                                    No hay anomalías disponibles
                                </td>
                            </tr>
                        ) : (
                            displayData.map((anomaly) => (
                                <tr
                                    key={anomaly.idRegistro}
                                    onClick={() => handleRowClick(anomaly.idRegistro)}
                                    onMouseEnter={() => handlePrefetch(anomaly.idRegistro)}
                                    className="
                                        hover:bg-[#f7f9ff]
                                        cursor-pointer
                                        transition-colors
                                        group
                                    "
                                >
                                    <td className="px-6 py-4 text-xs font-bold text-[#0059bb]">
                                        AN-{anomaly.idRegistro}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold bg-[#e8f4f8] text-[#006a80] px-2 py-1 rounded">
                                            {anomaly.tipoAnomalia}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-[#414754] max-w-xs truncate">
                                        {anomaly.descripcionAnomalia}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-[#414754]">
                                        {anomaly.edad}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-black text-[#0b1d2d]">
                                            {anomaly.anomalyScore.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`
                                                text-[10px]
                                                font-bold
                                                px-3
                                                py-1
                                                rounded-full
                                                ${getSeverityBadgeColor(anomaly.severidad)}
                                            `}
                                        >
                                            {anomaly.severidad}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-[#414754]">
                                        {anomaly.categoria}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="material-symbols-outlined text-[#717786] group-hover:text-[#0059bb] transition-colors">
                                            chevron_right
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#e4efff] flex items-center justify-between">
                <p className="text-[10px] text-[#414754] font-semibold uppercase tracking-widest">
                    Mostrando {currentPage * limite + 1} a {Math.min((currentPage + 1) * limite, total)} de {total} resultados
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="
                            p-2
                            border
                            border-[#e4efff]
                            rounded-lg
                            hover:bg-[#f7f9ff]
                            transition-colors
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                        aria-label="Página anterior"
                    >
                        <span className="material-symbols-outlined text-sm">
                            chevron_left
                        </span>
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="
                            p-2
                            border
                            border-[#e4efff]
                            rounded-lg
                            hover:bg-[#f7f9ff]
                            transition-colors
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                        aria-label="Página siguiente"
                    >
                        <span className="material-symbols-outlined text-sm">
                            chevron_right
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
