'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'info' | 'warning' | 'error' | 'success';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose?: () => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; textColor: string }> = {
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'ℹ️',
        textColor: 'text-blue-800'
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: '⚠️',
        textColor: 'text-yellow-800'
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: '❌',
        textColor: 'text-red-800'
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: '✅',
        textColor: 'text-green-800'
    }
};

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const style = toastStyles[type];

    return (
        <div
            className={`fixed bottom-6 right-6 max-w-sm ${style.bg} border ${style.border} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-right-5 duration-300 z-50`}
            role="alert"
        >
            <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
            <div className="flex-1">
                <p className={`${style.textColor} text-sm font-medium`}>{message}</p>
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    onClose?.();
                }}
                className={`${style.textColor} hover:opacity-70 flex-shrink-0 text-lg leading-none`}
                aria-label="Cerrar notificación"
            >
                ✕
            </button>
        </div>
    );
}
