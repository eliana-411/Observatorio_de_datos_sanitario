'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { id: 'paneles', icon: 'dashboard', label: 'Paneles', href: '/dashboard' },
    { id: 'analytics', icon: 'query_stats', label: 'Analítica Predictiva', href: '/analytics' },
    { id: 'maps', icon: 'map', label: 'Mapas de Salud', href: '/maps' },
    { id: 'protocols', icon: 'psychiatry', label: 'Protocolos IA', href: '/protocols' },
    { id: 'reports', icon: 'description', label: 'Informes', href: '/reports' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#eef4ff] dark:bg-[#0b1d2d] p-4 space-y-2 border-r border-[#e4efff] dark:border-[#1a2b3b] z-50">
            <div className="mb-8 px-2">
                <h1 className="text-lg font-black text-[#0b1d2d] dark:text-[#f7f9ff] tracking-tight">
                    Observatorio de Datos Sanitarios
                </h1>
                <p className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest text-[#414754] dark:text-[#d2e4fb] opacity-60">
                    Observatorio de Datos v2.1
                </p>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-200 ${isActive
                                ? 'bg-white dark:bg-surface-container text-primary dark:text-[#2e77c9] shadow-sm'
                                : 'text-on-surface-variant dark:text-surface-variant opacity-80 hover:bg-surface-container/50 dark:hover:bg-surface-container/50 hover:translate-x-1'
                                }`}
                        >
                            <span className="material-symbols-outlined" data-icon={item.icon}>
                                {item.icon}
                            </span>
                            <span className="font-inter text-[13px] font-semibold uppercase tracking-widest">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 mt-4 border-t border-[#d2e4fb]/30">
                <button className="w-full bg-linear-to-br from-[#0059bb] to-[#0070ea] text-white py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                    Alerta de Emergencia
                </button>
                <div className="mt-4 space-y-1">
                    <a
                        href="#"
                        className="flex items-center gap-3 px-4 py-2 text-on-surface-variant dark:text-surface-variant opacity-60 text-[11px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-sm" data-icon="help">
                            help
                        </span>
                        Soporte
                    </a>
                    <a
                        href="#"
                        className="flex items-center gap-3 px-4 py-2 text-on-surface-variant dark:text-surface-variant opacity-60 text-[11px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-sm" data-icon="menu_book">
                            menu_book
                        </span>
                        Documentación
                    </a>
                </div>
            </div>
        </aside>
    );
}
