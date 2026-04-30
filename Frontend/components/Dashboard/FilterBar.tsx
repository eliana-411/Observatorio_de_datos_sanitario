'use client';

import { useRef } from 'react';

export function FilterBar() {
    const municipioRef = useRef<HTMLSelectElement>(null);
    const edadRef = useRef<HTMLSelectElement>(null);
    const generoRef = useRef<HTMLSelectElement>(null);
    const enfermedadRef = useRef<HTMLSelectElement>(null);

    const handleIconClick = (selectRef: React.RefObject<HTMLSelectElement | null>) => {
        if (selectRef.current) {
            selectRef.current.focus();
            // Usar showPicker() para navegadores modernos, sino hacer click
            const select = selectRef.current as HTMLSelectElement & { showPicker?: () => void };
            if (select.showPicker) {
                select.showPicker();
            } else {
                select.click();
            }
        }
    };

    return (
        <section className="bg-surface-container bg-[#e4efff] rounded-xl p-4 flex gap-4 items-center shadow-sm">
            {/* Municipios */}
            <div
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg flex-1 min-w-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleIconClick(municipioRef)}
            >
                <span
                    className="material-symbols-outlined text-[#2e77c9] text-xl"
                >
                    location_on
                </span>
                <select
                    ref={municipioRef}
                    className="flex-1 appearance-none bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option>Todos los Municipios</option>
                    <option>Distrito Central</option>
                    <option>Llanos Orientales</option>
                    <option>Región Costera</option>
                </select>
                <span
                    className="material-symbols-outlined text-gray-500 text-xl"
                >
                    expand_more
                </span>
            </div>

            {/* Rango de Edad */}
            <div
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg flex-1 min-w-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleIconClick(edadRef)}
            >
                <span
                    className="material-symbols-outlined text-[#2e77c9] text-xl"
                >
                    person
                </span>
                <select
                    ref={edadRef}
                    className="flex-1 appearance-none bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option>Rango de Edad: Todos</option>
                    <option>0-12 Pediatría</option>
                    <option>13-64 Adultos</option>
                    <option>65+ Geriatría</option>
                </select>
                <span
                    className="material-symbols-outlined text-gray-500 text-xl"
                >
                    expand_more
                </span>
            </div>

            {/* Género */}
            <div
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg flex-1 min-w-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleIconClick(generoRef)}
            >
                <span
                    className="material-symbols-outlined text-[#2e77c9] text-xl"
                >
                    diversity_3
                </span>
                <select
                    ref={generoRef}
                    className="flex-1 appearance-none bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option>Género: Todos</option>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>Otro</option>
                </select>
                <span
                    className="material-symbols-outlined text-gray-500 text-xl"
                >
                    expand_more
                </span>
            </div>

            {/* Enfermedad */}
            <div
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg flex-1 min-w-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleIconClick(enfermedadRef)}
            >
                <span
                    className="material-symbols-outlined text-[#2e77c9] text-xl"
                >
                    coronavirus
                </span>
                <select
                    ref={enfermedadRef}
                    className="flex-1 appearance-none bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option>Enfermedad: Dengue</option>
                    <option>Malaria</option>
                    <option>Influenza A</option>
                    <option>Virus Zika</option>
                </select>
                <span
                    className="material-symbols-outlined text-gray-500 text-xl"
                >
                    expand_more
                </span>
            </div>

            <button className="ml-auto flex items-center gap-2 text-[#2e77c9] font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-sm" data-icon="filter_list">
                    filter_list
                </span>
                Filtros Avanzados
            </button>
        </section>
    );
}
