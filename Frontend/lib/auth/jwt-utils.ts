export interface JwtPayload {
    sub?: string;
    email?: string;
    name?: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
    // Claims estándar de .NET Identity
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
}

/** Decodifica un JWT sin validar firma (seguridad del backend) */
export function decodeToken(token: string): JwtPayload | null {
    try {
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decodificar payload (segunda parte)
        const payload = parts[1];

        // Convertir base64url a base64 (reemplazar - con + y _ con /)
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

        // Añadir padding si es necesario (base64 requiere múltiplos de 4)
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

        // Decodificar - funciona en cliente y servidor
        let decoded;
        try {
            // Intentar atob() con TextDecoder para UTF-8 (cliente moderno)
            if (typeof atob !== 'undefined' && typeof TextDecoder !== 'undefined') {
                const binaryString = atob(padded);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const utf8String = new TextDecoder('utf-8').decode(bytes);
                decoded = JSON.parse(utf8String);
            } else if (typeof atob !== 'undefined') {
                // Fallback a atob simple (menos seguro para UTF-8)
                decoded = JSON.parse(atob(padded));
            } else {
                // Fallback a Buffer (servidor Node.js)
                decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
            }
        } catch (e) {
            return null;
        }

        return decoded as JwtPayload;
    } catch (error) {
        return null;
    }
}

/** Verifica si el token ha expirado */
export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload) {
        return true;
    }

    // exp debe estar presente (como string o número)
    let exp = payload.exp;
    if (!exp) {
        return true;
    }

    // Convertir a número si es string
    const expNumber = typeof exp === 'string' ? parseInt(exp, 10) : exp;

    if (isNaN(expNumber)) {
        return true;
    }

    // Comparar exp (segundos) con Date.now() (milisegundos)
    const expirationTime = expNumber * 1000;
    const isExpired = Date.now() >= expirationTime;

    return isExpired;
}

/** Extrae información del usuario del token */
export function extractUserFromToken(token: string) {
    const payload = decodeToken(token);
    if (!payload) {
        return null;
    }

    // Mapear claims de .NET Identity a campos estándar
    const sub = payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const name = payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    if (!email) {
        return null;
    }

    return {
        id: sub || email,
        email,
        name: name || 'User',
    };
}

/** Obtiene el tiempo hasta expiración en milisegundos */
export function getTokenExpiresIn(token: string): number {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
        return 0;
    }

    // Convertir a número si es string
    const expNumber = typeof payload.exp === 'string' ? parseInt(payload.exp, 10) : payload.exp;

    if (isNaN(expNumber)) {
        return 0;
    }

    const expirationTime = expNumber * 1000;
    const msUntilExpiry = expirationTime - Date.now();

    return Math.max(0, msUntilExpiry);
}
