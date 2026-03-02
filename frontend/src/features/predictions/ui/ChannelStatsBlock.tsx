import {
    BarChart3,
    Percent,
    Activity,
    ChartBarStacked,
    PieChart,
    TrendingUp,
    TrendingUpDown,
    ArrowUp,
    ArrowDown,
    Wallet,
    ShieldAlert,
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

const ROI_HEAD_BG_PRESETS = [
    "roiHeadBgPreset1",
    "roiHeadBgPreset2",
    "roiHeadBgPreset3",
    "roiHeadBgPreset4",
    "roiHeadBgPreset5",
    "roiHeadBgPreset6",
    "roiHeadBgPreset7",
    "roiHeadBgPreset8",
] as const;

type RoiHeadBgPreset = (typeof ROI_HEAD_BG_PRESETS)[number];

type RoiHeadBgState = {
    activeLayer: "A" | "B" | null;
    presetA: RoiHeadBgPreset;
    presetB: RoiHeadBgPreset;
};

function pickRandomRoiHeadBgPreset(exclude?: RoiHeadBgPreset): RoiHeadBgPreset {
    const options = exclude ? ROI_HEAD_BG_PRESETS.filter((preset) => preset !== exclude) : ROI_HEAD_BG_PRESETS;
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
}

function getRandomRoiPresetSwitchInterval(): number {
    return 10000 + Math.floor(Math.random() * 4001);
}

function getRandomRoiPresetSwitchDelay(): number {
    return 50 + Math.floor(Math.random() * 101);
}

function createRoiHeadBgState(): RoiHeadBgState {
    const presetA = pickRandomRoiHeadBgPreset();
    const presetB = pickRandomRoiHeadBgPreset(presetA);
    return {
        activeLayer: Math.random() < 0.5 ? "A" : "B",
        presetA,
        presetB,
    };
}

type StatItemProps = {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    meta?: React.ReactNode;
    helpText?: string;
    iconWrapClassName?: string;
    iconBackground?: React.ReactNode;
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

function StatItem({ icon, title, value, meta, helpText, iconWrapClassName, iconBackground }: StatItemProps) {
    return (
        <div className={styles.statItem}>
            {helpText ? <HelpTip text={helpText} /> : null}
            <div className={styles.statHead}>
                <div className={`${styles.iconWrap} ${iconWrapClassName ?? ""}`.trim()}>
                    {iconBackground}
                    {icon}
                </div>
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
                    <ChartBarStacked size={16} />
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
                       Этот показатель отражает регулярность работы канала. Рассчитывается по числу активных дней за последний месяц и показывает, насколько стабильно публикуются прогнозы.
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
                    label: "Низкая доходность",
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
                            label: "Высокая доходность",
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
                              deltaStake,
                              deltaOdds,
                              totalPredictions,
                          }: {
    stakePercent: string;
    odds: string;
    loading: boolean;
    deltaStake: number;
    deltaOdds: number;
    totalPredictions: number;
}) {
    const isChangesCalculated = totalPredictions >= 50;
    const effectiveDeltaStake = isChangesCalculated ? deltaStake : 0;
    const effectiveDeltaOdds = isChangesCalculated ? deltaOdds : 0;
    const combinedDelta = Math.abs(effectiveDeltaStake) + Math.abs(effectiveDeltaOdds);

    const trendIconClassName =
        !isChangesCalculated
            ? styles.changeNeutral
            : combinedDelta < 0.1
                ? styles.changePositive
                : styles.changeNegative;

    const stakeChangeClassName =
        effectiveDeltaStake > 0 ? styles.changePositive : effectiveDeltaStake < 0 ? styles.changeNegative : styles.changeNeutral;
    const oddsChangeClassName =
        effectiveDeltaOdds > 0 ? styles.changePositive : effectiveDeltaOdds < 0 ? styles.changeNegative : styles.changeNeutral;

    const stakeDeltaText = `${Math.abs(effectiveDeltaStake).toFixed(1)}%`;
    const oddsDeltaText = Math.abs(effectiveDeltaOdds).toFixed(2);

    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div className={styles.iconWrap}>
                    <PieChart size={16} />
                </div>
                <div className={styles.title}>Средний % ставки и коэффициент</div>
            </div>
            <SplitValue left={stakePercent} right={odds} loading={loading} />
            <button
                type="button"
                className={styles.changesMetaButton}
                aria-label="Изменения среднего процента ставки и коэффициента"
            >
                <span className={`${styles.changesTrendIcon} ${trendIconClassName}`}>
                    <TrendingUpDown size={14} />
                </span>
                <span className={styles.changesMetaTitle}>Динамика</span>
                <span className={`${styles.changePart} ${stakeChangeClassName}`}>
                    {effectiveDeltaStake > 0 ? <ArrowUp size={10} /> : null}
                    {effectiveDeltaStake < 0 ? <ArrowDown size={10} /> : null}
                    <span>{loading ? '...' : stakeDeltaText}</span>
                </span>
                <div className={styles.outcomesDividermini} />
                <span className={`${styles.changePart} ${oddsChangeClassName}`}>
                    {effectiveDeltaOdds > 0 ? <ArrowUp size={10} /> : null}
                    {effectiveDeltaOdds < 0 ? <ArrowDown size={10} /> : null}
                    <span>{loading ? '...' : oddsDeltaText}</span>
                </span>
                <span className={styles.changesTooltip} role="tooltip">
                    Показывает, как изменились общие средние значения после добавления последних 50 прогнозов.
                </span>
            </button>
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
            <div className={styles.meta}>Начальный банкролл 1000$</div>
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

function clampProgress(value: number): number {
    if (value < 0) {
        return 0;
    }

    if (value > 1) {
        return 1;
    }

    return value;
}

function normalizeHitRatePosition(winRate: number): number {
    if (winRate <= 45) {
        return 0;
    }

    if (winRate <= 60) {
        return ((winRate - 45) / 15) * 0.8;
    }

    if (winRate <= 100) {
        return 0.8 + ((winRate - 60) / 40) * 0.2;
    }

    return 1;
}

function HitRateProgress({
    currentWinRate,
    winRateBeforeLast100,
    totalPredictions,
}: {
    currentWinRate: number;
    winRateBeforeLast100: number;
    totalPredictions: number;
}) {
    const normalizedCurrent = clampProgress(normalizeHitRatePosition(currentWinRate));
    const normalizedBefore = clampProgress(normalizeHitRatePosition(winRateBeforeLast100));
    const segmentStart = Math.min(normalizedBefore, normalizedCurrent);
    const segmentWidth = Math.abs(normalizedCurrent - normalizedBefore);
    const deltaWinRate = currentWinRate - winRateBeforeLast100;
    const showDelta = totalPredictions >= 150 && deltaWinRate !== 0;
    const fillColorClassName =
        currentWinRate < 50 ? styles.fillRed : currentWinRate < 55 ? styles.fillOrange : styles.fillGreen;
    const markerVisible = normalizedCurrent > 0;

    return (
        <div className={styles.hitRateProgress} aria-hidden="true">
            <svg className={styles.baseTrack} viewBox="0 0 100 8" preserveAspectRatio="none" role="presentation">
                <defs>
                    <pattern id="hitRateDeltaPositive" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="6" height="6" fill="#16a34a" />
                        <rect width="3" height="6" fill="rgba(255, 255, 255, 0.28)" />
                    </pattern>
                    <pattern id="hitRateDeltaNegative" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="6" height="6" fill="#dc2626" />
                        <rect width="3" height="6" fill="rgba(255, 255, 255, 0.28)" />
                    </pattern>
                </defs>
                <rect x="0" y="0" width="100" height="8" className={styles.baseTrackFill} />
                <rect x="0" y="0" width={normalizedCurrent * 100} height="8" className={`${styles.mainFill} ${fillColorClassName}`} />
                {showDelta && segmentWidth > 0 ? (
                    <rect
                        x={segmentStart * 100}
                        y="0"
                        width={segmentWidth * 100}
                        height="8"
                        className={styles.deltaOverlay}
                        fill={deltaWinRate > 0 ? "url(#hitRateDeltaPositive)" : "url(#hitRateDeltaNegative)"}
                    />
                ) : null}
                {markerVisible ? (
                    <circle
                        cx={normalizedCurrent * 100}
                        cy="4"
                        r="4"
                        className={`${styles.fillMarker} ${fillColorClassName}`}
                    />
                ) : null}
            </svg>
        </div>
    );
}

export function ChannelStatsBlock({ slug }: { slug: string }) {
    const { stats, loading, error } = useChannelStats(slug);
    const [roiHeadBgState, setRoiHeadBgState] = useState<RoiHeadBgState>(() => createRoiHeadBgState());

    const totalPredictions = stats ? stats.totalPredictions : 0;
    const turnoverPercent = stats ? `${stats.turnoverPercent.toFixed(1)}%` : loading ? "..." : "0.0%";
    const activeDays30d = stats ? stats.activeDays30d : 0;

    const hitRate = stats ? `${stats.hitRatePercent.toFixed(1)}%` : loading ? "..." : "0.0%";

    const avgStake = stats ? `${stats.averageStakePercent.toFixed(1)}%` : "0.0%";
    const avgOdds = stats ? stats.averageOdds.toFixed(2) : "0.00";
    const isStakeAndOddsChangesCalculated = Boolean(stats && stats.totalPredictions >= 50);
    const deltaStake =
        stats && isStakeAndOddsChangesCalculated ? stats.averageStakePercent - stats.averageStakePercentBeforeLast50 : 0;
    const deltaOdds = stats && isStakeAndOddsChangesCalculated ? stats.averageOdds - stats.averageOddsBeforeLast50 : 0;

    const roiPercent = stats ? stats.roiPercent : 0;
    const roi = stats ? `${stats.roiPercent.toFixed(1)}%` : loading ? "..." : "0.0%";
    const isExceptionalRoi = !loading && roiPercent >= 10;

    useEffect(() => {
        let intervalTimeoutId: ReturnType<typeof setTimeout> | undefined;
        let switchTimeoutId: ReturnType<typeof setTimeout> | undefined;

        if (!isExceptionalRoi) {
            const resetTimeoutId = setTimeout(() => {
                setRoiHeadBgState((currentState) =>
                    currentState.activeLayer === null
                        ? currentState
                        : {
                            ...currentState,
                            activeLayer: null,
                        },
                );
            }, 0);

            return () => {
                clearTimeout(resetTimeoutId);
                if (intervalTimeoutId) {
                    clearTimeout(intervalTimeoutId);
                }
                if (switchTimeoutId) {
                    clearTimeout(switchTimeoutId);
                }
            };
        }

        const initialState = createRoiHeadBgState();
        const initTimeoutId = setTimeout(() => {
            setRoiHeadBgState(initialState);
        }, 0);

        const scheduleNextSwitch = () => {
            intervalTimeoutId = setTimeout(() => {
                setRoiHeadBgState((currentState) => {
                    if (currentState.activeLayer === null) {
                        return currentState;
                    }

                    if (currentState.activeLayer === "A") {
                        return {
                            ...currentState,
                            presetB: pickRandomRoiHeadBgPreset(currentState.presetA),
                        };
                    }

                    return {
                        ...currentState,
                        presetA: pickRandomRoiHeadBgPreset(currentState.presetB),
                    };
                });

                switchTimeoutId = setTimeout(() => {
                    setRoiHeadBgState((currentState) => {
                        if (currentState.activeLayer === "A") {
                            return {
                                ...currentState,
                                activeLayer: "B",
                            };
                        }

                        if (currentState.activeLayer === "B") {
                            return {
                                ...currentState,
                                activeLayer: "A",
                            };
                        }

                        return currentState;
                    });
                    scheduleNextSwitch();
                }, getRandomRoiPresetSwitchDelay());
            }, getRandomRoiPresetSwitchInterval());
        };

        scheduleNextSwitch();

        return () => {
            clearTimeout(initTimeoutId);
            if (intervalTimeoutId) {
                clearTimeout(intervalTimeoutId);
            }
            if (switchTimeoutId) {
                clearTimeout(switchTimeoutId);
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


    if (error && !stats) return <div className={styles.stateError}>{error}</div>;

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
                icon={<TrendingUp size={16} className={styles.roiHeadIconGlyph} />}
                title="ROI"
                value={roi}
                meta={<RoiLevelIndicator roiPercent={roiPercent} loading={loading} />}
                helpText="ROI — показатель эффективности ставок. Он отражает, какой процент прибыли или убытка вы получаете от общего оборота ставок. Чем выше ROI, тем лучше результат на дистанции."
                iconWrapClassName={isExceptionalRoi ? styles.roiHeadIconExceptional : undefined}
                iconBackground={
                    isExceptionalRoi ? (
                        <>
                            <span
                                className={`${styles.roiHeadBgLayer} ${styles[roiHeadBgState.presetA as keyof typeof styles]} ${
                                    roiHeadBgState.activeLayer === "A" ? styles.roiHeadBgActive : styles.roiHeadBgInactive
                                }`}
                            />
                            <span
                                className={`${styles.roiHeadBgLayer} ${styles[roiHeadBgState.presetB as keyof typeof styles]} ${
                                    roiHeadBgState.activeLayer === "B" ? styles.roiHeadBgActive : styles.roiHeadBgInactive
                                }`}
                            />
                        </>
                    ) : null
                }
            />
            <TotalProfitStat profitMoney={profitMoney} profitPercent={profitPercentAllTime} loading={loading} />

            <StakeAndOddsStat
                stakePercent={avgStake}
                odds={avgOdds}
                loading={loading}
                deltaStake={deltaStake}
                deltaOdds={deltaOdds}
                totalPredictions={totalPredictions}
            />
            <StatItem
                icon={<Percent size={16} />}
                title="Проходимость"
                value={hitRate}
                meta={
                    stats ? (
                        <HitRateProgress
                            currentWinRate={stats.hitRatePercent}
                            winRateBeforeLast100={stats.winRateBeforeLast100}
                            totalPredictions={stats.totalPredictions}
                        />
                    ) : (
                        <HitRateProgress currentWinRate={0} winRateBeforeLast100={0} totalPredictions={0} />
                    )
                }
            />
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
