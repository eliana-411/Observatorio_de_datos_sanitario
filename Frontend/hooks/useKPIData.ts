import { useMemo } from 'react';
import { DistribucionGeograficaData, ResumenMunicipalData } from '@/lib/api/analytics';

export interface KPIDataState {
    totalCasosReportados: string;
    tasaHospitalizacion: string;
    municipioMayorIncidencia: string;
    indiceSeveridad: string;
    loading: boolean;
}

/**
 * Hook que calcula dinámicamente los KPIs basados en los datos de distribución geográfica,
 * resumen municipal y el filtro de municipio seleccionado
 */
export function useKPIData(
    distribucionGeograficaData: DistribucionGeograficaData[],
    totalGlobal: number | null,
    resumenMunicipalData: ResumenMunicipalData[],
    selectedMunicipio: string,
    loading: boolean
): KPIDataState {
    return useMemo(() => {
        if (loading || !distribucionGeograficaData || distribucionGeograficaData.length === 0 || !resumenMunicipalData || resumenMunicipalData.length === 0) {
            return {
                totalCasosReportados: '-',
                tasaHospitalizacion: '-',
                municipioMayorIncidencia: '-',
                indiceSeveridad: '-',
                loading: true,
            };
        }

        // 1. Total de Casos Reportados - del totalGlobal del endpoint
        const totalCasosReportados = totalGlobal !== null ? totalGlobal : 0;

        // 3. Municipio con Mayor Incidencia - del PRIMER municipio en resumen-municipal
        const municipioMayorIncidencia = resumenMunicipalData[0]?.nombreMunicipio || '-';

        // 2. Tasa de Hospitalización
        let tasaHospitalizacionValue = 0;
        if (selectedMunicipio === 'todos' || selectedMunicipio === 'Todos') {
            // Cuando es "todos", tomar la tasa del municipio con MAYOR incidencia (primer elemento)
            tasaHospitalizacionValue = resumenMunicipalData[0]?.tasaHospitalizacion ?? 0;
        } else {
            // Buscar el municipio específico en resumen municipal
            const municipioEncontrado = resumenMunicipalData.find(
                m => m.nombreMunicipio.toLowerCase() === selectedMunicipio.toLowerCase()
            );
            tasaHospitalizacionValue = municipioEncontrado?.tasaHospitalizacion ?? 0;
        }

        // 4. Índice de Severidad
        // Fórmula: (tasaHospitalizacion × 0.7) + (reincidencia × 0.3)
        // Como no hay tasaReincidencia en los datos, usamos solo tasaHospitalizacion
        // Escalado a 10 puntos
        const indiceSeveridad = (tasaHospitalizacionValue * 0.1); // escalar de 0-100 a 0-10

        return {
            totalCasosReportados: new Intl.NumberFormat('es-AR').format(totalCasosReportados),
            tasaHospitalizacion: `${tasaHospitalizacionValue.toFixed(1)}%`,
            municipioMayorIncidencia,
            indiceSeveridad: `${indiceSeveridad.toFixed(1)}/10`,
            loading: false,
        };
    }, [distribucionGeograficaData, totalGlobal, resumenMunicipalData, selectedMunicipio, loading]);
}
