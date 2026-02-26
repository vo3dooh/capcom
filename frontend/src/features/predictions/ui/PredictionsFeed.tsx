import { useChannelPredictions } from "../model/useChannelPredictions";
import { PredictionCard } from "./PredictionCard";
import styles from "./PredictionsFeed.module.css";

export function PredictionsFeed({ slug }: { slug: string }) {
    const {
        items,
        page,
        loading,
        error,
        hasNextPage,
        hasPrevPage,
        goToNextPage,
        goToPrevPage,
    } = useChannelPredictions(slug);

    if (loading) return <div className={styles.state}>Загрузка прогнозов…</div>;
    if (error) return <div className={styles.stateError}>{error}</div>;
    if (!items.length) return <div className={styles.state}>Пока нет прогнозов</div>;

    return (
        <div className={styles.list}>
            {items.map((p) => (
                <PredictionCard key={p.id} item={p} />
            ))}

            <div className={styles.paginationControls}>
                <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={goToPrevPage}
                    disabled={!hasPrevPage}
                >
                    Предыдущая страница
                </button>

                <span className={styles.pageLabel}>Страница {page + 1}</span>

                <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                >
                    Следующая страница
                </button>
            </div>
        </div>
    );
}
