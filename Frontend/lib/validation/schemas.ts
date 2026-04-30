import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

export const RegisterSchema = z
    .object({
        name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
        email: z.string().email('Email inválido'),
        password: z
            .string()
            .min(8, 'Contraseña debe tener al menos 8 caracteres')
            .regex(/[A-Z]/, 'Debe contener mayúscula')
            .regex(/[0-9]/, 'Debe contener número'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

export const AuthResponseSchema = z.object({
    token: z.string(),
    name: z.string(),
    email: z.string(),
});

export const LoginResponseSchema = z.object({
    requiresTwoFactor: z.boolean(),
    message: z.string().optional(),
    token: z.string().optional(),
    refreshToken: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
});

export const TwoFASchema = z.object({
    twoFactorCode: z
        .string()
        .length(6, 'El código debe tener 6 dígitos')
        .regex(/^[0-9]{6}$/, 'El código debe contener solo números'),
});

export const Verify2FASchema = z.object({
    email: z.string().email('Email inválido'),
    twoFactorCode: z
        .string()
        .length(6, 'El código debe tener 6 dígitos')
        .regex(/^[0-9]{6}$/, 'El código debe contener solo números'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type TwoFAFormData = z.infer<typeof TwoFASchema>;
export type Verify2FAData = z.infer<typeof Verify2FASchema>;
