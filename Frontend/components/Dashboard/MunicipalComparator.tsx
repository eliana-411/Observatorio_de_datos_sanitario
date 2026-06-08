'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ComparatorCombobox } from './filters';

interface Municipio {
    value: string;
    label: string;
}

interface MunicipalComparatorProps {
    municipiosCoordenadas?: Map<string, any>;
    municipiosData?: Array<any>;
}

export function MunicipalComparator({ municipiosCoordenadas, municipiosData }: MunicipalComparatorProps) {
    const [municipios, setMunicipios] = React.useState<Municipio[]>([]);
    const [numComparadores, setNumComparadores] = React.useState(1);
    const [selectedMunicipios, setSelectedMunicipios] = React.useState<string[]>(['']);
    const [loading, setLoading] = React.useState(true);
    const [csvContent, setCsvContent] = React.useState<string | null>(null);

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
    };

    // Obtener información del municipio
    const getMunicipioInfo = (municipioValue: string) => {
        const data = municipiosData?.find(m => m.codigoMunicipio === municipioValue || m.municipio?.toLowerCase() === municipioValue?.replace(/_/g, ' '));
        const coords = municipiosCoordenadas?.get(municipioValue);
        const label = municipios.find(m => m.value === municipioValue)?.label;

        return { data, coords, label };
    };

    return (
        <div className="mt-6">
            <Card className="p-6 bg-white border border-[#e4efff]">
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
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid de comparadores */}
                <div className={`grid gap-6 ${numComparadores === 1 ? 'grid-cols-1' :
                    numComparadores === 2 ? 'grid-cols-2' :
                        numComparadores === 3 ? 'grid-cols-3' :
                            numComparadores === 4 ? 'grid-cols-4' :
                                'grid-cols-5'
                    }`}>
                    {Array.from({ length: numComparadores }).map((_, index) => {
                        const selectedMunicipio = selectedMunicipios[index];
                        const { label, data } = getMunicipioInfo(selectedMunicipio);

                        return (
                            <div key={index} className="space-y-4 min-h-62.5">
                                {/* Dropdown */}
                                <ComparatorCombobox
                                    value={selectedMunicipio}
                                    options={municipios}
                                    label={`Municipio ${index + 1}`}
                                    onChange={(value: string) => handleSelectMunicipio(index, value)}
                                    loading={loading}
                                    placeholder="Seleccionar..."
                                />

                                {/* Tarjetita con información */}
                                {selectedMunicipio && label && (
                                    <Card className="p-4 bg-[#f7f9ff] border border-[#d0d8e8]">
                                        <h4 className="text-sm font-bold text-[#0b1d2d] mb-2">{label}</h4>
                                        <div className="space-y-2 text-xs text-[#4a5568]">
                                            <div className="flex justify-between">
                                                <span>Total eventos:</span>
                                                <span className="font-semibold text-[#0059bb]">
                                                    {data?.totalEventos || 0}
                                                </span>
                                            </div>
                                            {data?.generos?.length > 0 && (
                                                <div>
                                                    <span className="font-medium">Géneros:</span>
                                                    <div className="mt-1 space-y-1">
                                                        {data.generos.map((g: any, i: number) => (
                                                            <div key={i} className="flex justify-between ml-2">
                                                                <span>{g.genero}:</span>
                                                                <span>{g.total}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
