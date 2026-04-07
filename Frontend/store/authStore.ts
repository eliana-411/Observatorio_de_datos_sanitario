import { create } from 'zustand';
import { api } from '@/lib/api/client';
import { setToken, removeToken, getStoredUser } from '@/lib/auth/storage';
import type { AuthResponse } from '@/lib/validation/schemas';

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthStore {
    // State
    token: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    validationErrors: Record<string, string[]> | null;

    // Computed
    isAuthenticated: boolean;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    loginWithGoogle: (googleToken: string) => Promise<void>;
    logout: () => void;
    checkTokenValidity: () => void;
    restoreFromStorage: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    // Initial state
    token: null,
    user: null,
    isLoading: false,
    error: null,
    validationErrors: null,

    // Computed property
    get isAuthenticated() {
        return get().token !== null && get().user !== null;
    },

    // Login with email and password
    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null, validationErrors: null });

        const response = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
        });

        if (response.error) {
            if (response.error.errors) {
                set({
                    validationErrors: response.error.errors,
                    isLoading: false,
                });
                throw new Error(Object.values(response.error.errors)[0]?.[0] || 'Validation error');
            } else {
                const errorMsg = response.error.message || 'Login failed';
                set({
                    error: errorMsg,
                    isLoading: false,
                });
                throw new Error(errorMsg);
            }
        }

        if (response.data) {
            const { token, email, name } = response.data;
            setToken(token);
            set({
                token,
                user: {
                    id: email,
                    email,
                    name,
                },
                isLoading: false,
            });
        }
    },

    // Register new user
    register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null, validationErrors: null });

        const response = await api.post<AuthResponse>('/auth/register', {
            name,
            email,
            password,
        });

        if (response.error) {
            if (response.error.errors) {
                set({
                    validationErrors: response.error.errors,
                    isLoading: false,
                });
                throw new Error(Object.values(response.error.errors)[0]?.[0] || 'Validation error');
            } else {
                const errorMsg = response.error.message || 'Registration failed';
                set({
                    error: errorMsg,
                    isLoading: false,
                });
                throw new Error(errorMsg);
            }
        }

        if (response.data) {
            const { token, email: userEmail, name: userName } = response.data;
            setToken(token);
            set({
                token,
                user: {
                    id: userEmail,
                    email: userEmail,
                    name: userName,
                },
                isLoading: false,
            });
        }
    },

    // Google OAuth login
    loginWithGoogle: async (googleToken: string) => {
        set({ isLoading: true, error: null, validationErrors: null });

        const response = await api.post<AuthResponse>('/auth/google-login', {
            token: googleToken,
        });

        if (response.error) {
            const errorMsg = response.error.message || 'Google login failed';
            set({
                error: errorMsg,
                isLoading: false,
            });
            throw new Error(errorMsg);
        }

        if (response.data) {
            const { token, email, name } = response.data;
            setToken(token);
            set({
                token,
                user: {
                    id: email,
                    email,
                    name,
                },
                isLoading: false,
            });
        }
    },

    // Logout
    logout: () => {
        removeToken();
        set({
            token: null,
            user: null,
            error: null,
            validationErrors: null,
        });
    },

    // Check token validity
    checkTokenValidity: () => {
        const state = get();
        if (!state.token) {
            return;
        }

        const user = getStoredUser();
        if (!user) {
            get().logout();
        }
    },

    // Restore from storage on app init
    restoreFromStorage: () => {
        const user = getStoredUser();
        if (user) {
            const token = localStorage.getItem('auth_token');
            if (token) {
                set({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                });
            }
        }
    },

    // Clear error messages
    clearError: () => {
        set({ error: null, validationErrors: null });
    },
}));
