const URL_PROTOCOL_REGEX = /^https?:\/\//i;

export function normalizeSocialUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (URL_PROTOCOL_REGEX.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export function getSocialSaveError(enabled: boolean, value: string): string | null {
    if (!enabled) return null;

    const trimmed = value.trim();
    if (!trimmed) return "Введите ссылку для этой социальной сети.";

    const normalized = normalizeSocialUrl(trimmed);
    try {
        const parsed = new URL(normalized);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return "Проверьте корректность введённой ссылки.";
        }
        return null;
    } catch {
        return "Проверьте корректность введённой ссылки.";
    }
}
