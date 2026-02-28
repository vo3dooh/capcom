import {
    BarChart3,
    Percent,
    Activity,
    TrendingUp,
    Wallet,
    ShieldAlert,
    Sigma,
    PlusCircle,
    MinusCircle,
    RotateCcw,
} from "lucide-react";
import { useChannelStats } from "../model/useChannelStats";
import styles from "./ChannelStatsBlock.module.css";

type StatItemProps = {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    meta?: string;
};

function StatItem({ icon, title, value, meta }: StatItemProps) {
    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div className={styles.iconWrap}>{icon}</div>
                <div className={styles.title}>{title}</div>
            </div>
            <div className={styles.value}>{value}</div>
            <div className={styles.meta}>{meta ?? " "}</div>
        </div>
    );
}

function OutcomesStat({
                          wins,
                          losses,
                          voids,
                          loading,
                      }: {
    wins: number;
    losses: number;
    voids: number;
    loading: boolean;
}) {
    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div className={styles.iconWrap}>
                    <Sigma size={16} />
                </div>
                <div className={styles.title}>Статистика исходов</div>
            </div>

            <div className={`${styles.value} ${styles.outcomesValue}`}>
                <div className={styles.outcomeItem}>
                    <PlusCircle size={12} className={styles.winIcon} />
                    <span className={styles.winValue}>{loading ? "..." : wins}</span>
                </div>

                <div className={styles.outcomesDivider} />

                <div className={styles.outcomeItem}>
                    <MinusCircle size={12} className={styles.lossIcon} />
                    <span className={styles.lossValue}>{loading ? "..." : losses}</span>
                </div>

                <div className={styles.outcomesDivider} />

                <div className={styles.outcomeItem}>
                    <RotateCcw size={12} className={styles.voidIcon} />
                    <span className={styles.voidValue}>{loading ? "..." : voids}</span>
                </div>
            </div>

            <div className={styles.meta}>Только рассчитанные</div>
        </div>
    );
}

function SplitValue({
                        left,
                        right,
                        loading,
                    }: {
    left: string | number;
    right: string | number;
    loading: boolean;
}) {
    return (
        <div className={`${styles.value} ${styles.splitValue}`}>
            <span className={styles.splitPart}>{loading ? "..." : left}</span>
            <span className={styles.splitDivider} />
            <span className={styles.splitPart}>{loading ? "..." : right}</span>
        </div>
    );
}

function StakeAndOddsStat({
                              stakePercent,
                              odds,
                              loading,
                          }: {
    stakePercent: string;
    odds: string;
    loading: boolean;
}) {
    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div className={styles.iconWrap}>
                    <Activity size={16} />
                </div>
                <div className={styles.title}>Средний % ставки и коэффициент</div>
            </div>
            <SplitValue left={stakePercent} right={odds} loading={loading} />
            <div className={styles.meta}>% ставки | коэф.</div>
        </div>
    );
}

function TotalProfitStat({
                             profitMoney,
                             profitPercent,
                             loading,
                         }: {
    profitMoney: string;
    profitPercent: string;
    loading: boolean;
}) {
    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div className={styles.iconWrap}>
                    <Wallet size={16} />
                </div>
                <div className={styles.title}>Общая прибыль</div>
            </div>
            <SplitValue left={profitMoney} right={profitPercent} loading={loading} />
            <div className={styles.meta}>$ | %</div>
        </div>
    );
}

export function ChannelStatsBlock({ slug }: { slug: string }) {
    const { stats, loading, error } = useChannelStats(slug);

    if (error && !stats) return <div className={styles.stateError}>{error}</div>;

    const totalPredictions = stats ? stats.totalPredictions : loading ? "..." : 0;

    const hitRate = stats ? `${stats.hitRatePercent.toFixed(1)}%` : loading ? "..." : "0.0%";

    const avgStake = stats ? `${stats.averageStakePercent.toFixed(1)}%` : "0.0%";
    const avgOdds = stats ? stats.averageOdds.toFixed(2) : "0.00";

    const roi = stats ? `${stats.roiPercent.toFixed(1)}%` : loading ? "..." : "0.0%";

    const profitMoney = stats ? `${stats.totalProfit.toFixed(2)}$` : "0.00$";
    const profitPercent = stats ? `${stats.roiPercent.toFixed(1)}%` : "0.0%";

    const maxDrawdown = stats ? stats.maxDrawdown.toFixed(2) : loading ? "..." : "0.00";
    const volatility = stats ? stats.volatility.toFixed(2) : loading ? "..." : "0.00";

    const wins = stats ? stats.outcomes.wins : 0;
    const losses = stats ? stats.outcomes.losses : 0;
    const voids = stats ? stats.outcomes.voids : 0;

    return (
        <div className={styles.wrap}>
            <StatItem icon={<BarChart3 size={16} />} title="Общее количество прогнозов" value={totalPredictions} meta="Всего создано" />
            <OutcomesStat wins={wins} losses={losses} voids={voids} loading={loading} />
            <StatItem icon={<TrendingUp size={16} />} title="ROI" value={roi} meta="Доходность" />
            <TotalProfitStat profitMoney={profitMoney} profitPercent={profitPercent} loading={loading} />

            <StakeAndOddsStat stakePercent={avgStake} odds={avgOdds} loading={loading} />
            <StatItem icon={<Percent size={16} />} title="Проходимость" value={hitRate} meta="W / (W+L)" />
            <StatItem icon={<ShieldAlert size={16} />} title="Максимальная просадка" value={maxDrawdown} meta="От пика до минимума" />
            <StatItem icon={<Activity size={16} />} title="Волатильность" value={volatility} meta="Разброс результата" />
        </div>
    );
}