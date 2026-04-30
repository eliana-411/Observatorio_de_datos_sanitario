'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { id: 'paneles', icon: 'dashboard', label: 'Paneles', href: '/dashboard' },
    { id: 'estadisticas', icon: 'query_stats', label: 'Estads.', href: '/statistics' },
    { id: 'mapas', icon: 'map', label: 'Mapas', href: '/maps' },
    { id: 'informes', icon: 'description', label: 'Informes', href: '/reports' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-highest backdrop-blur-xl border-none h-16 flex items-center justify-around px-6 z-50">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-600 opacity-60'
                            }`}
                    >
                        <span className="material-symbols-outlined" data-icon={item.icon}>
                            {item.icon}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}