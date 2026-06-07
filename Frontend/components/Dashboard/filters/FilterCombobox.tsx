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
import { FilterComboboxProps } from './types';

export function FilterCombobox({
    value,
    options,
    label,
    icon,
    onChange,
    loading = false,
    placeholder = "Buscar...",
    showSearch = true,
    hasScroll = false,
    minWidth = "w-44"
}: FilterComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [buttonWidth, setButtonWidth] = React.useState<string | undefined>();

    React.useEffect(() => {
        if (buttonRef.current) {
            setButtonWidth(buttonRef.current.offsetWidth + 'px');
        }
    }, []);

    // Convertir minWidth tailwind a píxeles si es necesario
    const getPixelWidth = (width: string): string => {
        if (width.includes('[')) {
            return width.match(/\d+/)?.[0] + 'px' || '160px';
        }
        // Conversión de clases tailwind a píxeles
        const tailwindMap: { [key: string]: number } = {
            'w-44': 176, 'w-48': 192, 'w-52': 208, 'w-56': 224, 'w-60': 240,
            'w-70': 280, 'w-96': 384, 'w-130': 520
        };
        return (tailwindMap[width] ? tailwindMap[width] + 'px' : '160px');
    };

    const buttonWidthPx = getPixelWidth(minWidth);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    ref={buttonRef}
                    role="combobox"
                    aria-expanded={open}
                    disabled={loading}
                    className={cn(
                        "flex items-center gap-2",
                        "bg-white",
                        "px-4 py-3",
                        "rounded-lg",
                        "hover:shadow-md",
                        "transition-shadow",
                        "text-left",
                        "disabled:opacity-50",
                        "disabled:cursor-not-allowed",
                        "overflow-hidden"
                    )}
                    style={{
                        width: buttonWidthPx,
                        flexShrink: 0
                    }}
                >
                    <span className="material-symbols-outlined text-[#2e77c9] text-xl flex-shrink-0">
                        {icon}
                    </span>

                    <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-xs font-medium text-gray-500 truncate">
                            {label}
                        </span>

                        <span className="text-sm font-semibold text-gray-700 truncate">
                            {loading
                                ? "Cargando..."
                                : options.find((opt) => opt.value === value)?.label || label}
                        </span>
                    </div>

                    <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="p-0"
                align="start"
                style={{ width: buttonWidthPx }}
            >
                <Command>
                    {showSearch && <CommandInput placeholder={placeholder} />}
                    <CommandList>
                        <CommandEmpty>
                            {loading ? "Cargando opciones..." : "No se encontraron opciones."}
                        </CommandEmpty>

                        {hasScroll ? (
                            <ScrollArea className="h-65">
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label}
                                            onSelect={() => {
                                                onChange(option.value);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </ScrollArea>
                        ) : (
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
