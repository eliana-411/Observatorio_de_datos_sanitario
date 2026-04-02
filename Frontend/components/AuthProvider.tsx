'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isHydrated, setIsHydrated] = useState(false);
    const restoreFromStorage = useAuthStore((state) => state.restoreFromStorage);
    const checkTokenValidity = useAuthStore((state) => state.checkTokenValidity);

    useEffect(() => {
        // Restore authentication state from localStorage
        restoreFromStorage();
        checkTokenValidity();
        setIsHydrated(true);
    }, [restoreFromStorage, checkTokenValidity]);

    // Mostrar spinner mientras se valida
    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-blue-600"></div>
            </div>
        );
    }

    return children;
}
