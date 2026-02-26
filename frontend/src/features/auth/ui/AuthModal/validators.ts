export type FieldErrors = {
    email?: string;
    password?: string;
};

export function isEmailValid(value: string) {
    if (/[А-Яа-яЁё]/.test(value)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
