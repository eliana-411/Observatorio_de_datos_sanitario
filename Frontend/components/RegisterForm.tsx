'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterFormData } from '@/lib/validation/schemas';
import { useAuth } from '@/hooks/useAuth';
import { useFormError } from '@/hooks/useFormError';

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const { register: registerUser, isLoading, error } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors: zodErrors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema),
    });

    const nameErrors = useFormError('name');
    const emailErrors = useFormError('email');
    const passwordErrors = useFormError('password');
    const confirmPasswordErrors = useFormError('confirmPassword');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data.name, data.email, data.password);
            // Pequeño delay para asegurar que la cookie se establezca
            await new Promise(resolve => setTimeout(resolve, 200));
            router.push('/dashboard');
        } catch (err) {
            // El error ya está en el estado de useAuth
            console.error('Register error:', err);
        }
    };

    // Personalizar mensaje de error si el email ya existe
    const getErrorMessage = () => {
        if (!error) return null;
        if (error.includes('El usuario ya existe')) {
            return 'Este email ya está registrado. Por favor, intenta con otro email o inicia sesión con tu cuenta.';
        }
        return error;
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {getErrorMessage() && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-sm">
                    <p className="font-semibold mb-1">Error en el registro:</p>
                    <p>{getErrorMessage()}</p>
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre Completo
                </label>
                <input
                    {...register('name')}
                    id="name"
                    type="text"
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                />
                {(zodErrors.name || nameErrors.length > 0) && (
                    <p className="mt-1 text-sm text-red-600">
                        {zodErrors.name?.message || nameErrors[0]}
                    </p>
                )}
            </div>

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

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar Contraseña
                </label>
                <div className="relative">
                    <input
                        {...register('confirmPassword')}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showConfirmPassword ? (
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
                {(zodErrors.confirmPassword || confirmPasswordErrors.length > 0) && (
                    <p className="mt-1 text-sm text-red-600">
                        {zodErrors.confirmPassword?.message || confirmPasswordErrors[0]}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    );
}
