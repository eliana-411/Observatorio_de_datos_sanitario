'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
    value: string;
    label: string;
}

interface ComparatorComboboxProps {
    value: string;
    options: Option[];
    label: string;
    onChange: (value: string) => void;
    loading?: boolean;
    placeholder?: string;
}

export function ComparatorCombobox({
    value,
    options,
    label,
    onChange,
    loading = false,
    placeholder = "Buscar..."
}: ComparatorComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // Filtrar opciones basado en búsqueda
    const filteredOptions = React.useMemo(() => {
        if (!search) return options;
        const searchLower = search.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchLower)
        );
    }, [options, search]);

    const selectedLabel = options.find(opt => opt.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    ref={buttonRef}
                    role="combobox"
                    aria-expanded={open}
                    disabled={loading}
                    className={cn(
                        "w-full flex items-center gap-2",
                        "bg-white",
                        "px-3 py-2",
                        "rounded-lg",
                        "border border-[#d0d8e8]",
                        "hover:border-[#0059bb]",
                        "hover:shadow-sm",
                        "transition-all",
                        "text-left",
                        "disabled:opacity-50",
                        "disabled:cursor-not-allowed",
                        "overflow-hidden"
                    )}
                >
                    <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-xs font-medium text-gray-500 truncate">
                            {label}
                        </span>
                        <span className="text-sm font-semibold text-[#0b1d2d] truncate">
                            {loading ? "Cargando..." : selectedLabel || placeholder}
                        </span>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0"
                align="start"
                side="bottom"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={placeholder}
                        value={search}
                        onValueChange={setSearch}
                        className="text-sm"
                    />
                    <CommandList>
                        <CommandEmpty>
                            {search ? 'No se encontraron municipios' : 'Sin opciones'}
                        </CommandEmpty>
                        <ScrollArea className="h-65">
                            <CommandGroup>
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue === value ? '' : currentValue);
                                            setOpen(false);
                                            setSearch('');
                                        }}
                                        className="cursor-pointer text-sm"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
