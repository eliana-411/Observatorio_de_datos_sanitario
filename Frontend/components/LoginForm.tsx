'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginFormData } from '@/lib/validation/schemas';
import { useAuth } from '@/hooks/useAuth';
import { useFormError } from '@/hooks/useFormError';

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const router = useRouter();
    const { login, isLoading, error, requiresTwoFactor } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors: zodErrors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
    });

    const emailErrors = useFormError('email');
    const passwordErrors = useFormError('password');

    // Monitorear cambios en requiresTwoFactor después del login
    useEffect(() => {
        if (justLoggedIn && requiresTwoFactor) {
            console.log('🔐 Redirigiendo a /verify-2fa');
            router.push('/verify-2fa');
        } else if (justLoggedIn && !requiresTwoFactor && !error) {
            console.log('✅ Redirigiendo a /dashboard');
            router.push('/dashboard');
        }
    }, [requiresTwoFactor, error, justLoggedIn, router]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            console.log('📝 Iniciando login...');
            await login(data.email, data.password);
            console.log('✅ Login completado, esperando actualización de estado...');

            // Marcar que se acaba de loguear para que useEffect maneje la redirección
            setJustLoggedIn(true);
        } catch (err) {
            // El error ya está en el estado de useAuth
            console.error('❌ Login error:', err);
            setJustLoggedIn(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-sm">
                    <p className="font-semibold mb-1">Error de autenticación:</p>
                    <p>{error}</p>
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    {...register('email')}
                    id="email"
                    type="email"
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                />
                {(zodErrors.email || emailErrors.length > 0) && (
                    <p className="mt-1 text-sm text-red-600">
                        {zodErrors.email?.message || emailErrors[0]}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                                <path d="M3 10c0 0 2 4 7 4s7-4 7-4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
                {(zodErrors.password || passwordErrors.length > 0) && (
                    <p className="mt-1 text-sm text-red-600">
                        {zodErrors.password?.message || passwordErrors[0]}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
        </form>
    );
}
