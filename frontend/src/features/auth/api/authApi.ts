import type { AuthResponse } from "./types";

const API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : `http://${window.location.hostname}:3001`;

type RequestOptions = {
    method?: "GET" | "POST";
    body?: unknown;
    accessToken?: string | null;
};

async function parseError(res: Response): Promise<string> {
    const text = await res.text().catch(() => "");
    if (!text) return `${res.status} ${res.statusText}`;

    try {
        const json = JSON.parse(text) as any;
        const msg = json?.message;

        if (Array.isArray(msg)) return msg.join("\n");
        if (typeof msg === "string") return msg;

        if (typeof json?.error === "string") return json.error;
        return `${res.status} ${res.statusText}`;
    } catch {
        return text;
    }
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const { method = "POST", body, accessToken } = opts;

    const headers: Record<string, string> = {};

    if (method !== "GET") headers["Content-Type"] = "application/json";
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
    });

    if (!res.ok) throw new Error(await parseError(res));

    return (await res.json()) as T;
}

export type MeResponse = {
    id: string;
    email: string;
    username: string | null;
    avatarUrl: string | null;
    createdAt: string;
};

export const authApi = {
    register(email: string, password: string, username?: string) {
        return request<AuthResponse>("/auth/register", { body: { email, password, username } });
    },
    login(email: string, password: string) {
        return request<AuthResponse>("/auth/login", { body: { email, password } });
    },
    me(accessToken: string) {
        return request<MeResponse>("/auth/me", { method: "GET", accessToken });
    },
};
