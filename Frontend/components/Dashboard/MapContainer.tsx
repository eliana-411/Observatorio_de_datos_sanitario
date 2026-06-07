'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFilterStore } from '@/store/filterStore';

interface Municipio {
    codigoMunicipio: string;
    nombreMunicipio: string;
    latitud: number;
    longitud: number;
}

interface MapContainerProps {
    municipiosData?: Array<{
        codigoMunicipio: string;
        municipio: string;
        totalEventos: number;
        generos: Array<{ genero: string; total: number }>;
    }>;
    municipiosCoordenadas?: Map<string, Municipio>;
}

export function MapContainer({ municipiosData = [], municipiosCoordenadas }: MapContainerProps) {
    const { selectedGenero } = useFilterStore();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.CircleMarker[]>([]);

    // Initialize map on mount
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Coordenadas de Caldas, Colombia (Manizales)
        const caldaCoords: [number, number] = [5.0733, -75.5148];

        // Crear mapa con opciones optimizadas
        const map = L.map(mapRef.current, {
            zoom: 9,
            center: caldaCoords,
            zoomControl: true,
            scrollWheelZoom: true,
            touchZoom: true,
            dragging: true,
            preferCanvas: true,
        });

        // Establecer vista inicial
        map.setView(caldaCoords, 9);

        // Añadir tile layer (OpenStreetMap) con atributos optimizados
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 2,
            tms: false,
        }).addTo(map);

        // Inicializar iconos de Leaflet (evita problemas de renderizado)
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Marcador en Manizales
        L.marker(caldaCoords, {
            title: 'Manizales, Caldas',
            alt: 'Centro de análisis regional',
        }).addTo(map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    className: 'custom-popup',
                }).setContent(
                    `<div style="padding: 8px;">
                        <strong style="font-size: 14px; display: block; margin-bottom: 4px;">Manizales</strong>
                        <span style="font-size: 12px; color: #666;">Caldas, Colombia</span>
                    </div>`
                )
            )
            .openPopup();

        // Forzar recalcular tamaño del mapa después de montaje
        requestAnimationFrame(() => {
            if (mapInstanceRef.current && mapRef.current) {
                mapInstanceRef.current.invalidateSize(false);
            }
        });

        mapInstanceRef.current = map;

        // Manejar redimensionamiento de ventana
        const handleResize = () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers when selectedGenero or municipiosData changes
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;
        console.log('MapContainer updating markers. selectedGenero:', selectedGenero, 'municipiosData:', municipiosData.length);

        // Limpiar marcadores anteriores
        markersRef.current.forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = [];

        // Calcular el máximo de eventos para normalizar colores
        let maxEventos = 0;
        municipiosData.forEach(municipio => {
            let generosFilterados = municipio.generos || [];
            if (selectedGenero !== 'Género: Todos') {
                generosFilterados = generosFilterados.filter(
                    g => g.genero?.toLowerCase() === selectedGenero.replace('Género: ', '').toLowerCase()
                );
            }
            if (generosFilterados.length > 0) {
                const total = generosFilterados.reduce((sum, g) => sum + g.total, 0);
                maxEventos = Math.max(maxEventos, total);
            }
        });

        console.log('Max eventos:', maxEventos);

        // Función para obtener color según densidad
        const getColorByDensity = (eventos: number, max: number) => {
            if (max === 0) return { fill: '#3B82F6', stroke: '#1E40AF' };
            
            const porcentaje = eventos / max; // 0 a 1
            
            // Rojo (alto) -> Amarillo (medio) -> Azul (bajo)
            if (porcentaje >= 0.66) {
                // Rojo (alto riesgo)
                return { fill: '#DC2626', stroke: '#991B1B' };
            } else if (porcentaje >= 0.33) {
                // Amarillo/Naranja (riesgo medio)
                return { fill: '#F59E0B', stroke: '#D97706' };
            } else {
                // Azul (bajo riesgo)
                return { fill: '#3B82F6', stroke: '#1E40AF' };
            }
        };

        // Agregar nuevos marcadores con el filtro de género
        municipiosData.forEach(municipio => {
            const coordenada = municipiosCoordenadas?.get(municipio.codigoMunicipio);
            if (coordenada) {
                // Filtrar géneros según la selección
                let generosFilterados = municipio.generos || [];
                if (selectedGenero !== 'Género: Todos') {
                    generosFilterados = generosFilterados.filter(
                        g => g.genero?.toLowerCase() === selectedGenero.replace('Género: ', '').toLowerCase()
                    );
                }

                // Solo mostrar marcador si hay datos después del filtro
                if (generosFilterados.length > 0) {
                    const totalEventosFiltrados = generosFilterados.reduce((sum, g) => sum + g.total, 0);
                    
                    // Obtener colores según densidad
                    const colors = getColorByDensity(totalEventosFiltrados, maxEventos);

                    // Radio más grande y basado en densidad
                    const radius = Math.max(10, Math.sqrt(totalEventosFiltrados) * 1.5);

                    const marker = L.circleMarker([coordenada.latitud, coordenada.longitud], {
                        radius: radius,
                        fillColor: colors.fill,
                        color: colors.stroke,
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.75
                    })
                        .addTo(map)
                        .bindPopup(`
                            <div style="font-size: 14px;">
                                <strong>${municipio.municipio}</strong><br>
                                <span style="color: ${colors.fill}; font-weight: bold;">
                                    ${selectedGenero}: ${totalEventosFiltrados} casos
                                </span>
                            </div>
                        `);

                    markersRef.current.push(marker);
                }
            }
        });
    }, [selectedGenero, municipiosData, municipiosCoordenadas]);

    const handleZoomIn = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomOut();
        }
    };

    const handleFitBounds = () => {
        if (mapInstanceRef.current) {
            // Volver a la vista inicial
            mapInstanceRef.current.setView([5.0733, -75.5148], 9);
        }
    };

    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col h-full md:h-150">
            <div className="p-4 md:p-6 border-b border-surface-container flex justify-between items-start md:items-center bg-white/50 backdrop-blur-md gap-4 flex-col md:flex-row">
                <div className="flex-1">
                    <h2 className="text-lg font-black text-on-surface tracking-tight dark:text-[#0b1d2d]">
                        Mapa de Calor de Prevalencia Geográfica
                    </h2>
                    <p className="text-xs text-on-surface-variant font-medium dark:text-[#6b7079] mt-1">
                        Clústeres regionales de casos de Dengue detectados en tiempo real
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    <button
                        onClick={handleZoomIn}
                        className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors duration-200 active:scale-95"
                        title="Zoom in"
                        aria-label="Aumentar zoom"
                    >
                        <span className="material-symbols-outlined text-sm" data-icon="zoom_in">
                            zoom_in
                        </span>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors duration-200 active:scale-95"
                        title="Zoom out"
                        aria-label="Reducir zoom"
                    >
                        <span className="material-symbols-outlined text-sm" data-icon="zoom_out">
                            zoom_out
                        </span>
                    </button>
                    <button
                        onClick={handleFitBounds}
                        className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors duration-200 active:scale-95"
                        title="Center map"
                        aria-label="Centrar mapa"
                    >
                        <span className="material-symbols-outlined text-sm" data-icon="map">
                            map
                        </span>
                    </button>
                </div>
            </div>

            <div
                ref={mapRef}
                className="flex-1 relative bg-gray-50 w-full"
                style={{
                    minHeight: '300px',
                    height: '100%',
                }}
            />
        </div>
    );
}