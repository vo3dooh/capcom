import { useEffect, useMemo, useState } from "react";
import { HttpError } from "@/shared/api/http";
import { fetchOddsSportsMapped, OddsSportMapped } from "../api/oddsApi";

type Grouped = { group: string; items: OddsSportMapped[] };

export function useOddsSports() {
    const [items, setItems] = useState<OddsSportMapped[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        fetchOddsSportsMapped()
            .then((data) => {
                if (!alive) return;
                setItems(data.filter((x) => x.active));
            })
            .catch((e: unknown) => {
                if (!alive) return;
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить лиги");
            })
            .finally(() => {
                if (!alive) return;
                setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, []);

    const grouped = useMemo<Grouped[]>(() => {
        const map = new Map<string, OddsSportMapped[]>();
        for (const s of items) {
            const arr = map.get(s.group) ?? [];
            arr.push(s);
            map.set(s.group, arr);
        }

        const out: Grouped[] = Array.from(map.entries()).map(([group, list]) => ({
            group,
            items: list.slice().sort((a, b) => a.title.localeCompare(b.title)),
        }));

        out.sort((a, b) => a.group.localeCompare(b.group));
        return out;
    }, [items]);

    return { items, grouped, loading, error };
}