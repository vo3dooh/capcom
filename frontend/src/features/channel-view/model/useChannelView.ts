import { useCallback, useEffect, useState } from "react";
import {
    ChannelViewModel,
    fetchChannel,
    subscribeToChannel,
    unsubscribeFromChannel,
} from "../api/channelViewApi";
import { HttpError } from "@/shared/api/http";

export function useChannelView(slug: string) {
    const [data, setData] = useState<ChannelViewModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const reload = useCallback(() => {
        setLoading(true);
        setError(null);

        fetchChannel(slug)
            .then(setData)
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить канал");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        reload();
    }, [reload]);

    const subscribe = useCallback(async () => {
        if (actionLoading) return;
        setActionError(null);
        setActionLoading(true);
        try {
            await subscribeToChannel(slug);
            setData((prev) => {
                if (!prev || prev.isMember) return prev;
                return { ...prev, isMember: true, membersCount: prev.membersCount + 1 };
            });
            reload();
        } catch (e) {
            if (e instanceof HttpError) setActionError(e.message);
            else setActionError("Не удалось подписаться на канал");
        } finally {
            setActionLoading(false);
        }
    }, [slug, reload, actionLoading]);

    const unsubscribe = useCallback(async () => {
        if (actionLoading) return;
        setActionError(null);
        setActionLoading(true);
        try {
            await unsubscribeFromChannel(slug);
            setData((prev) => {
                if (!prev || !prev.isMember) return prev;
                return { ...prev, isMember: false, membersCount: Math.max(0, prev.membersCount - 1) };
            });
            reload();
        } catch (e) {
            if (e instanceof HttpError) setActionError(e.message);
            else setActionError("Не удалось отписаться от канала");
        } finally {
            setActionLoading(false);
        }
    }, [slug, reload, actionLoading]);

    return { data, loading, error, subscribe, unsubscribe, actionLoading, actionError, reload };
}
