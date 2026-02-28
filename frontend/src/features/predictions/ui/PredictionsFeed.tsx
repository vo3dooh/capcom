import { ChevronLeft, ChevronRight } from "lucide-react";

import { useChannelPredictions } from "../model/useChannelPredictions";
import { useChannelStats } from "../model/useChannelStats";
import { PredictionCard } from "./PredictionCard";
import styles from "./PredictionsFeed.module.css";

function renderStreakText(type: 'win' | 'loss' | 'none', count: number) {
    if (type === 'none' || count === 0) return '—';
    return `${type === 'win' ? 'W' : 'L'}${count}`;
}

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

    const { stats, loading: statsLoading } = useChannelStats(slug);

    if (loading && !items.length) return <div className={styles.state}>Загрузка прогнозов…</div>;
    if (error && !items.length) return <div className={styles.stateError}>{error}</div>;
    if (!items.length) return <div className={styles.state}>Пока нет прогнозов</div>;

    return (
        <div className={styles.list}>
            <div className={styles.channelStatsRow}>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Всего прогнозов</div>
                    <div className={styles.channelStatValue}>{stats ? stats.totalPredictions : (statsLoading ? '...' : 0)}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Исходы (W/L/V)</div>
                    <div className={styles.channelStatValue}>
                        {stats ? `${stats.outcomes.wins}/${stats.outcomes.losses}/${stats.outcomes.voids}` : (statsLoading ? '...' : '0/0/0')}
                    </div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Проходимость</div>
                    <div className={styles.channelStatValue}>{stats ? `${stats.hitRatePercent.toFixed(1)}%` : (statsLoading ? '...' : '0.0%')}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Средняя ставка от БР</div>
                    <div className={styles.channelStatValue}>{stats ? `${stats.averageStakePercent.toFixed(1)}%` : (statsLoading ? '...' : '0.0%')}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Общая прибыль</div>
                    <div className={styles.channelStatValue}>{stats ? stats.totalProfit.toFixed(2) : (statsLoading ? '...' : '0.00')}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>ROI</div>
                    <div className={styles.channelStatValue}>{stats ? `${stats.roiPercent.toFixed(1)}%` : (statsLoading ? '...' : '0.0%')}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Макс. просадка</div>
                    <div className={styles.channelStatValue}>{stats ? stats.maxDrawdown.toFixed(2) : (statsLoading ? '...' : '0.00')}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Текущая серия</div>
                    <div className={styles.channelStatValue}>{stats ? renderStreakText(stats.currentStreak.type, stats.currentStreak.count) : (statsLoading ? '...' : '—')}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Средний коэф.</div>
                    <div className={styles.channelStatValue}>{stats ? stats.averageOdds.toFixed(2) : (statsLoading ? '...' : '0.00')}</div>
                </div>
                <div className={styles.channelStatCard}>
                    <div className={styles.channelStatLabel}>Волатильность</div>
                    <div className={styles.channelStatValue}>{stats ? stats.volatility.toFixed(2) : (statsLoading ? '...' : '0.00')}</div>
                </div>
            </div>

            {items.map((p) => (
                <PredictionCard key={p.id} item={p} />
            ))}

            <div className={styles.paginationControls}>

                <button type="button" className={styles.pageBtn} onClick={goToPrevPage} disabled={!hasPrevPage}>
                    <ChevronLeft size={16} />
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
                    <ChevronRight size={16} />
                </button>

            </div>

            {loading && <div className={styles.loadingHint}>Загружаем следующую страницу…</div>}
            {error && <div className={styles.stateError}>{error}</div>}
        </div>
    );
}
