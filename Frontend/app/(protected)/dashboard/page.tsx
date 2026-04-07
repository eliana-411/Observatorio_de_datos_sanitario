'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const isAuthenticated = useProtectedRoute();
    const { user } = useAuth();

    if (!isAuthenticated) {
        return <div className="text-center py-8">Redirigiendo...</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">
                    ¡Bienvenido, {user?.name}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                    En el Observatorio de Datos Sanitarios
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tu Perfil</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium text-gray-700">Nombre:</span>{' '}
                            {user?.name}
                        </p>
                        <p>
                            <span className="font-medium text-gray-700">Email:</span> {user?.email}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Información</h2>
                    <p className="text-gray-600">
                        Este es tu panel de control. Aquí podrás acceder a todos los datos del
                        observatorio.
                    </p>
                </div>
            </div>
        </div>
    );
}
