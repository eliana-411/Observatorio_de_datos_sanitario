'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface GoogleLoginButtonProps {
    googleLoading?: boolean;
    setGoogleLoading?: (loading: boolean) => void;
}

export function GoogleLoginButton({ googleLoading = false, setGoogleLoading }: GoogleLoginButtonProps) {
    const { loginWithGoogle, isLoading, error } = useAuth();
    const router = useRouter();

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                setGoogleLoading?.(true);
                await loginWithGoogle(response.access_token);
                await new Promise(resolve => setTimeout(resolve, 200));
                router.push('/dashboard');
            } catch (err) {
                console.error('Google login error:', err);
                setGoogleLoading?.(false);
            }
        },
        onError: () => {
            console.error('Google login failed');
            setGoogleLoading?.(false);
        },
    });

    return (
        <button
            onClick={() => login()}
            disabled={isLoading || googleLoading}
            className="w-full py-4 bg-white text-on-surface hover:cursor-pointer font-bold rounded-full border border-outline shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:scale-[1.02] active:scale-95 "
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><g fill="none" fill-rule="evenodd" clip-rule="evenodd"><path fill="#f44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86" opacity="0.987"/><path fill="#ffc107" d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92" opacity="0.997"/><path fill="#448aff" d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49" opacity="0.999"/><path fill="#43a047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z" opacity="0.993"/></g></svg>
            {googleLoading ? (
                    <>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            className="animate-spin"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="2"
                                d="M12 7C9.2 7 7 9.2 7 12c0 2.5 2 5 5 5 2.8 0 5-2.2 5-5"
                            />
                        </svg>
                        Conectando con Google
                    </>
                ) : (
                    "Continuar con Google"
                )}
        </button>
    );
}