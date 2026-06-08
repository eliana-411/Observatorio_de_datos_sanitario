'use client';

import React, { useEffect } from 'react';
import { X, Share2, Printer } from 'lucide-react';

interface AnomalyDetail {
    id: string;
    type: string;
    score: number;
    description: string;
    category: string;
    date: string;
    age: number;
    stratum: number;
    yearMonth: string;
    previousHospitalization: boolean;
    medicalHistory: string;
    sameLocation: boolean;
    substanceAbuse: boolean;
}

interface AnomalyDetailDrawerProps {
    anomaly: AnomalyDetail | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AnomalyDetailDrawer({
    anomaly,
    isOpen,
    onClose,
}: AnomalyDetailDrawerProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!anomaly) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`
                    fixed
                    inset-0
                    bg-[#0b1d2d]/40
                    backdrop-blur-sm
                    z-60
                    transition-opacity
                    duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`
                    fixed
                    top-0
                    right-0
                    h-screen
                    w-full
                    max-w-lg
                    bg-white
                    shadow-2xl
                    z-70
                    transition-transform
                    duration-500
                    ease-in-out
                    flex
                    flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="p-6 bg-[#f7f9ff] flex items-center justify-between border-b border-[#e4efff]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="
                                p-2
                                hover:bg-[#e4efff]
                                rounded-full
                                transition-colors
                            "
                        >
                            <X className="w-5 h-5 text-[#0b1d2d]" />
                        </button>

                        <div>
                            <h2 className="text-xl font-black text-[#0b1d2d]">
                                ID: {anomaly.id}
                            </h2>
                            <span className="bg-[#ffebee] text-[#c62828] text-[10px] font-bold px-3 py-1 rounded-full inline-block mt-2">
                                Severidad Alta
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="p-2 text-[#0059bb] hover:bg-[#0059bb]/5 rounded-full transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-[#0059bb] hover:bg-[#0059bb]/5 rounded-full transition-colors">
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Information Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#0059bb] text-xl">
                                info
                            </span>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#414754]">
                                Información de la Anomalía
                            </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                    Tipo
                                </p>
                                <p className="text-sm font-semibold text-[#0b1d2d]">
                                    {anomaly.type}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                    Score IA
                                </p>
                                <p className="text-sm font-black text-[#0059bb]">
                                    {anomaly.score} / 1.0
                                </p>
                            </div>

                            <div className="col-span-2">
                                <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                    Descripción
                                </p>
                                <p className="text-sm text-[#414754] leading-relaxed">
                                    {anomaly.description}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                    Categoría
                                </p>
                                <p className="text-sm font-semibold text-[#0b1d2d]">
                                    {anomaly.category}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                    Fecha Registro
                                </p>
                                <p className="text-sm font-semibold text-[#0b1d2d]">
                                    {anomaly.date}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Personal & Context */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#0059bb] text-xl">
                                person
                            </span>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#414754]">
                                Personal & Context
                            </h4>
                        </div>

                        <div className="grid grid-cols-3 gap-6 bg-[#f7f9ff] p-4 rounded-xl">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-[#414754] uppercase">
                                    Edad
                                </p>
                                <p className="text-lg font-black text-[#0b1d2d]">
                                    {anomaly.age}
                                </p>
                            </div>

                            <div className="text-center">
                                <p className="text-[10px] font-bold text-[#414754] uppercase">
                                    Estrato
                                </p>
                                <p className="text-lg font-black text-[#0b1d2d]">
                                    {anomaly.stratum}
                                </p>
                            </div>

                            <div className="text-center">
                                <p className="text-[10px] font-bold text-[#414754] uppercase">
                                    Año/Mes
                                </p>
                                <p className="text-sm font-black text-[#0b1d2d]">
                                    {anomaly.yearMonth}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Associated Factors */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#0059bb] text-xl">
                                list_alt
                            </span>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#414754]">
                                Factores Asociados
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#c1c6d7]">
                                <span className="text-xs font-semibold text-[#0b1d2d]">
                                    Hospitalización Previa
                                </span>
                                <span
                                    className={`
                                        text-[10px]
                                        font-bold
                                        px-2
                                        py-0.5
                                        rounded
                                        uppercase
                                        ${anomaly.previousHospitalization
                                            ? 'text-[#c62828] bg-[#ffebee]'
                                            : 'text-[#414754] bg-[#e4efff]'
                                        }
                                    `}
                                >
                                    {anomaly.previousHospitalization ? 'Sí' : 'No'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#c1c6d7]">
                                <span className="text-xs font-semibold text-[#0b1d2d]">
                                    Historial de Antecedentes
                                </span>
                                <span className="text-[10px] font-bold text-[#414754] bg-[#e4efff] px-2 py-0.5 rounded uppercase">
                                    {anomaly.medicalHistory}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#c1c6d7]">
                                <span className="text-xs font-semibold text-[#0b1d2d]">
                                    Mismo Municipio de Ocurrencia
                                </span>
                                <span
                                    className={`
                                        text-[10px]
                                        font-bold
                                        px-2
                                        py-0.5
                                        rounded
                                        uppercase
                                        ${anomaly.sameLocation
                                            ? 'text-[#00695c] bg-[#c8e6c9]'
                                            : 'text-[#414754] bg-[#e4efff]'
                                        }
                                    `}
                                >
                                    {anomaly.sameLocation ? 'Confirmado' : 'No'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#c1c6d7]">
                                <span className="text-xs font-semibold text-[#0b1d2d]">
                                    Abuso de Sustancias
                                </span>
                                <span
                                    className={`
                                        text-[10px]
                                        font-bold
                                        px-2
                                        py-0.5
                                        rounded
                                        uppercase
                                        ${anomaly.substanceAbuse
                                            ? 'text-[#c62828] bg-[#ffebee]'
                                            : 'text-[#414754] bg-[#e4efff]'
                                        }
                                    `}
                                >
                                    {anomaly.substanceAbuse ? 'Positivo' : 'Negativo'}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#e4efff] bg-[#f7f9ff]">
                    <button
                        className="
                            w-full
                            bg-[#0059bb]
                            text-white
                            py-4
                            rounded-xl
                            font-bold
                            tracking-tight
                            active:scale-95
                            transition-all
                            shadow-lg
                            flex
                            items-center
                            justify-center
                            gap-2
                            hover:bg-[#0070ea]
                        "
                    >
                        <span className="material-symbols-outlined text-sm">
                            assignment_turned_in
                        </span>
                        Asignar Protocolo de Intervención
                    </button>
                </div>
            </div>
        </>
    );
}
