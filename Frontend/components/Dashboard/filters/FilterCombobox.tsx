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
    hasScroll = false
}: FilterComboboxProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    disabled={loading}
                    className="
                        flex items-center gap-2
                        bg-white
                        px-4 py-3
                        rounded-lg
                        flex-1
                        hover:shadow-md
                        transition-shadow
                        text-left
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >
                    <span className="material-symbols-outlined text-[#2e77c9] text-xl">
                        {icon}
                    </span>

                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-500">
                            {label}
                        </span>

                        <span className="text-sm font-semibold text-gray-700 truncate">
                            {loading
                                ? "Cargando..."
                                : options.find((opt) => opt.value === value)?.label || label}
                        </span>
                    </div>

                    <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="p-0 w-(--radix-popover-trigger-width)"
                align="start"
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
