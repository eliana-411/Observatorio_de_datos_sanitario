import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useProtectedRoute() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const checkTokenValidity = useAuthStore((state) => state.checkTokenValidity);

    useEffect(() => {
        checkTokenValidity();

        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router, checkTokenValidity]);

    return isAuthenticated;
}
