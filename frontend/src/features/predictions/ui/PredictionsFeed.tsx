import { useChannelPredictions } from "../model/useChannelPredictions";
import { PredictionCard } from "./PredictionCard";
import styles from "./PredictionsFeed.module.css";
import { useState } from "react";

export function PredictionsFeed({ slug }: { slug: string }) {
    const { items, loading, error } = useChannelPredictions(slug);
    const [showAll, setShowAll] = useState(false);

    if (loading) return <div className={styles.state}>Загрузка прогнозов…</div>;
    if (error) return <div className={styles.stateError}>{error}</div>;
    if (!items.length) return <div className={styles.state}>Пока нет прогнозов</div>;

    const visiblePredictions = showAll ? items : items.slice(0, 10);

    return (
        <div className={styles.list}>
            {visiblePredictions.map((p) => (
                <PredictionCard key={p.id} item={p} />
            ))}
            {!showAll && items.length > 10 && (
                <button
                    className={styles.showMoreBtn}
                    onClick={() => setShowAll(true)}
                >
                    Показать ещё
                </button>
            )}
            {showAll && (
                <button
                    className={styles.showLessBtn}
                    onClick={() => setShowAll(false)}
                >
                    Скрыть
                </button>
            )}
        </div>
    );
}