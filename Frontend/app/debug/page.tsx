'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebugInfo = async () => {
            try {
                const res = await fetch('/api/debug');
                const data = await res.json();
                setDebugInfo(data);

                // También mostrar el token del localStorage
                const token = localStorage.getItem('auth_token');
                console.log('Debug Info:', {
                    ...data,
                    localStorageToken: token?.substring(0, 50) + '...',
                });
            } catch (err) {
                console.error('Error fetching debug info:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDebugInfo();
    }, []);

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Información de Debug</h1>

            <div className="bg-white rounded shadow p-6 space-y-4">
                <div>
                    <strong>¿Cookie recibida en servidor?</strong>
                    <p className={debugInfo.cookieReceived ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.cookieReceived ? 'SÍ ✓' : 'NO ✗'}
                    </p>
                </div>

                <div>
                    <strong>Longitud del token:</strong>
                    <p>{debugInfo.tokenLength} caracteres</p>
                </div>

                <div>
                    <strong>Prefix del token (primeros 50 caracteres):</strong>
                    <p className="font-mono text-xs bg-gray-100 p-2 overflow-x-auto">
                        {debugInfo.tokenPrefix}
                    </p>
                </div>

                <div>
                    <strong>Todas las cookies en la solicitud:</strong>
                    <p className="font-mono text-xs bg-gray-100 p-2 overflow-x-auto">
                        {debugInfo.allCookies}
                    </p>
                </div>

                <div>
                    <strong>Token en localStorage:</strong>
                    <p className="font-mono text-xs bg-gray-100 p-2 overflow-x-auto">
                        {localStorage.getItem('auth_token')?.substring(0, 50) || 'VACÍO'}...
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Intentar acceder a /dashboard
                </button>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800">
                    <strong>Instrucciones:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Si "¿Cookie recibida en servidor?" es NO, el problema es que la cookie no se guarda</li>
                        <li>Si es SÍ pero aún se devuelve al login, el problema es en la decodificación del JWT</li>
                        <li>Abre la consola (F12) y mira los logs [JWT] para más detalles</li>
                    </ol>
                </p>
            </div>
        </div>
    );
}
