import { useCallback, useEffect, useState } from "react";
import { HttpError } from "@/shared/api/http";
import { fetchOddsForEvent, OddsEventOdds } from "../api/oddsApi";

export function useOddsEventOdds(params: { sportKey: string | null; eventId: string | null }) {
    const [data, setData] = useState<OddsEventOdds | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!params.sportKey || !params.eventId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchOddsForEvent({
                eventId: params.eventId,
                sportKey: params.sportKey,
                regions: "eu",
                markets: "h2h,spreads,totals",
                oddsFormat: "decimal",
                dateFormat: "iso",
            });
            setData(res);
        } catch (e: unknown) {
            if (e instanceof HttpError) setError(e.message);
            else setError("Не удалось загрузить коэффициенты");
        } finally {
            setLoading(false);
        }
    }, [params.sportKey, params.eventId]);

    useEffect(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, [params.sportKey, params.eventId]);

    return { data, loading, error, load };
}