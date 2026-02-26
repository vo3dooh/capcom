import { useCallback, useEffect, useState } from "react";
import { HttpError } from "@/shared/api/http";
import { fetchOddsEvents, OddsEvent } from "../api/oddsApi";

export function useOddsEvents(params: { sportKey: string | null }) {
    const [items, setItems] = useState<OddsEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        if (!params.sportKey) return;

        setLoading(true);
        setError(null);

        fetchOddsEvents({
            sportKey: params.sportKey,
            regions: "eu",
            markets: "h2h",
            oddsFormat: "decimal",
            dateFormat: "iso",
        })
            .then((data) => setItems(data))
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить события");
            })
            .finally(() => setLoading(false));
    }, [params.sportKey]);

    useEffect(() => {
        setItems([]);
        setError(null);

        if (!params.sportKey) return;
        load();
    }, [params.sportKey, load]);

    return { items, loading, error, reload: load };
}