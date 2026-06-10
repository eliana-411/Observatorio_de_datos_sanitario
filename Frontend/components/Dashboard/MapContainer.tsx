'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DistribucionGeograficaData } from '@/lib/api/analytics';
import { Municipio } from '@/hooks/useMunicipios';

interface FiltrosParams {
    anio?: number;
    genero?: string;
    edad?: string;
    municipio?: string;
    hospitalizado?: string;
    metodo?: string;
}

interface MapContainerProps {
    distribucionGeograficaData?: DistribucionGeograficaData[];
    municipiosCoordenadas?: Map<string, Municipio>;
    filtros?: FiltrosParams;
}

export function MapContainer({
    distribucionGeograficaData = [],
    municipiosCoordenadas,
    filtros
}: MapContainerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.CircleMarker[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);

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

    // Update markers when data changes
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;
        console.log('MapContainer - Datos recibidos:', distribucionGeograficaData);

        // Limpiar marcadores anteriores
        markersRef.current.forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = [];

        // Si no hay datos, no hacer nada
        if (!distribucionGeograficaData || distribucionGeograficaData.length === 0) {
            console.log('MapContainer - Sin datos para mostrar');
            return;
        }

        // Calcular el máximo de casos para normalizar colores
        let maxCasos = 0;
        distribucionGeograficaData.forEach((municipio) => {
            maxCasos = Math.max(maxCasos, municipio.totalCasos);
        });
        console.log('MapContainer - Max casos:', maxCasos, 'Total municipios:', distribucionGeograficaData.length);

        // Función para obtener color según densidad
        const getColorByDensity = (casos: number, max: number) => {
            if (max === 0) return { fill: '#3B82F6', stroke: '#1E40AF' };

            const porcentaje = casos / max;

            if (porcentaje >= 0.66) {
                return { fill: '#DC2626', stroke: '#991B1B' };
            } else if (porcentaje >= 0.33) {
                return { fill: '#F59E0B', stroke: '#D97706' };
            } else {
                return { fill: '#3B82F6', stroke: '#1E40AF' };
            }
        };

        // Agregar nuevos marcadores
        // Crear bounds para centrar el mapa en todos los municipios
        const bounds = L.latLngBounds([]);
        let municipiosConCoordenadas = 0;

        // Agregar nuevos marcadores
        distribucionGeograficaData.forEach((municipio) => {
            // Validar explícitamente que no sean null/undefined, no usar truthy
            if (municipio.latitud !== null && municipio.latitud !== undefined &&
                municipio.longitud !== null && municipio.longitud !== undefined) {

                const colors = getColorByDensity(municipio.totalCasos, maxCasos);
                const radius = Math.max(10, Math.sqrt(municipio.totalCasos) * 1.5);

                // Transformar coordenadas - ajustar escala inconsistente
                const lat = municipio.latitud > 1000
                    ? municipio.latitud / 100000  // Latitud en centimicrogrados
                    : municipio.latitud;           // Ya en grados

                const lng = municipio.longitud < -1000 || municipio.longitud > 1000
                    ? municipio.longitud / 1000000 // Longitud en microgrados
                    : municipio.longitud;          // Ya en grados

                const marker = L.circleMarker([lat, lng], {
                    radius: radius,
                    fillColor: colors.fill,
                    color: colors.stroke,
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.75
                })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-size: 13px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            <div style="background: linear-gradient(135deg, ${colors.fill} 0%, ${colors.stroke} 100%); color: white; padding: 12px; border-radius: 6px 6px 0 0; margin: -12px -12px 8px -12px;">
                                <strong style="font-size: 16px; display: block; margin-bottom: 4px;">${municipio.nombreMunicipio}</strong>
                                <span style="font-size: 11px; opacity: 0.9;">Código: ${municipio.codigoMunicipio}</span>
                            </div>
                            
                            <div style="padding: 0 0 12px 0;">
                                <div style="margin-bottom: 10px;">
                                    <div>
                                        <div style="margin-bottom: 4px;"><strong>Total de Casos:</strong> <span style="color: ${colors.fill}; font-weight: bold;">${municipio.totalCasos}</span></div>
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 10px;">
                                    <div ">
                                        <div style="margin-bottom: 4px;">
                                            <strong>Hospitalizados:</strong> ${municipio.hospitalizados} 
                                            <span style="background: #D1FAE5; color: #065F46; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${municipio.tasaHospitalizacion.toFixed(2)}%</span>
                                        </div>
                                        <div style="margin-bottom: 4px;">
                                            <strong>No Hospitalizados:</strong> ${municipio.noHospitalizados} 
                                            <span style="background: #E0E7FF; color: #312E81; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${municipio.tasaNoHospitalizacion.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);

                markersRef.current.push(marker);
                bounds.extend([lat, lng]);
                municipiosConCoordenadas++;
            } else {
                console.warn(`Municipio sin coordenadas válidas: ${municipio.nombreMunicipio}`);
            }
        });

        // Ajustar el mapa para mostrar todos los marcadores
        if (municipiosConCoordenadas > 0 && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
            console.log(`MapContainer - ${municipiosConCoordenadas} municipios mostrados en el mapa`);
        } else {
            console.warn('No hay municipios con coordenadas válidas para mostrar');
        }
    }, [distribucionGeograficaData]);

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

    const handleDownloadExcel = async () => {
        setIsDownloading(true);
        try {
            const queryParams = new URLSearchParams();

            if (filtros?.anio !== undefined && filtros.anio !== null) {
                queryParams.append('anio', String(filtros.anio));
            }
            if (filtros?.genero) {
                queryParams.append('genero', filtros.genero);
            }
            if (filtros?.edad) {
                queryParams.append('rangoEdad', filtros.edad);
            }
            if (filtros?.municipio) {
                queryParams.append('municipio', filtros.municipio);
            }
            if (filtros?.hospitalizado) {
                queryParams.append('hospitalizado', filtros.hospitalizado);
            }
            if (filtros?.metodo) {
                queryParams.append('metodo', filtros.metodo);
            }

            const url = `https://localhost:7083/api/Analytics/distribucion-geografica/excel?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // Obtener el blob y descargar
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `distribucion-geografica-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error descargando Excel:', error);
            alert('Error al descargar el archivo');
        } finally {
            setIsDownloading(false);
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
                    <button
                        onClick={handleDownloadExcel}
                        disabled={isDownloading}
                        className="bg-surface-container p-2 rounded-lg hover:bg-surface-container-high transition-colors duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Descargar en Excel"
                        aria-label="Descargar datos en Excel"
                    >
                        <span className="material-symbols-outlined text-sm" data-icon="download">
                            {isDownloading ? 'downloading' : 'download'}
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