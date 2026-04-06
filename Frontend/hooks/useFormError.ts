import { useAuthStore } from '@/store/authStore';

export function useFormError(fieldName: string): string[] {
    const validationErrors = useAuthStore((state) => state.validationErrors);

    if (!validationErrors || !validationErrors[fieldName]) {
        return [];
    }

    return validationErrors[fieldName];
}
