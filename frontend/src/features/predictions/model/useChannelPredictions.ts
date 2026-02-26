import { useCallback, useEffect, useState } from "react";
import { fetchChannelPredictions, PredictionItem } from "../api/predictionsApi";
import { HttpError } from "@/shared/api/http";

const PAGE_SIZE = 10;

export function useChannelPredictions(slug: string) {
    const [items, setItems] = useState<PredictionItem[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);

    const loadPage = useCallback((pageIndex: number) => {
        setLoading(true);
        setError(null);

        fetchChannelPredictions(slug, PAGE_SIZE, pageIndex * PAGE_SIZE)
            .then((result) => {
                setItems(result);
                setPage(pageIndex);
                setHasNextPage(result.length === PAGE_SIZE);
            })
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить прогнозы");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    const goToNextPage = useCallback(() => {
        if (loading || !hasNextPage) return;
        loadPage(page + 1);
    }, [hasNextPage, loadPage, loading, page]);

    const goToPrevPage = useCallback(() => {
        if (loading || page === 0) return;
        loadPage(page - 1);
    }, [loadPage, loading, page]);

    const reload = useCallback(() => {
        loadPage(0);
    }, [loadPage]);

    useEffect(() => {
        loadPage(0);
    }, [loadPage]);

    return {
        items,
        page,
        loading,
        error,
        hasNextPage,
        hasPrevPage: page > 0,
        reload,
        goToNextPage,
        goToPrevPage,
    };
}
