'use client';

import React, { useState } from 'react';

interface Anomaly {
    id: string;
    date: string;
    event: string;
    municipality: string;
    type: string;
    score: number;
    severity: 'Alta' | 'Media' | 'Baja';
}

interface AnomaliesTableProps {
    data?: Anomaly[];
    onRowClick?: (id: string) => void;
}

const defaultData: Anomaly[] = [
    {
        id: 'AN-8892',
        date: '2023-11-24',
        event: 'Intento',
        municipality: 'Medellín',
        type: 'Multivariado',
        score: 0.92,
        severity: 'Alta',
    },
    {
        id: 'AN-8893',
        date: '2023-11-24',
        event: 'Suicidio',
        municipality: 'Envigado',
        type: 'Geográfico',
        score: 0.84,
        severity: 'Media',
    },
    {
        id: 'AN-8894',
        date: '2023-11-23',
        event: 'Intento',
        municipality: 'Itagüí',
        type: 'Primeriza',
        score: 0.96,
        severity: 'Alta',
    },
];

const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
        case 'Alta':
            return 'bg-[#ffebee] text-[#c62828]';
        case 'Media':
            return 'bg-[#fff3e0] text-[#e65100]';
        default:
            return 'bg-[#e4efff] text-[#414754]';
    }
};

export function AnomaliesTable({ data = defaultData, onRowClick }: AnomaliesTableProps) {
    const [filters, setFilters] = useState({
        type: 'all',
        severity: 'all',
        category: 'all',
    });

    return (
        <div className="bg-white rounded-xl shadow-[0px_12px_32px_rgba(11,29,45,0.04)] overflow-hidden">
            {/* Header with Filters */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f7f9ff]">
                <h3 className="text-lg font-bold text-[#0b1d2d]">
                    Registro Operativo de Anomalías
                </h3>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.type}
                        onChange={(e) =>
                            setFilters({ ...filters, type: e.target.value })
                        }
                        className="
                            bg-white
                            border
                            border-[#c1c6d7]
                            text-xs
                            font-semibold
                            rounded-lg
                            px-4
                            py-2
                            text-[#0b1d2d]
                            focus:ring-[#0059bb]
                            focus:border-[#0059bb]
                            transition-all
                        "
                    >
                        <option value="all">Tipo de Anomalía</option>
                        <option value="multivariate">Multivariado</option>
                        <option value="geographic">Geográfico</option>
                        <option value="premier">Primeriza</option>
                    </select>

                    <select
                        value={filters.severity}
                        onChange={(e) =>
                            setFilters({ ...filters, severity: e.target.value })
                        }
                        className="
                            bg-white
                            border
                            border-[#c1c6d7]
                            text-xs
                            font-semibold
                            rounded-lg
                            px-4
                            py-2
                            text-[#0b1d2d]
                            focus:ring-[#0059bb]
                            focus:border-[#0059bb]
                            transition-all
                        "
                    >
                        <option value="all">Severidad</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                    </select>

                    <select
                        value={filters.category}
                        onChange={(e) =>
                            setFilters({ ...filters, category: e.target.value })
                        }
                        className="
                            bg-white
                            border
                            border-[#c1c6d7]
                            text-xs
                            font-semibold
                            rounded-lg
                            px-4
                            py-2
                            text-[#0b1d2d]
                            focus:ring-[#0059bb]
                            focus:border-[#0059bb]
                            transition-all
                        "
                    >
                        <option value="all">Categoría</option>
                        <option value="urgent">Urgente</option>
                        <option value="followup">Seguimiento</option>
                    </select>

                    <button
                        className="
                            bg-[#0059bb]
                            text-white
                            text-xs
                            font-bold
                            px-4
                            py-2
                            rounded-lg
                            flex
                            items-center
                            gap-2
                            hover:bg-[#0070ea]
                            transition-colors
                            shadow-sm
                        "
                    >
                        <span className="material-symbols-outlined text-sm">
                            filter_list
                        </span>
                        Más Filtros
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f7f9ff] text-[#414754] text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Evento</th>
                            <th className="px-6 py-4">Municipio</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4">Severidad</th>
                            <th className="px-6 py-4">Acción</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#e4efff]">
                        {data.map((anomaly) => (
                            <tr
                                key={anomaly.id}
                                onClick={() => onRowClick?.(anomaly.id)}
                                className="
                                    hover:bg-[#f7f9ff]
                                    cursor-pointer
                                    transition-colors
                                    group
                                "
                            >
                                <td className="px-6 py-4 text-xs font-bold text-[#0059bb]">
                                    {anomaly.id}
                                </td>
                                <td className="px-6 py-4 text-xs text-[#414754]">
                                    {anomaly.date}
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-[#0b1d2d]">
                                    {anomaly.event}
                                </td>
                                <td className="px-6 py-4 text-xs text-[#414754]">
                                    {anomaly.municipality}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold bg-[#e8f4f8] text-[#006a80] px-2 py-1 rounded">
                                        {anomaly.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-black text-[#0b1d2d]">
                                        {anomaly.score}
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
                                            ${getSeverityBadgeColor(anomaly.severity)}
                                        `}
                                    >
                                        {anomaly.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="material-symbols-outlined text-[#717786] group-hover:text-[#0059bb] transition-colors">
                                        chevron_right
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#e4efff] flex items-center justify-between">
                <p className="text-[10px] text-[#414754] font-semibold uppercase tracking-widest">
                    Mostrando 10 de 1,248 resultados
                </p>
                <div className="flex gap-2">
                    <button
                        className="
                            p-2
                            border
                            border-[#e4efff]
                            rounded-lg
                            hover:bg-[#f7f9ff]
                            transition-colors
                        "
                    >
                        <span className="material-symbols-outlined text-sm">
                            chevron_left
                        </span>
                    </button>
                    <button
                        className="
                            p-2
                            border
                            border-[#e4efff]
                            rounded-lg
                            hover:bg-[#f7f9ff]
                            transition-colors
                        "
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
