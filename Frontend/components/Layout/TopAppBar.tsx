'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TopAppBar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        setShowProfileMenu(false);
        router.push('/login');
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 py-3 bg-[#f7f9ff]/80 dark:bg-[#0b1d2d]/80 backdrop-blur-xl md:pl-72 shadow-[0px_12px_32px_rgba(11,29,45,0.06)]">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md">
                    <span
                        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727886]"
                        data-icon="search"
                    >
                        search
                    </span>
                    <input
                        className="w-full bg-gray-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900 placeholder-gray-500"
                        placeholder="Buscar datos epidemiológicos..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-[#e4efff] dark:hover:bg-[#1a2b3b] text-[#414754] dark:text-[#d2e4fb] transition-colors relative">
                    <span className="material-symbols-outlined" data-icon="notifications">
                        notifications
                    </span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                </button>
                <button className="p-2 rounded-full hover:bg-[#e4efff] dark:hover:bg-[#1a2b3b] text-[#414754] dark:text-[#d2e4fb] transition-colors">
                    <span className="material-symbols-outlined" data-icon="smart_toy">
                        smart_toy
                    </span>
                </button>
                <button className="p-2 rounded-full hover:bg-[#e4efff] dark:hover:bg-[#1a2b3b] text-[#414754] dark:text-[#d2e4fb] transition-colors">
                    <span className="material-symbols-outlined" data-icon="settings">
                        settings
                    </span>
                </button>

                <div className="h-8 w-px bg-[#d2e4fb] mx-2"></div>

                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="text-right hidden sm:block min-w-max hover:opacity-70 transition-opacity"
                    >
                        <p className="text-[16px] font-bold text-on-surface leading-tight">
                            {user?.name || 'Usuario'}
                        </p>
                        <p className="text-[14px] text-on-surface-variant font-medium">
                            Usuario
                        </p>
                    </button>

                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center border-2 border-primary-container hover:opacity-90 transition-opacity shrink-0"
                    >
                        {getInitials(user?.name)}
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#1a2b3b] rounded-xl shadow-lg border border-white/20 dark:border-[#1a2b3b] w-48 py-2 z-50">
                            <button
                                onClick={() => {
                                    router.push('/profile');
                                    setShowProfileMenu(false);
                                }}
                                className="w-full text-left px-4 py-3 text-base text-on-surface hover:bg-[#e4efff] dark:hover:bg-[#324d66] transition-colors flex items-center gap-3 font-medium cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm" data-icon="account_circle">
                                    account_circle
                                </span>
                                Perfil
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-base text-error hover:bg-[#ff0000]/40 transition-colors flex items-center gap-3 font-medium cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm" data-icon="logout">
                                    logout
                                </span>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
