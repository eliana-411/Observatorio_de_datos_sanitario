'use client';

import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/ProfileForm';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    // Proteger la ruta
    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-surface p-6">
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
                    <p className="text-on-surface-variant">Gestiona tu información personal y seguridad</p>
                </div>

                {/* Profile Card */}
                <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline p-8">
                    <ProfileForm />
                </div>
            </div>
        </div>
    );
}
