'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function MapContainer() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

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
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

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