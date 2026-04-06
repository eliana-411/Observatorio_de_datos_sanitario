import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {children}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>
                            ¿Necesitas ayuda?{' '}
                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                                Inicia sesión
                            </Link>
                            {' '}o{' '}
                            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                                Regístrate
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
