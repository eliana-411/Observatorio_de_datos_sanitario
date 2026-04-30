'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TwoFAForm } from '@/components/TwoFAForm';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Verify2FAPage() {
    const router = useRouter();
    const { requiresTwoFactor, twoFAEmail } = useAuth();

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
        <div className="max-w-4xl from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-5">
            {/* Back Button */}
            <Link
                href="/login"
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-surface-container-low transition-all group"
                aria-label="Volver a inicio de sesión"
            >
                <span className="material-symbols-outlined text-primary group-hover:text-primary-container transition-colors">
                    arrow_back
                </span>

                <span className="text-primary font-medium group-hover:text-primary-container transition-colors">
                    Volver a inicio de sesión
                </span>
            </Link>

            <div className="w-full ">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-8 rounded-full mb-4">
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
                        Ingresa el código enviado a <span className="font-semibold">{twoFAEmail}</span>
                    </p>
                </div>

                {/* Form Card */}
                <div className="">
                    <TwoFAForm />
                </div>


            </div>
        </div>
    );
}
