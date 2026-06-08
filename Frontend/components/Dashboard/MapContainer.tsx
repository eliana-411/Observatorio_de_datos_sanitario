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
    municipiosGrupoEtarioData?: Array<{
        codigoMunicipio: string;
        municipio: string;
        totalEventos: number;
        gruposEtarios: Array<{ grupoEtario: string; total: number }>;
    }>;
    municipiosCoordenadas?: Map<string, Municipio>;
}

export function MapContainer({
    municipiosData = [],
    municipiosGrupoEtarioData = [],
    municipiosCoordenadas
}: MapContainerProps) {
    const { selectedGenero, selectedGrupoEtario } = useFilterStore();
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

    // Update markers when selectedGenero, selectedGrupoEtario or data changes
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;

        // Determinar cuál dataset usar
        const usarGrupoEtario = selectedGrupoEtario !== 'todos';
        const dataActual = usarGrupoEtario ? municipiosGrupoEtarioData : municipiosData;
        const filtroActual = usarGrupoEtario ? selectedGrupoEtario : selectedGenero;

        console.log('MapContainer updating markers. usarGrupoEtario:', usarGrupoEtario, 'filtro:', filtroActual, 'data:', dataActual.length);

        // Limpiar marcadores anteriores
        markersRef.current.forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = [];

        // Calcular el máximo de eventos para normalizar colores
        let maxEventos = 0;
        dataActual.forEach((municipio: any) => {
            let datosFilterados: any[] = [];

            if (usarGrupoEtario) {
                datosFilterados = (municipio.gruposEtarios || []);
                if (filtroActual !== 'todos') {
                    datosFilterados = datosFilterados.filter(
                        g => g.grupoEtario?.toLowerCase() === filtroActual.toLowerCase()
                    );
                }
            } else {
                datosFilterados = (municipio.generos || []);
                if (filtroActual !== 'Género: Todos') {
                    datosFilterados = datosFilterados.filter(
                        g => g.genero?.toLowerCase() === filtroActual.replace('Género: ', '').toLowerCase()
                    );
                }
            }

            if (datosFilterados.length > 0) {
                const total = datosFilterados.reduce((sum, d) => sum + d.total, 0);
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

        // Agregar nuevos marcadores con el filtro seleccionado
        dataActual.forEach((municipio: any) => {
            const coordenada = municipiosCoordenadas?.get(municipio.codigoMunicipio);
            if (coordenada) {
                // Filtrar datos según la selección
                let datosFilterados: any[] = [];
                let labelFiltro = '';

                if (usarGrupoEtario) {
                    datosFilterados = (municipio.gruposEtarios || []);
                    if (filtroActual !== 'todos') {
                        datosFilterados = datosFilterados.filter(
                            g => g.grupoEtario?.toLowerCase() === filtroActual.toLowerCase()
                        );
                    }
                    labelFiltro = filtroActual === 'todos' ? 'Todos los grupos etarios' : filtroActual;
                } else {
                    datosFilterados = (municipio.generos || []);
                    if (filtroActual !== 'Género: Todos') {
                        datosFilterados = datosFilterados.filter(
                            g => g.genero?.toLowerCase() === filtroActual.replace('Género: ', '').toLowerCase()
                        );
                    }
                    labelFiltro = filtroActual;
                }

                // Solo mostrar marcador si hay datos después del filtro
                if (datosFilterados.length > 0) {
                    const totalEventosFiltrados = datosFilterados.reduce((sum, d) => sum + d.total, 0);

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
                                    ${labelFiltro}: ${totalEventosFiltrados} casos
                                </span>
                            </div>
                        `);

                    markersRef.current.push(marker);
                }
            }
        });
    }, [selectedGenero, selectedGrupoEtario, municipiosData, municipiosGrupoEtarioData, municipiosCoordenadas]);


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
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col h-full md:h-160">
            <div className="p-2 md:p-2 border-b border-surface-container flex justify-between items-start md:items-center bg-white/50 backdrop-blur-md gap-4 flex-col md:flex-row">
                <div className="flex-1">
                    <h3 className=" pl-3 text-lg font-semibold text-gray-800 text-on-surface tracking-tight dark:text-[#0b1d2d]">
                        Mapa de Calor de Prevalencia Geográfica
                    </h3>
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