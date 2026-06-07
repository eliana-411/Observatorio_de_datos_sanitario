// Tipos compartidos para los filtros
export interface FilterOption {
    value: string;
    label: string;
}

export interface Municipio extends FilterOption { }

export interface FilterComboboxProps {
    value: string;
    options: FilterOption[];
    label: string;
    icon: string;
    onChange: (value: string) => void;
    loading?: boolean;
    placeholder?: string;
    showSearch?: boolean;
    hasScroll?: boolean;
    minWidth?: string; // e.g., "w-40", "w-48", "w-56"
    popoverMinWidth?: string; // e.g., "480px", "500px" - min-width del PopoverContent
}
