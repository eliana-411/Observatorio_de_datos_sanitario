'use client';

import { ProfileForm } from '@/components/ProfileForm';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function ProfilePage() {
    const router = useRouter();
    const isAuthenticated = useProtectedRoute();

    // Mostrar loading mientras se verifica la autenticación
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f9ff]  p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-2 text-primary hover:text-primary-container transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="text-sm font-semibold">Volver</span>
                    </button>
                    <h1 className="text-4xl font-bold text-on-surface mb-2">Mi Perfil</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline p-8 bg-white">
                    <ProfileForm />
                </div>
            </div>
        </div>
    );
}
