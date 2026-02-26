import { useEffect, useMemo, useState } from "react"
import { authSession } from "@/features/auth/model/authSession"
import {
    settingsApi,
    type MySettingsResponse,
    type SocialType,
    type UpdateMySettingsBody,
    type UserSocial,
} from "@/features/settings/api/settingsApi"

type LoadState =
    | { status: "idle"; data: null; error: null }
    | { status: "loading"; data: null; error: null }
    | { status: "ready"; data: MySettingsResponse; error: null }
    | { status: "error"; data: null; error: string }

type FormState = {
    email: string
    username: string
    about: string
    avatarUrl: string
    coverUrl: string
    telegram: string
    twitter: string
    instagram: string
    website: string
}

function getSocialUrl(socials: UserSocial[], type: SocialType): string {
    const found = socials.find((s) => s.type === type)
    return found?.url ?? ""
}

function buildSocials(form: FormState): UserSocial[] {
    const items: UserSocial[] = []
    if (form.telegram.trim()) items.push({ type: "telegram", url: form.telegram.trim() })
    if (form.twitter.trim()) items.push({ type: "twitter", url: form.twitter.trim() })
    if (form.instagram.trim()) items.push({ type: "instagram", url: form.instagram.trim() })
    if (form.website.trim()) items.push({ type: "website", url: form.website.trim() })
    return items
}

function toForm(p: MySettingsResponse): FormState {
    return {
        email: p.email ?? "",
        username: p.username ?? "",
        about: p.about ?? "",
        avatarUrl: p.avatarUrl ?? "",
        coverUrl: p.coverUrl ?? "",
        telegram: getSocialUrl(p.socials ?? [], "telegram"),
        twitter: getSocialUrl(p.socials ?? [], "twitter"),
        instagram: getSocialUrl(p.socials ?? [], "instagram"),
        website: getSocialUrl(p.socials ?? [], "website"),
    }
}

function normalizeForm(f: FormState) {
    return {
        email: f.email.trim(),
        username: f.username.trim(),
        about: f.about,
        avatarUrl: f.avatarUrl.trim(),
        coverUrl: f.coverUrl.trim(),
        telegram: f.telegram.trim(),
        twitter: f.twitter.trim(),
        instagram: f.instagram.trim(),
        website: f.website.trim(),
    }
}

export function useSettingsProfile() {
    const snap = authSession.getSnapshot()
    const token = snap.accessToken

    const [load, setLoad] = useState<LoadState>(() => {
        if (!token) return { status: "idle", data: null, error: null }
        return { status: "loading", data: null, error: null }
    })

    const [form, setForm] = useState<FormState | null>(null)
    const [initial, setInitial] = useState<FormState | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [saveOk, setSaveOk] = useState(false)

    useEffect(() => {
        let alive = true

        if (!token) {
            setLoad({ status: "idle", data: null, error: null })
            setForm(null)
            setInitial(null)
            return
        }

        setLoad({ status: "loading", data: null, error: null })
        setSaveError(null)
        setSaveOk(false)

        settingsApi
            .my(token)
            .then((data) => {
                if (!alive) return
                setLoad({ status: "ready", data, error: null })
                const f = toForm(data)
                setForm(f)
                setInitial(f)
            })
            .catch((e: any) => {
                if (!alive) return
                setLoad({ status: "error", data: null, error: String(e?.message || "Error") })
            })

        return () => {
            alive = false
        }
    }, [token])

    const dirty = useMemo(() => {
        if (!form || !initial) return false
        const a = normalizeForm(form)
        const b = normalizeForm(initial)
        return JSON.stringify(a) !== JSON.stringify(b)
    }, [form, initial])

    async function save() {
        if (!token) return
        if (!form || !initial) return

        setSaving(true)
        setSaveError(null)
        setSaveOk(false)

        const body: UpdateMySettingsBody = {
            email: form.email.trim(),
            username: form.username.trim(),
            about: form.about,
            avatarUrl: form.avatarUrl.trim() ? form.avatarUrl.trim() : null,
            coverUrl: form.coverUrl.trim() ? form.coverUrl.trim() : null,
            socials: buildSocials(form),
        }

        try {
            const updated = await settingsApi.updateMySettings(token, body)
            const f = toForm(updated)
            setInitial(f)
            setForm(f)
            setSaveOk(true)
            await authSession.refresh()
        } catch (e: any) {
            setSaveError(String(e?.message || "Error"))
        } finally {
            setSaving(false)
            window.setTimeout(() => setSaveOk(false), 1500)
        }
    }

    return {
        token,
        load,
        form,
        setForm,
        saving,
        saveError,
        saveOk,
        dirty,
        save,
    }
}
