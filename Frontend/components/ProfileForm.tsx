'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getInitials } from '@/lib/utils';
import { api } from '@/lib/api/client';

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
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [showChangePassword, setShowChangePassword] = useState(false);
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
            if (!user?.id) {
                setUpdateMessage({ type: 'error', text: 'Usuario no identificado' });
                return;
            }

            const response = await api.put(`/users/${user.id}`, {
                name: data.name,
                email: data.email,
            });

            if (response.error) {
                setUpdateMessage({ type: 'error', text: response.error.message });
                return;
            }

            // Actualizar el estado del usuario en el store
            updateUser({ name: data.name });

            setUpdateMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            setTimeout(() => setUpdateMessage(null), 3000);
        } catch (err: any) {
            setUpdateMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil' });
        }
    };

    const onPasswordSubmit = async (data: ChangePasswordData) => {
        try {
            if (!user?.id) {
                setUpdateMessage({ type: 'error', text: 'Usuario no identificado' });
                return;
            }

            const response = await api.put(`/users/${user.id}`, {
                password: data.newPassword,
            });

            if (response.error) {
                setUpdateMessage({ type: 'error', text: response.error.message });
                return;
            }

            setUpdateMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            resetPassword();
            setShowChangePassword(false);
            setTimeout(() => setUpdateMessage(null), 3000);
        } catch (err: any) {
            setUpdateMessage({ type: 'error', text: err.message || 'Error al cambiar la contraseña' });
        }
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
                    className={`px-4 py-3 font-semibold text-sm transition-colors ${activeTab === 'profile'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                >
                    Información Personal
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`px-4 py-3 font-semibold text-sm transition-colors ${activeTab === 'password'
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
                        <div className="relative w-16 h-16">
                            {/* Avatar Circle */}
                            <div className="w-full h-full rounded-full bg-primary text-white font-bold flex items-center justify-center border-2 border-primary-container shadow-md">
                                <span className="text-xl">
                                    {getInitials(user?.name || 'U')}
                                </span>
                            </div>

                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-on-surface">{user?.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user?.role === 'Admin'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {user?.role === 'Admin' ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>
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
                            <p className="text-xs text-on-surface-variant ml-1 italic">* El email no puede ser modificado</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className=" py-3 px-6 w-auto rounded-3xl bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                {!isUpdatingProfile}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="space-y-6">
                    {/* Change Password Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="w-full flex items-center justify-between p-4 bg-surface-container-highest rounded-xl border border-outline hover:bg-surface-container-low transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">security</span>
                            <span className="font-semibold text-on-surface">Cambiar Contraseña</span>
                        </div>
                        <span className={`material-symbols-outlined transition-transform ${showChangePassword ? 'rotate-180' : ''
                            }`}>
                            expand_more
                        </span>
                    </button>

                    {/* Change Password Form */}
                    {showChangePassword && (
                        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 p-5 bg-surface-container-lowest rounded-xl border border-outline">
                            {/* Current Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                    Contraseña Actual
                                </label>
                                <div className="relative group">
                                    <input
                                        {...registerPassword('currentPassword')}
                                        id="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showCurrentPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-xs text-red-600 ml-1">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                    Nueva Contraseña
                                </label>
                                <div className="relative group">
                                    <input
                                        {...registerPassword('newPassword')}
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showNewPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-xs text-red-600 ml-1">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                                    Confirmar Nueva Contraseña
                                </label>
                                <div className="relative group">
                                    <input
                                        {...registerPassword('confirmPassword')}
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {showConfirmPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-xs text-red-600 ml-1">{passwordErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="py-3 px-6 w-auto rounded-3xl bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                                    {!isChangingPassword}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
