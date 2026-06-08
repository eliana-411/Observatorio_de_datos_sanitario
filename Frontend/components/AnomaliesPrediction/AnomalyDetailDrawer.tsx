'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Share2, Printer, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';

interface AnomaliaDetalleCompletoDto {
    status: string;
    idRegistro: number;
    tipoAnomalia: string;
    descripcion: string;
    severidad: string;
    categoria: string;
    anomalyScore: number;
    datosCompletos: Record<string, any>;
}

interface AnomalyDetailDrawerProps {
    anomalyId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onPrefetch?: (id: number) => void;
}

// Cache global para datos de anomalías
const anomalyCache = new Map<number, { data: AnomaliaDetalleCompletoDto; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Skeleton loader component
const SkeletonLoader = () => (
    <div className="space-y-6">
        <div className="h-4 bg-[#e4efff] rounded animate-pulse"></div>
        <div className="space-y-3">
            <div className="h-3 bg-[#e4efff] rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-[#e4efff] rounded animate-pulse w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="h-12 bg-[#e4efff] rounded animate-pulse"></div>
            <div className="h-12 bg-[#e4efff] rounded animate-pulse"></div>
        </div>
    </div>
);

function AnomalyDetailDrawer({
    anomalyId,
    isOpen,
    onClose,
    onPrefetch,
}: AnomalyDetailDrawerProps) {
    const [anomaly, setAnomaly] = useState<AnomaliaDetalleCompletoDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchAbortRef = useRef<AbortController | null>(null);

    const getSeverityColor = useCallback((severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'alta':
                return { bg: 'bg-[#ffebee]', text: 'text-[#c62828]' };
            case 'media':
                return { bg: 'bg-[#fff3e0]', text: 'text-[#e65100]' };
            default:
                return { bg: 'bg-[#e4efff]', text: 'text-[#414754]' };
        }
    }, []);

    const formatLabel = useCallback((key: string): string => {
        // Reemplazos específicos
        const replacements: Record<string, string> = {
            anio: 'año',
            requirio: 'requirió',
            requirio_hospitalizacion: 'requirió hospitalización',
            hospitalizacion: 'hospitalización',
            lugar_ocurrencia: 'lugar de ocurrencia',
            municipio_evento: 'municipio evento',
            mismo_lugar: 'mismo lugar',
            consume_sustancias_flag: 'abuso de sustancias',
            antecedentes_medicos: 'antecedentes médicos',
            edad: 'edad (años)',
        };

        let formatted = key.toLowerCase().replace(/_/g, ' ');

        // Aplicar reemplazos específicos si existen
        Object.entries(replacements).forEach(([oldKey, newVal]) => {
            if (key.toLowerCase() === oldKey) {
                formatted = newVal;
            }
        });

        // Capitalizar primera letra de cada palabra
        return formatted
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, []);

    const formatValue = useCallback((value: any): string => {
        if (typeof value === 'boolean') {
            return value ? 'Sí' : 'No';
        }
        // Detectar strings "true" o "false" (en cualquier caso)
        if (typeof value === 'string') {
            const lowerValue = value.toLowerCase().trim();
            if (lowerValue === 'true') return 'Sí';
            if (lowerValue === 'false') return 'No';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }, []);

    // Verificar si datos están en caché y válidos
    const getCachedData = useCallback((id: number) => {
        const cached = anomalyCache.get(id);
        if (cached) {
            const age = Date.now() - cached.timestamp;
            if (age < CACHE_DURATION) {
                return cached.data;
            } else {
                anomalyCache.delete(id);
            }
        }
        return null;
    }, []);

    // Guardar datos en caché
    const setCachedData = useCallback((id: number, data: AnomaliaDetalleCompletoDto) => {
        anomalyCache.set(id, { data, timestamp: Date.now() });
    }, []);

    useEffect(() => {
        if (!isOpen || !anomalyId) {
            setAnomaly(null);
            setError(null);
            // Cancelar fetch anterior si existe
            if (fetchAbortRef.current) {
                fetchAbortRef.current.abort();
            }
            return;
        }

        // Intentar obtener del caché primero
        const cachedData = getCachedData(anomalyId);
        if (cachedData) {
            setAnomaly(cachedData);
            setError(null);
            setLoading(false);
            return;
        }

        const fetchAnomalyDetail = async () => {
            try {
                // Cancelar fetch anterior si existe
                if (fetchAbortRef.current) {
                    fetchAbortRef.current.abort();
                }

                fetchAbortRef.current = new AbortController();
                setLoading(true);
                setError(null);

                const response = await api.get<AnomaliaDetalleCompletoDto>(
                    `/anomalias/detalle/${anomalyId}`
                );

                if (response.data) {
                    setCachedData(anomalyId, response.data);
                    setAnomaly(response.data);
                } else if (response.error) {
                    setError(response.error.message || 'Error al cargar los detalles');
                }
            } catch (err) {
                if ((err as any)?.name !== 'AbortError') {
                    console.error('Error fetching anomaly detail:', err);
                    setError('Error al cargar los detalles de la anomalía');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalyDetail();

        return () => {
            if (fetchAbortRef.current) {
                fetchAbortRef.current.abort();
            }
        };
    }, [isOpen, anomalyId, getCachedData, setCachedData]);

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            {/* @ts-ignore - DialogContent accessibility warning */}
            <DrawerContent className="h-screen w-full max-w-4xl right-0 left-auto rounded-none border-l border-[#e4efff]" style={{ maxWidth: '500px' }}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 text-[#0059bb] animate-spin" />
                            <p className="text-sm text-[#414754]">Cargando detalles...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4 text-center px-6">
                            <p className="text-sm font-semibold text-red-600">Error</p>
                            <p className="text-sm text-[#414754]">{error}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-[#0059bb] text-white rounded-lg hover:bg-[#0070ea] transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : anomaly ? (
                    <>
                        {/* Header */}
                        <DrawerHeader className="bg-[#f7f9ff] border-b border-[#e4efff] px-6 py-4">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <DrawerClose className="p-2 hover:bg-[#e4efff] rounded-full transition-colors">
                                        <X className="w-5 h-5 text-[#0b1d2d]" />
                                    </DrawerClose>

                                    <div>
                                        <h2 className="text-xl font-black text-[#0b1d2d]">
                                            ID: AN-{anomaly.idRegistro}
                                        </h2>
                                        <span
                                            className={`
                                                text-[10px] font-bold px-3 py-1 rounded-full inline-block mt-2
                                                ${getSeverityColor(anomaly.severidad).bg}
                                                ${getSeverityColor(anomaly.severidad).text}
                                            `}
                                        >
                                            Severidad {anomaly.severidad}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DrawerHeader>

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
                                            {anomaly.tipoAnomalia}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                            Score Anomalía
                                        </p>
                                        <p className="text-sm font-black text-[#0059bb]">
                                            {anomaly.anomalyScore.toFixed(3)} / 1.0
                                        </p>
                                    </div>

                                    <div className="col-span-2">
                                        <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                            Descripción
                                        </p>
                                        <p className="text-sm text-[#414754] leading-relaxed">
                                            {anomaly.descripcion}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                            Categoría
                                        </p>
                                        <p className="text-sm font-semibold text-[#0b1d2d]">
                                            {anomaly.categoria}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-[#414754] uppercase font-bold tracking-wider mb-1">
                                            Severidad
                                        </p>
                                        <p className="text-sm font-semibold text-[#0b1d2d]">
                                            {anomaly.severidad}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Datos Completos Section */}
                            {Object.keys(anomaly.datosCompletos).length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-[#0059bb] text-xl">
                                            description
                                        </span>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#414754]">
                                            Datos Adicionales
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.entries(anomaly.datosCompletos).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-start justify-between p-2 bg-white rounded-lg border border-[#c1c6d7]"
                                            >
                                                <span className="text-xs font-semibold text-[#0b1d2d]">
                                                    {formatLabel(key)}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#414754] bg-[#e4efff] px-2 py-0.5 rounded max-w-xs text-right">
                                                    {formatValue(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </>
                ) : null}
            </DrawerContent>
        </Drawer>
    );
}

export { AnomalyDetailDrawer };