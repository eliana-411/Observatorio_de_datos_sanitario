'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
    { id: 'paneles', icon: 'dashboard', label: 'Paneles', href: '/dashboard' },
    { id: 'brotes', icon: 'warning', label: 'Predicción de Brotes', href: '/brotes' },
    { id: 'ai-assistant', icon: 'psychiatry', label: 'Asistente IA', href: '/ai-assistant' },
    { id: 'analytics', icon: 'query_stats', label: 'Análisis Predictivo', href: '/analytics' },
    { id: 'maps', icon: 'map', label: 'Mapas de Salud', href: '/maps' },
    { id: 'reports', icon: 'description', label: 'Informes', href: '/reports' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`
                fixed
                left-0
                top-0
                z-16
                h-screen
                bg-[#eef4ff]
                dark:bg-[#0b1d2d]
                border-r
                border-[#e4efff]
                dark:border-[#1a2b3b]
                transition-all
                duration-300
                ease-out
                overflow-hidden
                shadow-lg
            `}
            style={{
                width: isExpanded ? '256px' : '64px',
            }}
        >
            {/* Logo / Brand */}
            <div className="h-16 flex items-center px-4 border-b border-[#d2e4fb]/30">
                {isExpanded ? (
                    <div>
                        <h1 className="text-lg font-black text-[#0b1d2d] dark:text-[#f7f9ff] tracking-tight">
                            Observatorio
                        </h1>

                        <p className="text-[9px] font-semibold uppercase tracking-widest text-[#414754] dark:text-[#d2e4fb] opacity-60">
                            de Datos Sanitarios
                        </p>
                    </div>
                ) : (
                    <span className="material-symbols-outlined text-[#0059bb] text-2xl">
                        monitoring
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            title={item.label}
                            className={`
                                flex
                                items-center
                                gap-4
                                px-4
                                py-3
                                rounded-lg
                                mb-1
                                transition-all
                                duration-200
                                min-h-[48px]                               

                                ${
                                    isActive
                                        ? 'bg-white dark:bg-surface-container text-primary dark:text-[#2e77c9] shadow-sm'
                                        : 'text-on-surface-variant dark:text-surface-variant opacity-80 hover:bg-surface-container/50 dark:hover:bg-surface-container/50'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined flex-shrink-0 text-xl">
                                {item.icon}
                            </span>

                            <span
                                className={`
                                    text-[13px]
                                    font-semibold
                                    uppercase
                                    tracking-widest
                                    whitespace-nowrap
                                    transition-all
                                    duration-200
                                    ${
                                        isExpanded
                                            ? 'opacity-100'
                                            : 'opacity-0 pointer-events-none'
                                    }
                                `}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-2 border-t border-[#d2e4fb]/30">
                <button
                    className="
                        w-full
                        bg-linear-to-br
                        from-[#0059bb]
                        to-[#0070ea]
                        text-white
                        py-3
                        rounded-full
                        font-bold
                        text-xs
                        uppercase
                        tracking-widest
                        shadow-lg
                        shadow-primary/20
                        active:scale-95
                        transition-transform
                    "
                >
                    {isExpanded ? 'Alerta' : '🚨'}
                </button>

                {isExpanded && (
                    <div className="mt-3 space-y-1">
                        <a
                            href="#"
                            className="
                                flex
                                items-center
                                gap-3
                                px-4
                                py-2
                                text-[11px]
                                font-bold
                                uppercase
                                tracking-widest
                                opacity-60
                                hover:opacity-100
                                rounded-lg
                            "
                        >
                            <span className="material-symbols-outlined text-sm">
                                help
                            </span>
                            Soporte
                        </a>

                        <a
                            href="#"
                            className="
                                flex
                                items-center
                                gap-3
                                px-4
                                py-2
                                text-[11px]
                                font-bold
                                uppercase
                                tracking-widest
                                opacity-60
                                hover:opacity-100
                                rounded-lg
                            "
                        >
                            <span className="material-symbols-outlined text-sm">
                                menu_book
                            </span>
                            Docs
                        </a>
                    </div>
                )}
            </div>
        </aside>
    );
}