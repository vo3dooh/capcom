import { useEffect, useState } from "react";
import { ChannelListItem, fetchChannels } from "../api/channelsListApi";
import { HttpError } from "@/shared/api/http";

export function useChannelsList() {
    const [items, setItems] = useState<ChannelListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        fetchChannels(30, 0)
            .then((res) => {
                if (!alive) return;
                setItems(res);
            })
            .catch((e: unknown) => {
                if (!alive) return;
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить каналы");
            })
            .finally(() => {
                if (!alive) return;
                setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, []);

    return { items, loading, error };
}