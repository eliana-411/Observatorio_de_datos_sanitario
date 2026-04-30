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
    const [googleLoading, setGoogleLoading] = useState(false);
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
            router.push('/verify-2fa');
        } else if (justLoggedIn && !requiresTwoFactor && !error) {
            router.push('/dashboard');
        }
    }, [requiresTwoFactor, error, justLoggedIn, router]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
            setJustLoggedIn(true);
        } catch (err) {
            console.error('❌ Login error:', err);
            setJustLoggedIn(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase  text-on-surface-variant ml-1 text-gray-700">
                    Correo Institucional
                </label>
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-gray-600 transition-colors">mail</span>
                    <input
                        {...register('email')}
                        id="email"
                        type="email"
                        placeholder="usuario@institucion.gob"
                        className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-gray-600"
                    />
                </div>
                {(zodErrors.email || emailErrors.length > 0) && (
                    <p className="text-sm text-red-600 ml-1">
                        {zodErrors.email?.message || emailErrors[0]}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <label htmlFor="password" className="text-xs font-bold uppercase  text-on-surface-variant text-gray-700">
                        Contraseña
                    </label>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); router.push('/reset-password'); }}
                        className="text-sm font-semibold text-blue-600 dark:hover:text-primary-container transition-colors hover:cursor-pointer"
                    >
                        Olvidé mi contraseña
                    </button>
                </div>
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-gray-600 transition-colors">lock</span>
                    <input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-gray-600"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none transition-colors text-gray-700"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                    </button>
                </div>
                {(zodErrors.password || passwordErrors.length > 0) && (
                    <p className="text-sm text-red-600 ml-1">
                        {zodErrors.password?.message || passwordErrors[0]}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading || googleLoading}
                className=" bg-blue-600 px-4 hover:bg-blue-700  w-full py-4 bg-linear-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:cursor-pointer"
            >
                {isLoading ? (
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
                        Ingresando
                    </>
                ) : (
                    "Ingresar"
                )}
            </button>
        </form>
    );
}
