export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
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
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

        return decoded as JwtPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/** Verifica si el token ha expirado */
export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload) {
        return true;
    }

    // Comparar exp (segundos) con Date.now() (milisegundos)
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
}

/** Extrae información del usuario del token */
export function extractUserFromToken(token: string) {
    const payload = decodeToken(token);
    if (!payload) {
        return null;
    }

    return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
    };
}

/** Obtiene el tiempo hasta expiración en milisegundos */
export function getTokenExpiresIn(token: string): number {
    const payload = decodeToken(token);
    if (!payload) {
        return 0;
    }

    const expirationTime = payload.exp * 1000;
    const msUntilExpiry = expirationTime - Date.now();

    return Math.max(0, msUntilExpiry);
}
