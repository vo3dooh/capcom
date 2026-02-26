import { useCallback, useEffect, useState } from "react";
import { fetchChannelPredictions, PredictionItem } from "../api/predictionsApi";
import { HttpError } from "@/shared/api/http";

const PAGE_SIZE = 10;

export function useChannelPredictions(slug: string) {
    const [items, setItems] = useState<PredictionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const reload = useCallback(() => {
        setLoading(true);
        setError(null);
        setHasMore(false);

        fetchChannelPredictions(slug, PAGE_SIZE, 0)
            .then((next) => {
                setItems(next);
                setHasMore(next.length === PAGE_SIZE);
            })
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить прогнозы");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    const loadMore = useCallback(() => {
        if (loading || loadingMore || !hasMore) return;

        setLoadingMore(true);
        setError(null);

        fetchChannelPredictions(slug, PAGE_SIZE, items.length)
            .then((next) => {
                setItems((prev) => [...prev, ...next]);
                setHasMore(next.length === PAGE_SIZE);
            })
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить прогнозы");
            })
            .finally(() => setLoadingMore(false));
    }, [hasMore, items.length, loading, loadingMore, slug]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { items, loading, loadingMore, error, hasMore, reload, loadMore };
}
