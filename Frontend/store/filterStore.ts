import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PerfilHistorico {
    media_historica: number;
    std_historica: number;
    umbral_alerta: number;
    tasa_hospitalizacion_media: number;
    mes_critico: number;
    tendencia_reciente: string;
    genero_predominante: string;
    grupo_etario_predominante: string;
    metodo_predominante: string;
    antecedentes_mental_promedio: number;
    consumo_sustancias_promedio: number;
}

export interface FilterStore {
    // State
    selectedGenero: string;
    selectedGrupoEtario: string;
    selectedAnio: number | null;
    selectedMunicipio: string;
    perfilHistorico: PerfilHistorico | null;

    // Actions
    setSelectedGenero: (genero: string) => void;
    setSelectedGrupoEtario: (grupoEtario: string) => void;
    setSelectedAnio: (anio: number | null) => void;
    setSelectedMunicipio: (municipio: string) => void;
    setPerfilHistorico: (perfil: PerfilHistorico | null) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>()(
    persist(
        (set) => ({
            // Initial state
            selectedGenero: 'Género: Todos',
            selectedGrupoEtario: 'todos',
            selectedAnio: null, // null significa "todos" los años
            selectedMunicipio: 'todos', // 'todos' o nombre del municipio específico
            perfilHistorico: null,

            // Actions
            setSelectedGenero: (genero: string) => {
                console.log('Setting selectedGenero to:', genero);
                set({ selectedGenero: genero });
            },
            setSelectedGrupoEtario: (grupoEtario: string) => {
                console.log('Setting selectedGrupoEtario to:', grupoEtario);
                set({ selectedGrupoEtario: grupoEtario });
            },
            setSelectedAnio: (anio: number | null) => {
                console.log('Setting selectedAnio to:', anio);
                set({ selectedAnio: anio });
            },
            setSelectedMunicipio: (municipio: string) => {
                console.log('Setting selectedMunicipio to:', municipio);
                set({ selectedMunicipio: municipio });
            },
            setPerfilHistorico: (perfil: PerfilHistorico | null) => {
                set({ perfilHistorico: perfil });
            },
            resetFilters: () => set({
                selectedGenero: 'Género: Todos',
                selectedGrupoEtario: 'todos',
                selectedAnio: null,
                selectedMunicipio: 'todos',
                perfilHistorico: null
            }),
        }),
        {
            name: 'filter-store',
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
);