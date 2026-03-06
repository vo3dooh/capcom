import { HttpError } from "@/shared/api/http";

const DEFAULT_SAVE_ERROR = "Не удалось сохранить изменения.";

function toMessage(error: unknown): string {
    if (error instanceof HttpError) {
        if (typeof error.data?.message === "string") return error.data.message;
        if (typeof error.data?.error === "string") return error.data.error;
        return error.message;
    }

    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "";
}

export function mapChannelSettingsSaveError(error: unknown): string {
    const message = toMessage(error).trim().toLowerCase();
    const status = error instanceof HttpError ? error.status : null;

    if (message.includes("slug is already taken")) return "Такая ссылка канала уже занята.";
    if (
        message.includes("name is already taken") ||
        message.includes("channel name already taken") ||
        message.includes("channel_name_nocase_key") ||
        message.includes("unique constraint failed") && message.includes("channel.name")
    ) return "Такое название канала уже занято.";
    if (message.includes("channel name must use one language") || message.includes("mixed cyrillic") || message.includes("mix cyrillic") || message.includes("mixing")) return "Название канала должно быть только на одном языке.";

    if (status === 401 || message.includes("unauthorized")) {
        return "Необходимо авторизоваться повторно.";
    }

    if (status === 403 || message.includes("forbidden")) {
        return "У вас нет доступа для выполнения этого действия.";
    }

    if (status === 400 || status === 422 || message.includes("validation failed") || message.includes("validation") || message === "client_validation") {
        return "Проверьте корректность введённых данных.";
    }

    return DEFAULT_SAVE_ERROR;
}
