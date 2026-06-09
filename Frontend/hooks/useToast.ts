'use client';

import { useState, useCallback } from 'react';
import { ToastType } from '@/components/Toast/Toast';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);

        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        showInfo: (message: string, duration?: number) => showToast(message, 'info', duration),
        showWarning: (message: string, duration?: number) => showToast(message, 'warning', duration),
        showError: (message: string, duration?: number) => showToast(message, 'error', duration),
        showSuccess: (message: string, duration?: number) => showToast(message, 'success', duration),
    };
}
