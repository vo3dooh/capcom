import { useChannelStats } from "../model/useChannelStats";
import styles from "./ChannelStatsBlock.module.css";

function renderStreakText(type: 'win' | 'loss' | 'none', count: number) {
    if (type === 'none' || count === 0) return '—';
    return `${type === 'win' ? 'W' : 'L'}${count}`;
}

export function ChannelStatsBlock({ slug }: { slug: string }) {
    const { stats, loading, error } = useChannelStats(slug);

    if (error && !stats) return <div className={styles.stateError}>{error}</div>;

    return (
        <div className={styles.row}>
            <div className={styles.card}>
                <div className={styles.label}>Всего прогнозов</div>
                <div className={styles.value}>{stats ? stats.totalPredictions : (loading ? '...' : 0)}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Исходы (W/L/V)</div>
                <div className={styles.value}>
                    {stats ? `${stats.outcomes.wins}/${stats.outcomes.losses}/${stats.outcomes.voids}` : (loading ? '...' : '0/0/0')}
                </div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Проходимость</div>
                <div className={styles.value}>{stats ? `${stats.hitRatePercent.toFixed(1)}%` : (loading ? '...' : '0.0%')}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Средняя ставка от БР</div>
                <div className={styles.value}>{stats ? `${stats.averageStakePercent.toFixed(1)}%` : (loading ? '...' : '0.0%')}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Общая прибыль</div>
                <div className={styles.value}>{stats ? stats.totalProfit.toFixed(2) : (loading ? '...' : '0.00')}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>ROI</div>
                <div className={styles.value}>{stats ? `${stats.roiPercent.toFixed(1)}%` : (loading ? '...' : '0.0%')}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Макс. просадка</div>
                <div className={styles.value}>{stats ? stats.maxDrawdown.toFixed(2) : (loading ? '...' : '0.00')}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Текущая серия</div>
                <div className={styles.value}>{stats ? renderStreakText(stats.currentStreak.type, stats.currentStreak.count) : (loading ? '...' : '—')}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Средний коэф.</div>
                <div className={styles.value}>{stats ? stats.averageOdds.toFixed(2) : (loading ? '...' : '0.00')}</div>
            </div>
            <div className={styles.card}>
                <div className={styles.label}>Волатильность</div>
                <div className={styles.value}>{stats ? stats.volatility.toFixed(2) : (loading ? '...' : '0.00')}</div>
            </div>
        </div>
    );
}
