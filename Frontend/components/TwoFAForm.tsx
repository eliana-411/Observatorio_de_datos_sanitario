'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TwoFASchema, type TwoFAFormData } from '@/lib/validation/schemas';
import { useAuth } from '@/hooks/useAuth';
import { useFormError } from '@/hooks/useFormError';

const OTP_EXPIRY_MINUTES = 5;

export function TwoFAForm() {
    const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_MINUTES * 60);
    const router = useRouter();
    const { verify2FA, isLoading, error, twoFAEmail } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors: zodErrors },
        watch,
    } = useForm<TwoFAFormData>({
        resolver: zodResolver(TwoFASchema),
    });

    const codeErrors = useFormError('twoFactorCode');
    const codeValue = watch('twoFactorCode');

    // Timer para expiración de código
    useEffect(() => {
        if (timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isExpired = timeRemaining <= 0;

    const onSubmit = async (data: TwoFAFormData) => {
        if (!twoFAEmail) {
            console.error('Email no disponible para 2FA');
            return;
        }

        if (isExpired) {
            console.error('Código expirado');
            return;
        }

        try {
            await verify2FA(twoFAEmail, data.twoFactorCode);

            // Pequeño delay para asegurar que el token se establezca
            await new Promise(resolve => setTimeout(resolve, 200));
            router.push('/dashboard');
        } catch (err) {
            // El error ya está en el estado de useAuth
            console.error('2FA verification error:', err);
        }
    };

    const handleBackToLogin = () => {
        router.push('/login');
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información del usuario */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                    Verificando acceso para:
                </p>
                <p className="text-lg font-semibold text-gray-900">
                    {twoFAEmail}
                </p>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-sm">
                    <p className="font-semibold mb-1">Error de verificación:</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Timer */}
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div>
                    <p className="text-sm text-gray-600">
                        Tiempo restante:
                    </p>
                    <p className={`text-2xl font-bold ${isExpired ? 'text-red-600' : 'text-yellow-600'}`}>
                        {formatTime(timeRemaining)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">
                        Código válido por {OTP_EXPIRY_MINUTES} minutos
                    </p>
                    {isExpired && (
                        <p className="text-sm font-semibold text-red-600 mt-1">
                            Código expirado
                        </p>
                    )}
                </div>
            </div>

            {/* Input para código OTP */}
            <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700">
                    Código de autenticación
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    Ingresa el código de 6 dígitos enviado a tu email
                </p>
                <input
                    {...register('twoFactorCode')}
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="mt-1 block w-full rounded border-2 border-gray-300 px-4 py-3 text-center text-2xl tracking-widest font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition-all"
                />
                {(zodErrors.twoFactorCode || codeErrors.length > 0) && (
                    <p className="mt-2 text-sm text-red-600">
                        {zodErrors.twoFactorCode?.message || codeErrors[0]}
                    </p>
                )}

                {/* Indicador de progreso */}
                {codeValue && codeValue.length > 0 && (
                    <div className="mt-2 flex gap-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 rounded-full transition-colors ${i < codeValue.length
                                        ? 'bg-blue-500'
                                        : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isLoading || isExpired}
                    className="flex-1 rounded bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                </button>
                <button
                    type="button"
                    onClick={handleBackToLogin}
                    disabled={isLoading}
                    className="flex-1 rounded bg-gray-200 px-4 py-3 text-gray-800 font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Volver
                </button>
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">
                    📧 <strong>¿No recibiste el código?</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                    Revisa tu bandeja de spam o intenta volver a iniciar sesión para recibir un nuevo código.
                </p>
            </div>
        </form>
    );
}
