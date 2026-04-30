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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            {/* Timer */}
            <div className="flex items-center justify-between bg-yellow-50 border rounded-lg p-4">
                <div>
                    <p className="text-sm text-gray-600">
                        Código válido por {OTP_EXPIRY_MINUTES} minutos:
                    </p>
                    {isExpired && (
                        <p className="text-sm font-semibold text-red-600 mt-1">
                            Código expirado
                        </p>
                    )}

                </div>
                <div className="text-right">
                    <p className={`text-xl font-bold ${isExpired ? 'text-red-600' : 'text-yellow-600'}`}>
                        {formatTime(timeRemaining)}
                    </p>
                </div>
            </div>

            {/* Input para código OTP */}
            <div>
                <input
                    {...register('twoFactorCode')}
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="mt-1 block w-full rounded border-2 border-gray-300 px-4 py-3 text-center text-2xl tracking-widest font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition-all"
                />
                {(zodErrors.twoFactorCode || codeErrors.length > 0 || error) && (
                    <p className="mt-2 text-sm text-red-600">
                        {zodErrors.twoFactorCode?.message || codeErrors[0] || error}
                    </p>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isLoading || isExpired}
                    className="bg-blue-600 px-4 hover:bg-blue-700  w-full py-4 bg-linear-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:cursor-pointer"
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
                        Verificando
                    </>
                ) : (
                    "Verificar"
                )}
                </button>

            </div>
        </form>
    );
}
