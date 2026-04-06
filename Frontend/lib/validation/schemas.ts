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

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
