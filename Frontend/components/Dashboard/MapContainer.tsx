'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export function MapContainer() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Coordenadas de Caldas, Colombia (Manizales)
        const caldaCoords: [number, number] = [5.0733, -75.5148];

        // Crear mapa
        const map = L.map(mapRef.current).setView(caldaCoords, 9);

        // Añadir tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Marcador en Manizales
        L.marker(caldaCoords).addTo(map)
            .bindPopup('Manizales, Caldas')
            .openPopup();

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col h-150">
            <div className="p-6 border-b border-surface-container flex justify-between items-center bg-white/50 backdrop-blur-md">
                <div>
                    <h2 className="text-lg font-black text-on-surface tracking-tight dark:text-[#0b1d2d]">
                        Mapa de Calor de Prevalencia Geográfica
                    </h2>
                    <p className="text-xs text-on-surface-variant font-medium dark:text-[#6b7079]">
                        Clústeres regionales de casos de Dengue detectados en tiempo real
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="zoom_in">
                            zoom_in
                        </span>
                    </button>
                    <button className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="layers">
                            layers
                        </span>
                    </button>
                </div>
            </div>

            <div ref={mapRef} className="flex-1 relative bg-gray-50" style={{ minHeight: '400px' }} />
        </div>
    );
}