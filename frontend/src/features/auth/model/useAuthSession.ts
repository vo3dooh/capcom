import { useEffect, useSyncExternalStore } from "react";
import { authSession } from "./authSession";

export function useAuthSession() {
    const snap = useSyncExternalStore(authSession.subscribe, authSession.getSnapshot, authSession.getSnapshot);

    useEffect(() => {
        if (snap.status === "loading") authSession.init();
    }, [snap.status]);

    return snap;
}
