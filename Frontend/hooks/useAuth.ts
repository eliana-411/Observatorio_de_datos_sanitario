import { useAuthStore } from '@/store/authStore';

export function useAuth() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const login = useAuthStore((state) => state.login);
    const register = useAuthStore((state) => state.register);
    const logout = useAuthStore((state) => state.logout);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

    return {
        isAuthenticated,
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        loginWithGoogle,
    };
}
