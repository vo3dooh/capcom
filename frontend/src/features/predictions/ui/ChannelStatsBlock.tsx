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
    BadgeInfo,
    Cloud,
    CloudCheck,
    CloudOff,
    ChartNoAxesCombined,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useChannelStats } from "../model/useChannelStats";
import styles from "./ChannelStatsBlock.module.css";

const ROI_HEAD_EXCEPTIONAL_PRESETS = [
    "roiHeadIconExceptionalV1",
    "roiHeadIconExceptionalV2",
    "roiHeadIconExceptionalV3",
    "roiHeadIconExceptionalV4",
    "roiHeadIconExceptionalV5",
    "roiHeadIconExceptionalV6",
] as const;

type RoiHeadExceptionalPreset = (typeof ROI_HEAD_EXCEPTIONAL_PRESETS)[number];

function pickRandomRoiHeadExceptionalPreset(exclude?: RoiHeadExceptionalPreset): RoiHeadExceptionalPreset {
    const options = exclude
        ? ROI_HEAD_EXCEPTIONAL_PRESETS.filter((preset) => preset !== exclude)
        : ROI_HEAD_EXCEPTIONAL_PRESETS;
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
}

function getRandomRoiPresetSwitchDelay(): number {
    return 9000 + Math.floor(Math.random() * 5000);
}

type StatItemProps = {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    meta?: React.ReactNode;
    helpText?: string;
    iconWrapClassName?: string;
};

type HelpTipProps = {
    text: string;
};

function HelpTip({ text }: HelpTipProps) {
    return (
        <button type="button" className={styles.helpButton} aria-label={`Подсказка: ${text}`}>
            <BadgeInfo size={14} />
            <span className={styles.helpTooltip} role="tooltip">
                {text}
            </span>
        </button>
    );
}

function StatItem({ icon, title, value, meta, helpText, iconWrapClassName }: StatItemProps) {
    return (
        <div className={styles.statItem}>
            {helpText ? <HelpTip text={helpText} /> : null}
            <div className={styles.statHead}>
                <div className={`${styles.iconWrap} ${iconWrapClassName ?? ""}`.trim()}>{icon}</div>
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
    const total = wins + losses + voids;
    const winsPct = total > 0 ? (wins / total) * 100 : 0;
    const lossesPct = total > 0 ? (losses / total) * 100 : 0;
    const voidsPct = total > 0 ? (voids / total) * 100 : 0;

    const isNeutralBar = loading || total === 0;
    const neutralSegmentWidth = isNeutralBar ? 100 : 0;
    const firstSegmentWidth = isNeutralBar ? 0 : winsPct;
    const secondSegmentWidth = isNeutralBar ? 0 : lossesPct;
    const thirdSegmentWidth = isNeutralBar ? 0 : voidsPct;

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

            <div className={styles.outcomesBarWrap}>
                <svg
                    className={styles.outcomesBar}
                    width="100%"
                    height="8"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <rect x="0" y="0" width={neutralSegmentWidth} height="8" className={styles.outcomesBarNeutral} />
                    <rect x="0" y="0" width={firstSegmentWidth} height="8" className={styles.outcomesBarWin} />
                    <rect x={firstSegmentWidth} y="0" width={secondSegmentWidth} height="8" className={styles.outcomesBarLoss} />
                    <rect
                        x={firstSegmentWidth + secondSegmentWidth}
                        y="0"
                        width={thirdSegmentWidth}
                        height="8"
                        className={styles.outcomesBarVoid}
                    />
                </svg>
            </div>
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

function PredictionsAndTurnoverStat({
                                        totalPredictions,
                                        turnoverPercent,
                                        activeDays30d,
                                        loading,
                                    }: {
    totalPredictions: number;
    turnoverPercent: string;
    activeDays30d: number;
    loading: boolean;
}) {
    const activity = loading
        ? {
            label: "...",
            icon: <Cloud size={12} />,
            iconClassName: styles.activityIconLoading,
        }
        : activeDays30d < 10
            ? {
                label: "Низкая активность",
                icon: <CloudOff size={12} />,
                iconClassName: styles.activityIconLow,
            }
            : activeDays30d < 20
                ? {
                    label: "Средняя активность",
                    icon: <Cloud size={12} />,
                    iconClassName: styles.activityIconMedium,
                }
                : {
                    label: "Высокая активность",
                    icon: <CloudCheck size={12} />,
                    iconClassName: styles.activityIconHigh,
                };

    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div className={styles.iconWrap}>
                    <BarChart3 size={16} />
                </div>
                <div className={styles.title}>Количество прогнозов и оборот</div>
            </div>
            <SplitValue left={totalPredictions} right={turnoverPercent} loading={loading} />
            <div className={styles.metaGroup}>
                <button
                    type="button"
                    className={styles.activityStatusButton}
                    aria-label="Уровень активности канала. Рассчитывается по активности канала за последние 30 дней."
                >
                    <span className={`${styles.activityIcon} ${activity.iconClassName}`}>{activity.icon}</span>
                    <span className={styles.activityStatusText}>{activity.label}</span>
                    <span className={styles.activityTooltip} role="tooltip">
                       Этот показатель отражает регулярность работы канала. Рассчитывается по числу активных дней за последние 30 дней и показывает, насколько стабильно публикуются прогнозы.
                    </span>
                </button>
            </div>
        </div>
    );
}

function RoiLevelIndicator({ roiPercent, loading }: { roiPercent: number; loading: boolean }) {
    const roiLevel = loading
        ? {
            label: "...",
            iconClassName: styles.roiIconGray,
        }
        : roiPercent < 0
            ? {
                label: "Убыточная доходность",
                iconClassName: styles.roiIconRed,
            }
            : roiPercent < 2
                ? {
                    label: "Слабая доходность",
                    iconClassName: styles.roiIconGray,
                }
                : roiPercent < 5
                    ? {
                        label: "Уверенная доходность",
                        iconClassName: styles.roiIconLightGreen,
                    }
                    : roiPercent < 10
                        ? {
                            label: "Высокая доходность",
                            iconClassName: styles.roiIconGreen,
                        }
                        : {
                            label: "Пиковая доходность",
                            iconClassName: `${styles.roiIconGreen} ${styles.roiIconExceptional}`,
                        };

    return (
        <button
            type="button"
            className={styles.roiStatusButton}
            aria-label="Уровень доходности канала. Рассчитывается по ROI за выбранный период."
        >
            <span className={`${styles.roiIcon} ${roiLevel.iconClassName}`}>
                <ChartNoAxesCombined size={12} />
            </span>
            <span className={styles.roiStatusText}>{roiLevel.label}</span>
            <span className={styles.roiTooltip} role="tooltip">
                Уровень доходности рассчитывается по ROI за выбранный период. Чем выше ROI, тем выше уровень.
            </span>
        </button>
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

function MaxDrawdownStat({
                             drawdownMoney,
                             drawdownPercent,
                             loading,
                             helpText,
                         }: {
    drawdownMoney: string;
    drawdownPercent: string;
    loading: boolean;
    helpText: string;
}) {
    return (
        <div className={styles.statItem}>
            <HelpTip text={helpText} />
            <div className={styles.statHead}>
                <div className={styles.iconWrap}>
                    <ShieldAlert size={16} />
                </div>
                <div className={styles.title}>Максимальная просадка</div>
            </div>
            <SplitValue left={drawdownMoney} right={drawdownPercent} loading={loading} />
            <div className={styles.meta}>$ | % от банкролла</div>
        </div>
    );
}

export function ChannelStatsBlock({ slug }: { slug: string }) {
    const { stats, loading, error } = useChannelStats(slug);
    const [roiExceptionalPreset, setRoiExceptionalPreset] = useState<RoiHeadExceptionalPreset>(() =>
        pickRandomRoiHeadExceptionalPreset(),
    );

    if (error && !stats) return <div className={styles.stateError}>{error}</div>;

    const totalPredictions = stats ? stats.totalPredictions : 0;
    const turnoverPercent = stats ? `${stats.turnoverPercent.toFixed(1)}%` : loading ? "..." : "0.0%";
    const activeDays30d = stats ? stats.activeDays30d : 0;

    const hitRate = stats ? `${stats.hitRatePercent.toFixed(1)}%` : loading ? "..." : "0.0%";

    const avgStake = stats ? `${stats.averageStakePercent.toFixed(1)}%` : "0.0%";
    const avgOdds = stats ? stats.averageOdds.toFixed(2) : "0.00";

    const roiPercent = stats ? stats.roiPercent : 0;
    const roi = stats ? `${stats.roiPercent.toFixed(1)}%` : loading ? "..." : "0.0%";
    const isExceptionalRoi = !loading && roiPercent >= 10;

    useEffect(() => {
        setRoiExceptionalPreset(pickRandomRoiHeadExceptionalPreset());
    }, [slug]);

    useEffect(() => {
        if (!isExceptionalRoi) {
            return;
        }

        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const scheduleNextSwitch = () => {
            timeoutId = setTimeout(() => {
                setRoiExceptionalPreset((currentPreset) => pickRandomRoiHeadExceptionalPreset(currentPreset));
                scheduleNextSwitch();
            }, getRandomRoiPresetSwitchDelay());
        };

        scheduleNextSwitch();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isExceptionalRoi, slug]);

    const profitMoney = stats ? `${stats.totalProfit.toFixed(2)}$` : "0.00$";
    const profitPercentAllTime = stats
        ? `${(stats.startingBankroll > 0 ? (stats.totalProfit / stats.startingBankroll) * 100 : 0).toFixed(1)}%`
        : loading
            ? "..."
            : "0.0%";

    const maxDrawdownMoney = stats ? `${stats.maxDrawdown.toFixed(2)}$` : "0.00$";
    const maxDrawdownPercent = stats && stats.startingBankroll > 0 ? `${((stats.maxDrawdown / stats.startingBankroll) * 100).toFixed(1)}%` : "0.0%";
    const volatility = stats ? stats.volatility.toFixed(2) : loading ? "..." : "0.00";

    const wins = stats ? stats.outcomes.wins : 0;
    const losses = stats ? stats.outcomes.losses : 0;
    const voids = stats ? stats.outcomes.voids : 0;

    return (
        <div className={styles.wrap}>
            <PredictionsAndTurnoverStat
                totalPredictions={totalPredictions}
                turnoverPercent={turnoverPercent}
                activeDays30d={activeDays30d}
                loading={loading}
            />
            <OutcomesStat wins={wins} losses={losses} voids={voids} loading={loading} />
            <StatItem
                icon={<TrendingUp size={16} />}
                title="ROI"
                value={roi}
                meta={<RoiLevelIndicator roiPercent={roiPercent} loading={loading} />}
                helpText="ROI (Return on Investment) — доходность на оборот: (общая прибыль / общий оборот ставок) × 100%. Показывает эффективность ставок на дистанции."
                iconWrapClassName={
                    isExceptionalRoi
                        ? `${styles.roiHeadIconExceptional} ${styles[roiExceptionalPreset as keyof typeof styles]}`
                        : undefined
                }
            />
            <TotalProfitStat profitMoney={profitMoney} profitPercent={profitPercentAllTime} loading={loading} />

            <StakeAndOddsStat stakePercent={avgStake} odds={avgOdds} loading={loading} />
            <StatItem icon={<Percent size={16} />} title="Проходимость" value={hitRate} meta="W / (W+L)" />
            <MaxDrawdownStat
                drawdownMoney={maxDrawdownMoney}
                drawdownPercent={maxDrawdownPercent}
                loading={loading}
                helpText="Максимальное падение банкролла от локального пика до минимума за период."
            />
            <StatItem
                icon={<Activity size={16} />}
                title="Волатильность"
                value={volatility}
                meta="Разброс результата"
                helpText="Разброс результата: чем выше значение, тем сильнее колебания прибыли/убытка."
            />
        </div>
    );
}
