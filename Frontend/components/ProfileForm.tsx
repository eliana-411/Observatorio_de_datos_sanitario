'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schemas
const ProfileSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
});

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirmar contraseña es requerido'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof ProfileSchema>;
type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

export function ProfileForm() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile form
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors, isSubmitting: isUpdatingProfile },
        reset: resetProfile,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    // Password form
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
        reset: resetPassword,
    } = useForm<ChangePasswordData>({
        resolver: zodResolver(ChangePasswordSchema),
    });

    const onProfileSubmit = async (data: ProfileFormData) => {
        try {
            // TODO: Llamar API para actualizar perfil
            console.log('Updating profile:', data);
            setUpdateMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            setTimeout(() => setUpdateMessage(null), 3000);
        } catch (err) {
            setUpdateMessage({ type: 'error', text: 'Error al actualizar el perfil' });
        }
    };

    const onPasswordSubmit = async (data: ChangePasswordData) => {
        try {
            // TODO: Llamar API para cambiar contraseña
            console.log('Changing password:', data);
            setUpdateMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            resetPassword();
            setTimeout(() => setUpdateMessage(null), 3000);
        } catch (err) {
            setUpdateMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="w-full space-y-6">
            {/* Messages */}
            {updateMessage && (
                <div className={`p-3 rounded-lg border-l-4 ${updateMessage.type === 'success' 
                    ? 'bg-green-50 border-green-500 text-green-600' 
                    : 'bg-red-50 border-red-500 text-red-600'}`}>
                    <p className="text-sm">{updateMessage.text}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-outline">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-3 font-semibold text-sm transition-colors ${
                        activeTab === 'profile'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    Mi Perfil
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`px-4 py-3 font-semibold text-sm transition-colors ${
                        activeTab === 'password'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                    Seguridad
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <span className="text-white text-xl font-bold">
                                {getInitials(user?.name || 'U')}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-on-surface">{user?.name}</h3>
                            <p className="text-sm text-on-surface-variant">{user?.email}</p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                Nombre Completo
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                    person
                                </span>
                                <input
                                    {...registerProfile('name')}
                                    id="name"
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                />
                            </div>
                            {profileErrors.name && (
                                <p className="text-sm text-red-600 ml-1">{profileErrors.name.message}</p>
                            )}
                        </div>

                        {/* Email Field (Read-only) */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                Correo Institucional
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors">
                                    mail
                                </span>
                                <input
                                    {...registerProfile('email')}
                                    id="email"
                                    type="email"
                                    readOnly
                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface-variant cursor-not-allowed opacity-60"
                                />
                            </div>
                            <p className="text-xs text-on-surface-variant ml-1">El email no puede ser modificado</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                            {!isUpdatingProfile && <span className="material-symbols-outlined text-xl">save</span>}
                        </button>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="space-y-6">
                    <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                        {/* Current Password */}
                        <div className="space-y-2">
                            <label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                Contraseña Actual
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                    lock
                                </span>
                                <input
                                    {...registerPassword('currentPassword')}
                                    id="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showCurrentPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {passwordErrors.currentPassword && (
                                <p className="text-sm text-red-600 ml-1">{passwordErrors.currentPassword.message}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                Nueva Contraseña
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                    lock_open
                                </span>
                                <input
                                    {...registerPassword('newPassword')}
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showNewPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {passwordErrors.newPassword && (
                                <p className="text-sm text-red-600 ml-1">{passwordErrors.newPassword.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                Confirmar Nueva Contraseña
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                                    lock_check
                                </span>
                                <input
                                    {...registerPassword('confirmPassword')}
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                                <p className="text-sm text-red-600 ml-1">{passwordErrors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                            {!isChangingPassword && <span className="material-symbols-outlined text-xl">security</span>}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
