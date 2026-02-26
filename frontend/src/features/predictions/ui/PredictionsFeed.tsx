import { ChevronLeft, ChevronRight } from "lucide-react";

import { useChannelPredictions } from "../model/useChannelPredictions";
import { PredictionCard } from "./PredictionCard";
import styles from "./PredictionsFeed.module.css";

export function PredictionsFeed({ slug }: { slug: string }) {
    const {
        items,
        page,
        totalPages,
        totalItems,
        visiblePages,
        loading,
        error,
        hasNextPage,
        hasPrevPage,
        isFirstPageInView,
        isLastPageInView,
        goToPage,
        goToNextPage,
        goToPrevPage,
    } = useChannelPredictions(slug);

    if (loading && !items.length) return <div className={styles.state}>Загрузка прогнозов…</div>;
    if (error && !items.length) return <div className={styles.stateError}>{error}</div>;
    if (!items.length) return <div className={styles.state}>Пока нет прогнозов</div>;

    return (
        <div className={styles.list}>
            {items.map((p) => (
                <PredictionCard key={p.id} item={p} />
            ))}

            <div className={styles.paginationControls}>

                <button type="button" className={styles.pageBtn} onClick={goToPrevPage} disabled={!hasPrevPage}>
                    <ChevronLeft size={24} />
                </button>

                {!isFirstPageInView && (
                    <>
                        <button type="button" className={styles.pageNumberBtn} onClick={() => goToPage(1)}>
                            1
                        </button>
                        <span className={styles.ellipsis}>…</span>
                    </>
                )}

                {visiblePages.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        className={pageNumber === page ? `${styles.pageNumberBtn} ${styles.pageNumberBtnActive}` : styles.pageNumberBtn}
                        onClick={() => goToPage(pageNumber)}
                        disabled={pageNumber === page}
                        aria-current={pageNumber === page ? "page" : undefined}
                    >
                        {pageNumber}
                    </button>
                ))}

                {!isLastPageInView && (
                    <>
                        <span className={styles.ellipsis}>…</span>
                        <button type="button" className={styles.pageNumberBtn} onClick={() => goToPage(totalPages)}>
                            {totalPages}
                        </button>
                    </>
                )}

                <button type="button" className={styles.pageBtn} onClick={goToNextPage} disabled={!hasNextPage}>
                    <ChevronRight size={24} />
                </button>
                
            </div>

            {loading && <div className={styles.loadingHint}>Загружаем следующую страницу…</div>}
            {error && <div className={styles.stateError}>{error}</div>}
        </div>
    );
}
