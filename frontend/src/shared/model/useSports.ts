import { useEffect, useState } from "react";
import { fetchSports, SportItem } from "@/shared/api/sportsApi";
import { HttpError } from "@/shared/api/http";

export function useSports() {
    const [items, setItems] = useState<SportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        fetchSports()
            .then((res) => {
                if (!alive) return;
                setItems(res);
            })
            .catch((e: unknown) => {
                if (!alive) return;
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить список спортов");
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