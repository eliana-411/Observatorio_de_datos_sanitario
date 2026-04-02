import { LoginForm } from '@/components/LoginForm';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';

export default function LoginPage() {
    return (
        <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inicia sesión</h1>
            <p className="text-gray-600 mb-8">Accede a tu cuenta en el Observatorio de Datos Sanitarios</p>

            <LoginForm />

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O</span>
                </div>
            </div>

            <GoogleLoginButton />
        </>
    );
}
