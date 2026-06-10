'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
    { id: 'paneles', icon: 'dashboard', label: 'Paneles', href: '/dashboard' },
    { id: 'ai-assistant', icon: 'smart_toy', label: 'IA', href: '/ai-assistant' },
    { id: 'brotes', icon: 'warning', label: 'Brotes', href: '/brotes' },
    { id: 'demanda', icon: 'trending_up', label: 'Demanda', href: '/demanda-prediccion' },
    { id: 'anomalies', icon: 'query_stats', label: 'Anomalías', href: '/anomalies' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // VERSIÓN MOBILE - Bottom Navigation
    if (isMobile) {
        return (
            <nav
                className={`
                    fixed
                    bottom-0
                    left-0
                    right-0
                    z-18
                    bg-[#eef4ff]
                    dark:bg-[#0b1d2d]
                    border-t
                    border-[#e4efff]
                    dark:border-[#1a2b3b]
                    shadow-lg
                    flex
                    justify-around
                    items-center
                    h-16
                    px-2
                `}
            >
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            title={item.label}
                            className={`
                                flex
                                flex-col
                                items-center
                                justify-center
                                gap-1
                                flex-1
                                py-2
                                rounded-lg
                                transition-all
                                duration-200
                                ${isActive
                                    ? 'text-[#0059bb] dark:text-[#2e77c9] bg-white dark:bg-surface-container'
                                    : 'text-on-surface-variant dark:text-surface-variant opacity-70'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        );
    }

    // VERSIÓN DESKTOP - Sidebar original
    return (
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`
                fixed
                left-0
                top-0
                z-18
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
            <nav className="flex-1 px-0 py-4 overflow-y-auto overflow-x-hidden">
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
                                min-h-12
                                ${isActive
                                    ? 'bg-white dark:bg-surface-container text-primary dark:text-[#2e77c9] shadow-sm'
                                    : 'text-on-surface-variant dark:text-surface-variant opacity-80 hover:bg-surface-container/50 dark:hover:bg-surface-container/50'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined shrink-0 text-xl">
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
                                    ${isExpanded
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