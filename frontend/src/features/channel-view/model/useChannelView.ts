import { useCallback, useEffect, useState } from "react";
import { ChannelViewModel, fetchChannel, joinChannel, leaveChannel } from "../api/channelViewApi";
import { HttpError } from "@/shared/api/http";

export function useChannelView(slug: string) {
    const [data, setData] = useState<ChannelViewModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

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

    const join = useCallback(async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await joinChannel(slug);
            reload();
        } finally {
            setActionLoading(false);
        }
    }, [slug, reload, actionLoading]);

    const leave = useCallback(async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await leaveChannel(slug);
            reload();
        } finally {
            setActionLoading(false);
        }
    }, [slug, reload, actionLoading]);

    return { data, loading, error, join, leave, actionLoading, reload };
}