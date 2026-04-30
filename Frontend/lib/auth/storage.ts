import { extractUserFromToken, isTokenExpired } from './jwt-utils';

const TOKEN_KEY = 'auth_token';

/** Obtiene el token del localStorage */
export function getToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem(TOKEN_KEY);
}

/** Guarda el token en localStorage Y en cookie (para middleware) */
export function setToken(token: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Guardar en localStorage para acceso desde cliente
    localStorage.setItem(TOKEN_KEY, token);
    console.log('💾 Token guardado en localStorage:', token.substring(0, 20) + '...');

    // Guardar en cookie para acceso desde middleware (servidor)
    // Expira en 60 minutos (mismo que el token)
    const expiresInMs = 60 * 60 * 1000;
    const expiryDate = new Date(Date.now() + expiresInMs).toUTCString();
    document.cookie = `${TOKEN_KEY}=${token}; path=/; expires=${expiryDate}; SameSite=Lax`;
    console.log('🍪 Cookie establecida (SameSite=Lax)');
}

/** Elimina el token de localStorage Y cookies */
export function removeToken(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Eliminar de localStorage
    localStorage.removeItem(TOKEN_KEY);

    // Eliminar de cookies (expirar inmediatamente)
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

/** Obtiene el usuario almacenado decodificando el token */
export function getStoredUser() {
    const token = getToken();
    if (!token) {
        return null;
    }

    // Si el token está expirado, devolver null
    if (isTokenExpired(token)) {
        removeToken();
        return null;
    }

    return extractUserFromToken(token);
}

/** Verifica si hay un token válido */
export function hasValidToken(): boolean {
    const token = getToken();
    if (!token) {
        return false;
    }

    return !isTokenExpired(token);
}
