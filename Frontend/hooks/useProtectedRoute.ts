import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useProtectedRoute() {
    const router = useRouter();
    // Obtener token y user directamente para calcular isAuthenticated
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = token !== null && user !== null;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Restaurar token desde localStorage al montar SOLO UNA VEZ
        const restoreFromStorage = useAuthStore.getState().restoreFromStorage;
        restoreFromStorage();

        setIsLoading(false);
    }, []); // Array vacío = solo una vez

    useEffect(() => {
        // No redirigir si aún está cargando
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router, isLoading]);

    return isAuthenticated && !isLoading;
}
