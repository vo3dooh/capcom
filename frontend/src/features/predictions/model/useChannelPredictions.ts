import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchChannelPredictions, PredictionItem } from "../api/predictionsApi";
import { HttpError } from "@/shared/api/http";

const PAGE_SIZE = 10;

const PAGE_LINKS_TO_SHOW = 4;

export function useChannelPredictions(slug: string) {
    const [items, setItems] = useState<PredictionItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPage = useCallback((pageIndex: number) => {
        setLoading(true);
        setError(null);

        fetchChannelPredictions(slug, PAGE_SIZE, (pageIndex - 1) * PAGE_SIZE)
            .then((result) => {
                setItems(result.items);
                setPage(result.pagination.currentPage);
                setTotalPages(result.pagination.totalPages);
                setTotalItems(result.pagination.total);
            })
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить прогнозы");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    const goToPage = useCallback((nextPage: number) => {
        if (loading) return;
        const targetPage = Math.min(Math.max(nextPage, 1), totalPages);
        if (targetPage === page) return;
        loadPage(targetPage);
    }, [loadPage, loading, page, totalPages]);

    const goToNextPage = useCallback(() => {
        goToPage(page + 1);
    }, [goToPage, page]);

    const goToPrevPage = useCallback(() => {
        goToPage(page - 1);
    }, [goToPage, page]);

    const reload = useCallback(() => {
        loadPage(1);
    }, [loadPage]);

    useEffect(() => {
        loadPage(1);
    }, [loadPage]);

    const visiblePages = useMemo(() => {
        if (totalPages <= PAGE_LINKS_TO_SHOW) {
            return Array.from({ length: totalPages }, (_, idx) => idx + 1);
        }

        const windowStart = Math.max(1, Math.min(page - 1, totalPages - PAGE_LINKS_TO_SHOW + 1));
        return Array.from({ length: PAGE_LINKS_TO_SHOW }, (_, idx) => windowStart + idx);
    }, [page, totalPages]);

    return {
        items,
        page,
        totalPages,
        totalItems,
        visiblePages,
        loading,
        error,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        isFirstPageInView: visiblePages[0] === 1,
        isLastPageInView: visiblePages[visiblePages.length - 1] === totalPages,
        reload,
        goToPage,
        goToNextPage,
        goToPrevPage,
    };
}
