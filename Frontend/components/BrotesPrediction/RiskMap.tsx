'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { useBrotesTodos, BrotesPredictionData } from '@/hooks/useBrotesTodos';
import { obtenerCoordenadasPorNombre } from '@/lib/utils/municipios';

interface MunicipalityWithPrediction extends BrotesPredictionData {
    coordinates?: [number, number];
    alertLevel: 'alto' | 'medio' | 'bajo';
    color: string;
    size: number;
}

const colorPalette = {
    alto: {
        fill: '#dc2626',
        stroke: '#991b1b',
        hex: '#dc2626',
    },
    medio: {
        fill: '#f97316',
        stroke: '#ea580c',
        hex: '#f97316',
    },
    bajo: {
        fill: '#3b82f6',
        stroke: '#1e40af',
        hex: '#3b82f6',
    },
};

/**
 * Mapea el nivel_alerta del endpoint a los niveles internos
 */
function mapAlertLevel(
    nivelAlerta: string
): 'alto' | 'medio' | 'bajo' {
    const nivel = nivelAlerta?.toLowerCase().trim() || 'normal';

    if (nivel === 'alto' || nivel === 'critical') return 'alto';
    if (nivel === 'moderado' || nivel === 'moderate') return 'medio';
    return 'bajo'; // normal, low, etc.
}

/**
 * Formatea texto para el tooltip - similar al del dashboard
 */
function formatTooltipText(data: MunicipalityWithPrediction): string {
    const colors = colorPalette[data.alertLevel];

    return `
        <div style="font-size: 13px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: linear-gradient(135deg, ${colors.fill} 0%, ${colors.stroke} 100%); color: white; padding: 12px; border-radius: 6px 6px 0 0; margin: -12px -12px 8px -12px;">
                <strong style="font-size: 16px; display: block; margin-bottom: 4px;">${data.municipio}</strong>
                <span style="font-size: 11px; opacity: 0.9;">Mes: ${data.mes} | Año: ${data.anio}</span>
            </div>
            
            <div style="padding: 12px;">
                <div style="margin-bottom: 10px;">
                    <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #666; font-size: 13px;"><strong>Casos Predichos:</strong></span>
                        <span style="color: ${colors.fill}; font-weight: bold; font-size: 14px;">${data.casos_predichos}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #666; font-size: 13px;"><strong>Media Histórica:</strong></span>
                        <span style="font-weight: bold; font-size: 14px;">${data.media_historica.toFixed(1)}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 0; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #666; font-size: 13px;"><strong>Nivel de Alerta:</strong></span>
                        <span style="display: inline-block; padding: 4px 10px; background: ${colors.fill}; color: white; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase;">${data.nivel_alerta}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function RiskMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const markersRef = useRef<L.CircleMarker[]>([]);
    const [municipalities, setMunicipalities] = useState<MunicipalityWithPrediction[]>([]);
    const [loadingCoords, setLoadingCoords] = useState(false);

    const { data: brotesTodos, loading: loadingData, error: errorData } = useBrotesTodos();

    // Cargar coordenadas de municipios
    useEffect(() => {
        if (brotesTodos.length === 0) return;

        const loadCoordinates = async () => {
            setLoadingCoords(true);
            try {
                const municipiosConCoordenadas: MunicipalityWithPrediction[] = [];

                for (const brotesData of brotesTodos) {
                    const coords = await obtenerCoordenadasPorNombre(brotesData.municipio);

                    if (coords.latitud !== null && coords.longitud !== null) {
                        const alertLevel = mapAlertLevel(brotesData.nivel_alerta);

                        municipiosConCoordenadas.push({
                            ...brotesData,
                            coordinates: [coords.latitud, coords.longitud],
                            alertLevel,
                            color: colorPalette[alertLevel].fill,
                            size: 14, // Tamaño fijo
                        });
                    } else {
                        console.warn(`No se encontraron coordenadas para: ${brotesData.municipio}`);
                    }
                }

                setMunicipalities(municipiosConCoordenadas);
            } catch (err) {
                console.error('Error loading coordinates:', err);
            } finally {
                setLoadingCoords(false);
            }
        };

        loadCoordinates();
    }, [brotesTodos]);

    // Renderizar mapa
    useEffect(() => {
        if (!mapContainer.current) return;

        // Inicializar mapa
        if (!map.current) {
            map.current = L.map(mapContainer.current).setView([5.2, -75.5], 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map.current);
        }

        // Limpiar marcadores anteriores
        markersRef.current.forEach((marker) => {
            map.current?.removeLayer(marker);
        });
        markersRef.current = [];

        if (municipalities.length === 0) return;

        // Crear bounds para centrar el mapa
        const bounds = L.latLngBounds([]);
        let municipiosValidos = 0;

        // Agregar nuevos marcadores
        municipalities.forEach((municipality) => {
            if (!municipality.coordinates) return;

            const [lat, lng] = municipality.coordinates;
            const colors = colorPalette[municipality.alertLevel];

            const circleMarker = L.circleMarker([lat, lng], {
                radius: municipality.size,
                fillColor: colors.fill,
                color: colors.stroke,
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
            }).addTo(map.current!);

            // Agregar popup con HTML formateado
            const popupContent = L.popup({
                maxWidth: 320,
                className: 'brotes-popup',
            }).setContent(formatTooltipText(municipality));

            circleMarker.bindPopup(popupContent);

            // Agregar tooltip en hover
            circleMarker.bindTooltip(`${municipality.municipio}: ${municipality.casos_predichos} casos`, {
                permanent: false,
                direction: 'top',
                className: 'brotes-tooltip',
            });

            markersRef.current.push(circleMarker);
            bounds.extend([lat, lng]);
            municipiosValidos++;
        });

        // Ajustar vista del mapa
        if (municipiosValidos > 0 && bounds.isValid()) {
            map.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [municipalities]);

    return (
        <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff] relative overflow-hidden h-105">
            <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest mb-1">
                        Mapa de Riesgo Regional
                    </h3>
                    {loadingData || loadingCoords ? (
                        <p className="text-xs text-[#999]">Cargando datos...</p>
                    ) : errorData ? (
                        <p className="text-xs text-red-500">{errorData}</p>
                    ) : (
                        <p className="text-xs text-[#999]">
                            {municipalities.length} municipios monitoreados
                        </p>
                    )}
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colorPalette.alto.fill }}
                        ></div>
                        <span className="text-xs text-[#666]">Alto</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colorPalette.medio.fill }}
                        ></div>
                        <span className="text-xs text-[#666]">Moderado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colorPalette.bajo.fill }}
                        ></div>
                        <span className="text-xs text-[#666]">Normal</span>
                    </div>
                </div>
            </div>
            <div ref={mapContainer} className="w-full h-87.5 rounded border border-[#e4efff]" />
        </Card>
    );
}


