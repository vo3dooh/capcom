import { authApi, type MeResponse } from "@/features/auth/api/authApi";

type Status = "guest" | "loading" | "authed";

type Snapshot = {
    status: Status;
    accessToken: string | null;
    user: MeResponse | null;
};

const STORAGE_KEY = "token";

const initialToken = localStorage.getItem(STORAGE_KEY);

let state: Snapshot = {
    status: initialToken ? "loading" : "guest",
    accessToken: initialToken,
    user: null,
};

const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

function setState(next: Partial<Snapshot>) {
    state = { ...state, ...next };
    emit();
}

export const authSession = {
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getSnapshot(): Snapshot {
        return state;
    },

    setAccessToken(token: string) {
        localStorage.setItem(STORAGE_KEY, token);
        setState({ accessToken: token, status: "loading", user: null });
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
        setState({ accessToken: null, user: null, status: "guest" });
    },

    async init() {
        const token = state.accessToken;
        if (!token) {
            setState({ status: "guest", user: null });
            return;
        }

        setState({ status: "loading" });

        try {
            const user = await authApi.me(token);
            setState({ status: "authed", user });
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            setState({ status: "guest", accessToken: null, user: null });
        }
    },

    async refresh() {
        const token = state.accessToken;
        if (!token) return;

        setState({ status: "loading" });

        try {
            const user = await authApi.me(token);
            setState({ status: "authed", user });
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            setState({ status: "guest", accessToken: null, user: null });
        }
    },
};
