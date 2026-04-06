import { getToken } from '@/lib/auth/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5083';

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_URL}/api${endpoint}`;

    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge custom headers if provided
    if (options.headers && typeof options.headers === 'object') {
        Object.assign(headers, options.headers);
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const contentType = response.headers.get('content-type');
        let body: any;

        if (contentType?.includes('application/json')) {
            body = await response.json();
        } else {
            body = await response.text();
        }

        // Success response (2xx)
        if (response.ok) {
            return { data: body as T };
        }

        // 401 Unauthorized - token expirado o inválido
        if (response.status === 401) {
            return {
                error: {
                    message: 'Unauthorized. Please login again.',
                    errors: undefined,
                },
            };
        }

        // 400 Bad Request o 422 - validación
        if (response.status === 400 || response.status === 422) {
            const error: ApiError = {
                message: body?.message || 'Validation error',
            };

            if (body?.errors) {
                error.errors = body.errors;
            }

            return { error };
        }

        // Otros errores
        return {
            error: {
                message: body?.message || 'An error occurred',
            },
        };
    } catch (err) {
        return {
            error: {
                message: 'Network error. Please check your connection.',
            },
        };
    }
}

export const api = {
    get<T>(endpoint: string) {
        return apiRequest<T>(endpoint, {
            method: 'GET',
        });
    },

    post<T>(endpoint: string, body: unknown) {
        return apiRequest<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put<T>(endpoint: string, body: unknown) {
        return apiRequest<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete<T>(endpoint: string) {
        return apiRequest<T>(endpoint, {
            method: 'DELETE',
        });
    },
};
