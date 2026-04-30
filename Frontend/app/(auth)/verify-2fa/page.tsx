'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TwoFAForm } from '@/components/TwoFAForm';
import { useAuth } from '@/hooks/useAuth';

export default function Verify2FAPage() {
    const router = useRouter();
    const { requiresTwoFactor } = useAuth();

    // Validar que solo sea accesible si está en proceso de 2FA
    useEffect(() => {
        if (!requiresTwoFactor) {
            router.push('/login');
        }
    }, [requiresTwoFactor, router]);

    // Si no está en proceso de 2FA, no renderizar nada
    if (!requiresTwoFactor) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verificación de Seguridad
                    </h1>
                    <p className="text-gray-600">
                        Ingresa el código enviado a tu email
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <TwoFAForm />
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        ¿Necesitas ayuda?{' '}
                        <a
                            href="mailto:soporte@observatorio.com"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Contacta soporte
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
