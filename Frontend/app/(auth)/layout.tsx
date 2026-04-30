import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-2 relative text-gray-700">
            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-surface-container-low transition-all group"
                aria-label="Volver a inicio"
            >
                <span className="material-symbols-outlined text-primary group-hover:text-primary-container transition-colors">
                    arrow_back
                </span>

                <span className="text-primary font-medium group-hover:text-primary-container transition-colors">
                    Volver a inicio
                </span>
            </Link>

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