'use client';

import { useState, useEffect } from 'react';

interface AlertResponse {
    total_en_alerta: number;
    nivel_maximo: string;
    municipios: Array<{
        municipio: string;
        casos_predichos: number;
        nivel_alerta: string;
    }>;
    ultima_actualizacion: string;
}

interface AlertBannerProps {
    onScrollToCard?: () => void;
}

export function AlertBanner({ onScrollToCard }: AlertBannerProps) {
    const [alertData, setAlertData] = useState<AlertResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('No hay token de autenticación');
                    setLoading(false);
                    return;
                }

                const response = await fetch('https://localhost:7083/api/Brotes/alertas-criticas', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: AlertResponse = await response.json();
                setAlertData(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al obtener alertas');
                console.error('Error fetching alerts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        // Actualizar cada 5 minutos
        const interval = setInterval(fetchAlerts, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // No mostrar si no hay datos
    if (!alertData || alertData.total_en_alerta === 0) {
        return null;
    }

    const handleAlertClick = () => {
        if (onScrollToCard) {
            onScrollToCard();
        }
    };

    return (
        <div
            className="bg-[#93000a] dark:bg-[#93000a] text-white p-3 rounded-lg flex items-center justify-between border border-[#e74c3c]/20 animate-pulse cursor-pointer hover:bg-[#b8000d] transition-colors duration-200"
            onClick={handleAlertClick}
        >
            <div className="flex items-center gap-2">
                <span
                    className="material-symbols-outlined text-lg shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    warning
                </span>
                <span className="font-semibold text-xs uppercase tracking-wide">
                    Alerta: {alertData.total_en_alerta} Municipio{alertData.total_en_alerta !== 1 ? 's' : ''} con Tendencia Alta
                </span>
            </div>
        </div>
    );
}
