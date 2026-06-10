'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ComparatorCombobox } from './filters';
import { fetchDistribucionMunicipal } from '@/lib/api/analytics';

interface Municipio {
    value: string;
    label: string;
}

interface MunicipalComparatorProps {
    municipiosCoordenadas?: Map<string, any>;
    municipiosData?: Array<any>;
}

interface MunicipalDatosState {
    [key: number]: any;
}

export function MunicipalComparator({ municipiosCoordenadas, municipiosData }: MunicipalComparatorProps) {
    const [municipios, setMunicipios] = React.useState<Municipio[]>([]);
    const [numComparadores, setNumComparadores] = React.useState(1);
    const [selectedMunicipios, setSelectedMunicipios] = React.useState<string[]>(['']);
    const [loading, setLoading] = React.useState(true);
    const [csvContent, setCsvContent] = React.useState<string | null>(null);
    const [municipioDatos, setMunicipioDatos] = React.useState<MunicipalDatosState>({});
    const [loadingIndices, setLoadingIndices] = React.useState<Set<number>>(new Set());

    // Efecto para cargar datos cuando cambia un municipio seleccionado
    React.useEffect(() => {
        selectedMunicipios.forEach((municipio, index) => {
            if (municipio && !municipioDatos[index]) {
                setLoadingIndices(prev => new Set(prev).add(index));

                // Buscar el nombre del municipio por su value
                const municipioLabel = municipios.find(m => m.value === municipio)?.label;

                if (municipioLabel) {
                    (async () => {
                        try {
                            const response = await fetchDistribucionMunicipal(municipioLabel);

                            if (response.data) {
                                setMunicipioDatos(prev => ({
                                    ...prev,
                                    [index]: response.data
                                }));
                            } else {
                                console.error(`Error al cargar datos: ${response.error?.message}`);
                            }
                        } catch (error) {
                            console.error(`Error cargando datos para municipio en índice ${index}:`, error);
                        } finally {
                            setLoadingIndices(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(index);
                                return newSet;
                            });
                        }
                    })();
                }
            }
        });
    }, [selectedMunicipios, municipios, municipioDatos]);

    // Cargar municipios desde CSV al montar
    React.useEffect(() => {
        const loadMunicipios = async () => {
            try {
                const response = await fetch('/data/municipios-divipola.csv');
                const csvContent = await response.text();
                setCsvContent(csvContent);
            } catch (error) {
                console.error('Error cargando municipios:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMunicipios();
    }, []);

    // Parsear CSV
    const parseMunicipiosFromCSV = React.useCallback((csvContent: string): Municipio[] => {
        const lines = csvContent.trim().split('\n');
        const municipios: Municipio[] = [];
        const seen = new Set<string>();

        // Ignorar la primera línea (encabezados)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            const matches = line.match(/"([^"]*)"/g);
            if (matches && matches.length >= 4) {
                const nombreMunicipio = matches[3].replace(/"/g, '').trim();
                const valueKey = nombreMunicipio.toLowerCase().replace(/\s+/g, '_');

                if (!seen.has(valueKey)) {
                    seen.add(valueKey);
                    municipios.push({
                        value: valueKey,
                        label: nombreMunicipio.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
                    });
                }
            }
        }

        return municipios.sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    // Usar useMemo para cachear el parsing
    const municipiosParsed = React.useMemo(() => {
        if (!csvContent) return [];
        return parseMunicipiosFromCSV(csvContent);
    }, [csvContent, parseMunicipiosFromCSV]);

    React.useEffect(() => {
        if (csvContent) {
            setMunicipios(municipiosParsed);
        }
    }, [municipiosParsed, csvContent]);

    // Manejar cambio en cantidad de comparadores
    const handleNumComparadoresChange = (num: number) => {
        setNumComparadores(num);
        setSelectedMunicipios(Array(num).fill(''));
    };

    // Manejar selección de municipio
    const handleSelectMunicipio = (index: number, value: string) => {
        const newSelected = [...selectedMunicipios];
        newSelected[index] = value;
        setSelectedMunicipios(newSelected);

        // Limpiar datos del municipio anterior si se está cambiando
        if (!value) {
            setMunicipioDatos(prev => {
                const newDatos = { ...prev };
                delete newDatos[index];
                return newDatos;
            });
        }
    };

    // Obtener información del municipio
    const getMunicipioInfo = (municipioValue: string) => {
        const data = municipiosData?.find(m => m.codigoMunicipio === municipioValue || m.municipio?.toLowerCase() === municipioValue?.replace(/_/g, ' '));
        const coords = municipiosCoordenadas?.get(municipioValue);
        const label = municipios.find(m => m.value === municipioValue)?.label;

        return { data, coords, label };
    };

    // Componente principal con diseño moderno y responsive
    const MunicipalInfoCard = ({ data }: { data: any }) => {
        if (!data) return null;

        const nombreMunicipio = data?.nombreMunicipio ?? 'Municipio';
        const codigoMunicipio = data?.codigoMunicipio ?? 'N/A';
        const totalCasos = data?.totalCasos ?? 0;
        const hospitalizados = data?.hospitalizados ?? 0;
        const noHospitalizados = data?.noHospitalizados ?? 0;
        const tasaHospitalizacion = typeof data?.tasaHospitalizacion === 'number' ? data.tasaHospitalizacion : 0;
        const tasaNoHospitalizacion = typeof data?.tasaNoHospitalizacion === 'number' ? data.tasaNoHospitalizacion : 0;
        const distribucionGenero = Array.isArray(data?.distribucionGenero) ? data.distribucionGenero : [];
        const distribucionGrupoEtario = Array.isArray(data?.distribucionGrupoEtario) ? data.distribucionGrupoEtario : [];
        const topMetodos = Array.isArray(data?.topMetodos) ? data.topMetodos : [];

        return (
            <div className="space-y-3">
                {/* Casos */}
                <Card className="p-4 bg-white border border-[#e4efff] rounded-lg">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-[#0059bb]">{totalCasos}</div>
                        <p className="text-xs text-[#4a5568] mt-1">Casos registrados</p>
                    </div>
                </Card>

                {/* Hospitalización */}
                <Card className="p-3 bg-white border border-[#e4efff] rounded-lg">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[#0b1d2d]">Hospitalizados</span>
                            <span className="text-[#0059bb] font-bold">{hospitalizados} | {tasaHospitalizacion.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[#0b1d2d]">No hospitalizados</span>
                            <span className="text-[#00a651] font-bold">{noHospitalizados} | {tasaNoHospitalizacion.toFixed(1)}%</span>
                        </div>
                    </div>
                </Card>

                {/* Género */}
                {distribucionGenero.length > 0 && (
                    <Card className="p-3 bg-white border border-[#e4efff] rounded-lg">
                        <div className="space-y-2">
                            <h5 className="text-sm font-bold text-[#0b1d2d]">Distribución por género</h5>
                            <div className="space-y-1">
                                {distribucionGenero.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="text-[#4a5568]">{item?.nombre ?? 'Desconocido'}</span>
                                        <span className="font-semibold text-[#0059bb]">{item?.cantidad ?? 0} ({(typeof item?.porcentaje === 'number' ? item.porcentaje : 0).toFixed(1)}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Grupo Etario */}
                {distribucionGrupoEtario.length > 0 && (
                    <Card className="p-3 bg-white border border-[#e4efff] rounded-lg">
                        <div className="space-y-2">
                            <h5 className="text-sm font-bold text-[#0b1d2d]">Grupo etario</h5>
                            <div className="space-y-1">
                                {distribucionGrupoEtario.map((grupo: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="text-[#4a5568]">{grupo?.nombre ?? 'Desconocido'}</span>
                                        <span className="font-semibold text-[#00a651]">{grupo?.cantidad ?? 0} ({(typeof grupo?.porcentaje === 'number' ? grupo.porcentaje : 0).toFixed(1)}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Top Métodos */}
                {topMetodos.length > 0 && (
                    <Card className="p-3 bg-white border border-[#e4efff] rounded-lg">
                        <div className="space-y-2">
                            <h5 className="text-sm font-bold text-[#0b1d2d]">Métodos principales</h5>
                            <div className="space-y-1">
                                {topMetodos.slice(0, 3).map((metodo: any, i: number) => {
                                    return (
                                        <div key={i} className="flex justify-between items-start text-xs gap-2">
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[#4a5568] line-clamp-2">
                                                    {metodo?.nombre ?? 'Desconocido'}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-[#d63031] shrink-0">
                                                {metodo?.cantidad ?? 0} ({(typeof metodo?.porcentaje === 'number' ? metodo.porcentaje : 0).toFixed(1)}%)
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <div className="mt-6">
            <Card className="p-5 bg-white border border-[#e4efff] h-85 flex flex-col" style={{ minHeight: '455px' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-[#0b1d2d]">Comparador municipal</h2>
                    <div className="flex items-center gap-3">
                        <label htmlFor="numComparadores" className="text-sm font-medium text-[#0b1d2d]">
                            Municipios a comparar:
                        </label>
                        <select
                            id="numComparadores"
                            value={numComparadores}
                            onChange={(e) => handleNumComparadoresChange(Number(e.target.value))}
                            className="px-3 py-2 rounded-lg border border-[#d0d8e8] bg-white text-sm font-medium text-[#0b1d2d] hover:border-[#0059bb] focus:outline-none focus:ring-2 focus:ring-[#0059bb] focus:ring-offset-1"
                        >
                            {[1, 2, 3, 4].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Contenedor con scroll externo */}
                <div className="flex-1 overflow-y-auto">
                    {/* Grid de comparadores */}
                    <div className={`grid gap-4 ${numComparadores === 1 ? 'grid-cols-1' :
                        numComparadores === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                            numComparadores === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        }`}>
                        {Array.from({ length: numComparadores }).map((_, index) => {
                            const selectedMunicipio = selectedMunicipios[index];
                            const { label } = getMunicipioInfo(selectedMunicipio);
                            const isLoading = loadingIndices.has(index);

                            return (
                                <div key={index} className="space-y-3 ">
                                    {/* Dropdown */}
                                    <ComparatorCombobox
                                        value={selectedMunicipio}
                                        options={municipios}
                                        label={`Municipio ${index + 1}`}
                                        onChange={(value: string) => handleSelectMunicipio(index, value)}
                                        loading={loading}
                                        placeholder="Seleccionar..."
                                    />

                                    {/* Tarjetitas con información */}
                                    {selectedMunicipio && label && (
                                        <div className="space-y-3">
                                            {isLoading ? (
                                                <Card className="p-6 bg-white border border-[#e4efff] flex items-center justify-center min-h-75">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-8 h-8 border-4 border-[#e4efff] border-t-[#0059bb] rounded-full animate-spin"></div>
                                                        <span className="text-sm text-[#4a5568]">Cargando datos...</span>
                                                    </div>
                                                </Card>
                                            ) : municipioDatos[index] ? (
                                                <MunicipalInfoCard data={municipioDatos[index]} />
                                            ) : (
                                                <Card className="p-4 bg-[#f7f9ff] border border-[#d0d8e8] text-center text-sm text-[#4a5568]">
                                                    Selecciona un municipio para ver los datos
                                                </Card>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
}
