import { useAuthStore } from '@/store/authStore';

export function useAuth() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const requiresTwoFactor = useAuthStore((state) => state.requiresTwoFactor);
    const twoFAEmail = useAuthStore((state) => state.twoFAEmail);
    const login = useAuthStore((state) => state.login);
    const register = useAuthStore((state) => state.register);
    const logout = useAuthStore((state) => state.logout);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const verify2FA = useAuthStore((state) => state.verify2FA);

    return {
        isAuthenticated,
        user,
        isLoading,
        error,
        requiresTwoFactor,
        twoFAEmail,
        login,
        register,
        logout,
        loginWithGoogle,
        verify2FA,
    };
}
