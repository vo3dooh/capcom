export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export class HttpError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

type RequestOptions = {
    method?: HttpMethod;
    body?: any;
    token?: string | null;
};

function getToken(): string | null {
    try {
        return localStorage.getItem("token");
    } catch {
        return null;
    }
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? "GET";
    const token = options.token !== undefined ? options.token : getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
        const msg = (data && (data.message || data.error)) ? (data.message || data.error) : `HTTP ${res.status}`;
        throw new HttpError(msg, res.status, data);
    }

    return data as T;
}