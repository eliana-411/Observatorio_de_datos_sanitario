import { NextRequest, NextResponse } from 'next/server';
import { isTokenExpired, decodeToken } from './lib/auth/jwt-utils';

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/profile'];

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/', '/login', '/register', '/api'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Permitir rutas públicas
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Validar token en rutas protegidas
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        const token = request.cookies.get('auth_token')?.value;

        // Sin token → redirigir a login
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Validar que el JWT no esté expirado
        if (isTokenExpired(token)) {
            // Token expirado → limpiar cookie y redirigir
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }

        // Validar estructura del JWT
        const decoded = decodeToken(token);
        if (!decoded) {
            // JWT inválido → limpiar y redirigir
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
