const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

type RequestOptions = {
    method?: "GET" | "POST" | "PATCH"
    body?: unknown
    accessToken?: string | null
}

async function parseError(res: Response): Promise<string> {
    const text = await res.text().catch(() => "")
    if (!text) return `${res.status} ${res.statusText}`

    try {
        const json = JSON.parse(text) as any
        const msg = json?.message

        if (Array.isArray(msg)) return msg.join("\n")
        if (typeof msg === "string") return msg

        if (typeof json?.error === "string") return json.error
        return `${res.status} ${res.statusText}`
    } catch {
        return text
    }
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, accessToken } = opts

    const headers: Record<string, string> = {}
    if (method !== "GET") headers["Content-Type"] = "application/json"
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
    })

    if (!res.ok) throw new Error(await parseError(res))
    return (await res.json()) as T
}

export type SocialType = "telegram" | "twitter" | "instagram" | "website"

export type MySettingsResponse = {
    id: string
    email: string
    username: string
    about: string
    avatarUrl: string | null
    coverUrl: string | null
    socials: { type: SocialType; url: string }[]
}

export type UpdateMySettingsBody = {
    email?: string
    username?: string
    about?: string
    avatarUrl?: string | null
    coverUrl?: string | null
    socials?: { type: SocialType; url: string }[]
}

export const settingsApi = {
    my(accessToken: string) {
        return request<MySettingsResponse>("/users/me/settings", { method: "GET", accessToken })
    },
    updateMySettings(accessToken: string, body: UpdateMySettingsBody) {
        return request<MySettingsResponse>("/users/me/settings", { method: "PATCH", accessToken, body })
    }
}
