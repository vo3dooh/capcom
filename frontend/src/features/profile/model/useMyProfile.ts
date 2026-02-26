import { useEffect, useState } from "react"
import { authSession } from "@/features/auth/model/authSession"
import { profileApi, type ProfileResponse } from "@/features/profile/api/profileApi"

type State =
    | { status: "idle"; data: null; error: null }
    | { status: "loading"; data: null; error: null }
    | { status: "ready"; data: ProfileResponse; error: null }
    | { status: "error"; data: null; error: string }

export function useMyProfile() {
    const snap = authSession.getSnapshot()
    const token = snap.accessToken

    const [state, setState] = useState<State>(() => {
        if (!token) return { status: "idle", data: null, error: null }
        return { status: "loading", data: null, error: null }
    })

    useEffect(() => {
        let alive = true

        if (!token) {
            setState({ status: "idle", data: null, error: null })
            return
        }

        setState({ status: "loading", data: null, error: null })

        profileApi
            .my(token)
            .then((data) => {
                if (!alive) return
                setState({ status: "ready", data, error: null })
            })
            .catch((e: any) => {
                if (!alive) return
                setState({ status: "error", data: null, error: String(e?.message || "Error") })
            })

        return () => {
            alive = false
        }
    }, [token])

    return state
}
