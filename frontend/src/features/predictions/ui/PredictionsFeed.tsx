import { useChannelPredictions } from "../model/useChannelPredictions";
import { PredictionCard } from "./PredictionCard";
import styles from "./PredictionsFeed.module.css";

export function PredictionsFeed({ slug }: { slug: string }) {
    const { items, loading, loadingMore, error, hasMore, loadMore } = useChannelPredictions(slug);

    if (loading) return <div className={styles.state}>Загрузка прогнозов…</div>;
    if (error && !items.length) return <div className={styles.stateError}>{error}</div>;
    if (!items.length) return <div className={styles.state}>Пока нет прогнозов</div>;

    return (
        <div className={styles.list}>
            {items.map((p) => (
                <PredictionCard key={p.id} item={p} />
            ))}
            {error && <div className={styles.stateError}>{error}</div>}
            {hasMore && (
                <button
                    className={styles.loadMoreBtn}
                    onClick={loadMore}
                    disabled={loadingMore}
                >
                    {loadingMore ? "Загрузка…" : "Загрузить больше"}
                </button>
            )}
        </div>
    );
}
