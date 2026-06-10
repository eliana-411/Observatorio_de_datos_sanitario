'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';

interface Municipality {
    name: string;
    coordinates: [number, number];
    alertLevel: 'alto' | 'medio' | 'bajo';
    prediction: number;
}

const municipalities: Municipality[] = [
    { name: 'Manizales', coordinates: [5.0685, -75.5034], alertLevel: 'alto', prediction: 48 },
    { name: 'La Dorada', coordinates: [5.3025, -75.2544], alertLevel: 'medio', prediction: 18 },
    { name: 'Chinchiná', coordinates: [4.9747, -75.3314], alertLevel: 'alto', prediction: 14 },
    { name: 'Riosucio', coordinates: [5.3853, -75.7483], alertLevel: 'bajo', prediction: 11 },
    { name: 'Villamaría', coordinates: [4.8914, -75.4903], alertLevel: 'medio', prediction: 9 },
];

const alertColors = {
    alto: '#ffb4ab',
    medio: '#ffb77e',
    bajo: '#a7c8ff',
};

export function RiskMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize Leaflet map
        if (!map.current) {
            map.current = L.map(mapContainer.current).setView([5.2, -75.5], 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map.current);
        }

        // Add municipality markers
        municipalities.forEach((municipality) => {
            const color = alertColors[municipality.alertLevel];
            const circleMarker = L.circleMarker(municipality.coordinates, {
                radius: 12,
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
            }).addTo(map.current!);

            // Add popup
            circleMarker.bindPopup(`
                <div class="p-2 text-sm">
                    <div class="font-bold text-[#0b1d2d]">${municipality.name}</div>
                    <div class="flex justify-between gap-4 text-[#666] mt-1">
                        <span>Predicción:</span>
                        <span class="font-mono font-bold">${municipality.prediction} casos</span>
                    </div>
                    <div class="flex justify-between gap-4 text-[#ffb4ab] mt-1">
                        <span>Alerta:</span>
                        <span class="font-mono font-bold uppercase">${municipality.alertLevel}</span>
                    </div>
                </div>
            `);
        });

        return () => {
            // Cleanup on unmount
        };
    }, []);

    return (
        <Card className="p-6 bg-white border dark:bg-[#1a2b3b] border-[#e4efff] relative overflow-hidden h-105">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-[#8d919b] uppercase tracking-widest">
                    Mapa de Riesgo Regional
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alertColors.alto }}></div>
                        <span className="text-xs text-[#666]">Alto</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alertColors.medio }}></div>
                        <span className="text-xs text-[#666]">Medio</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alertColors.bajo }}></div>
                        <span className="text-xs text-[#666]">Bajo</span>
                    </div>
                </div>
            </div>
            <div ref={mapContainer} className="w-full h-87.5 rounded border border-[#e4efff]" />
        </Card>
    );
}
