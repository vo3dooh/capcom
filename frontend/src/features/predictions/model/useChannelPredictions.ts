import { useCallback, useEffect, useState } from "react";
import { fetchChannelPredictions, PredictionItem } from "../api/predictionsApi";
import { HttpError } from "@/shared/api/http";

export function useChannelPredictions(slug: string) {
    const [items, setItems] = useState<PredictionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(() => {
        setLoading(true);
        setError(null);

        fetchChannelPredictions(slug, 30, 0)
            .then(setItems)
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить прогнозы");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { items, loading, error, reload };
}