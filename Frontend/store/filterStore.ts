import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FilterStore {
    // State
    selectedGenero: string;
    selectedGrupoEtario: string;
    selectedAnio: number | null;

    // Actions
    setSelectedGenero: (genero: string) => void;
    setSelectedGrupoEtario: (grupoEtario: string) => void;
    setSelectedAnio: (anio: number | null) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>()(
    persist(
        (set) => ({
            // Initial state
            selectedGenero: 'Género: Todos',
            selectedGrupoEtario: 'todos',
            selectedAnio: null, // null significa "todos" los años

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
            resetFilters: () => set({
                selectedGenero: 'Género: Todos',
                selectedGrupoEtario: 'todos',
                selectedAnio: null
            }),
        }),
        {
            name: 'filter-store',
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
);