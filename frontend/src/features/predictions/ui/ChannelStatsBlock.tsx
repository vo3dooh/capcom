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
    PlusCircle,
    MinusCircle,
    RotateCcw,
    BadgeInfo,
    Cloud,
    CloudCheck,
    CloudOff,
    ChartNoAxesCombined,
    Goal,
    Shield,
    ShieldX,
    ShieldCheck,
    Scale,
    HeartPulse,
    TriangleAlert,
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

type RoiHeadHighlightTone = "success" | "danger";

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

function getRoiHeadBgPresetClass(preset: RoiHeadBgPreset, tone: RoiHeadHighlightTone): string {
    if (tone === "danger") {
        const dangerPreset = preset.replace("roiHeadBgPreset", "roiHeadBgDangerPreset") as keyof typeof styles;
        return styles[dangerPreset];
    }

    return styles[preset as keyof typeof styles];
}

function renderRoiHeadIconBackground(roiHeadBgState: RoiHeadBgState, tone: RoiHeadHighlightTone): React.ReactNode {
    return (
        <>
            <span
                className={`${styles.roiHeadBgLayer} ${tone === "danger" ? styles.roiHeadBgDangerLayer : ""} ${getRoiHeadBgPresetClass(
                    roiHeadBgState.presetA,
                    tone,
                )} ${roiHeadBgState.activeLayer === "A" ? styles.roiHeadBgActive : styles.roiHeadBgInactive}`.trim()}
            />
            <span
                className={`${styles.roiHeadBgLayer} ${tone === "danger" ? styles.roiHeadBgDangerLayer : ""} ${getRoiHeadBgPresetClass(
                    roiHeadBgState.presetB,
                    tone,
                )} ${roiHeadBgState.activeLayer === "B" ? styles.roiHeadBgActive : styles.roiHeadBgInactive}`.trim()}
            />
        </>
    );
}

type StatItemProps = {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    meta?: React.ReactNode;
    metaClassName?: string;
    helpText?: React.ReactNode;
    iconWrapClassName?: string;
    iconBackground?: React.ReactNode;
};

type HelpTipProps = {
    content: React.ReactNode;
    ariaLabelText: string;
};

type MetricStatusTipProps = {
    icon: React.ReactNode;
    text: string;
    tooltip: React.ReactNode;
    ariaLabel: string;
    buttonClassName?: string;
    textClassName?: string;
    tooltipClassName?: string;
};

const INSUFFICIENT_DISTANCE_TEXT = "Недостаточно дистанции";
const INSUFFICIENT_DISTANCE_TOOLTIP =
    "Канал находится на этапе становления, поэтому объём накопленной статистики пока недостаточен для корректного расчёта и отображения некоторых аналитических показателей. По мере публикации новых прогнозов и формирования истории ставок метрики будут автоматически пересчитаны на основе фактических данных.";

type InsufficientDistanceTipProps = {
    className?: string;
    textClassName?: string;
    tooltipClassName?: string;
    disableTooltip?: boolean;
};

function HelpTip({ content, ariaLabelText }: HelpTipProps) {
    return (
        <button type="button" className={styles.helpButton} aria-label={`Подсказка: ${ariaLabelText}`}>
            <BadgeInfo size={14} />
            <span className={styles.helpTooltip} role="tooltip">
                {content}
            </span>
        </button>
    );
}

function MetricStatusTip({
    icon,
    text,
    tooltip,
    ariaLabel,
    buttonClassName,
    textClassName,
    tooltipClassName,
}: MetricStatusTipProps) {
    return (
        <button
            type="button"
            className={`${styles.metricStatusButton} ${buttonClassName ?? ""}`.trim()}
            aria-label={ariaLabel}
        >
            {icon}
            <span className={`${styles.metricStatusText} ${textClassName ?? ""}`.trim()}>{text}</span>
            <span className={`${styles.metricStatusTooltip} ${tooltipClassName ?? ""}`.trim()} role="tooltip">
                {tooltip}
            </span>
        </button>
    );
}

function InsufficientDistanceTip({ className, textClassName, tooltipClassName, disableTooltip }: InsufficientDistanceTipProps) {
    return (
        <span className={`${styles.insufficientDistanceTip} ${className ?? ""}`.trim()}>
            <span className={`${styles.metricStatusText} ${textClassName ?? ""}`.trim()}>{INSUFFICIENT_DISTANCE_TEXT}</span>
            {disableTooltip ? null : (
                <span className={`${styles.metricStatusTooltip} ${tooltipClassName ?? ""}`.trim()} role="tooltip">
                    {INSUFFICIENT_DISTANCE_TOOLTIP}
                </span>
            )}
        </span>
    );
}

function StatItem({ icon, title, value, meta, metaClassName, helpText, iconWrapClassName, iconBackground }: StatItemProps) {
    return (
        <div className={styles.statItem}>
            {helpText ? <HelpTip content={helpText} ariaLabelText={title} /> : null}
            <div className={styles.statHead}>
                <div className={`${styles.iconWrap} ${iconWrapClassName ?? ""}`.trim()}>
                    {iconBackground}
                    {icon}
                </div>
                <div className={styles.title}>{title}</div>
            </div>
            <div className={styles.value}>{value}</div>
            <div className={`${styles.meta} ${metaClassName ?? ""}`.trim()}>{meta ?? " "}</div>
        </div>
    );
}

function OutcomesStat({
                          wins,
                          losses,
                          voids,
                          loading,
                          winRate,
                          totalBets,
                          settledPredictions,
                          iconWrapClassName,
                          iconBackground,
                      }: {
    wins: number;
    losses: number;
    voids: number;
    loading: boolean;
    winRate: number;
    totalBets: number;
    settledPredictions: number;
    iconWrapClassName?: string;
    iconBackground?: React.ReactNode;
}) {
    const hitRateLevel = loading
        ? {
            label: "...",
            iconClassName: styles.metricIconGray,
        }
        : settledPredictions < 10
            ? {
                label: INSUFFICIENT_DISTANCE_TEXT,
                iconClassName: styles.metricIconGray,
            }
        : winRate < 50
            ? {
                label: "Низкая проходимость",
                iconClassName: styles.metricIconRed,
            }
            : winRate < 55
                ? {
                    label: "Средняя проходимость",
                    iconClassName: styles.outcomesHitRateIconOrange,
                }
                : winRate < 60 || totalBets <= 100
                    ? {
                        label: "Хорошая проходимость",
                        iconClassName: styles.metricIconGreen,
                    }
                    : {
                        label: "Высокая проходимость",
                        iconClassName: styles.metricIconGreen,
                    };
    const winRateLabel = `${winRate.toFixed(1).replace(".", ",")}%`;

    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div className={`${styles.iconWrap} ${iconWrapClassName ?? ""}`.trim()}>
                    {iconBackground}
                    <ChartBarStacked size={16} className={styles.roiHeadIconGlyph} />
                </div>
                <div className={styles.title}>Статистика исходов</div>
            </div>

            <div className={`${styles.value} ${styles.outcomesValue}`}>
                <div className={styles.outcomeItem}>
                    <PlusCircle size={12} className={styles.winIcon} />
                    <span className={styles.outcomeValue}>{loading ? "..." : wins}</span>
                </div>

                <div className={styles.outcomesDivider} />

                <div className={styles.outcomeItem}>
                    <MinusCircle size={12} className={styles.lossIcon} />
                    <span className={styles.outcomeValue}>{loading ? "..." : losses}</span>
                </div>

                <div className={styles.outcomesDivider} />

                <div className={styles.outcomeItem}>
                    <RotateCcw size={12} className={styles.voidIcon} />
                    <span className={styles.outcomeValue}>{loading ? "..." : voids}</span>
                </div>
            </div>

            {loading ? (
                <div className={styles.outcomesHitRateMeta}>
                    <span className={`${styles.metricIcon} ${hitRateLevel.iconClassName}`}>
                        <Percent size={12} />
                    </span>
                    <span className={styles.metricStatusText}>{hitRateLevel.label}</span>
                </div>
            ) : settledPredictions < 10 ? (
                <MetricStatusTip
                    icon={
                        <span className={`${styles.metricIcon} ${hitRateLevel.iconClassName}`}>
                            <Percent size={12} />
                        </span>
                    }
                    text={INSUFFICIENT_DISTANCE_TEXT}
                    tooltip={INSUFFICIENT_DISTANCE_TOOLTIP}
                    ariaLabel="Недостаточно дистанции для проходимости"
                    buttonClassName={styles.outcomesHitRateMeta}
                />
            ) : (
                <MetricStatusTip
                    icon={
                        <span className={`${styles.metricIcon} ${hitRateLevel.iconClassName}`}>
                            <Percent size={12} />
                        </span>
                    }
                    text={hitRateLevel.label}
                    tooltip={
                        <>
                            Проходимость прогнозов на канале — <strong>{winRateLabel}</strong>
                        </>
                    }
                    ariaLabel="Уровень проходимости канала"
                    buttonClassName={styles.outcomesHitRateMeta}
                />
            )}
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
            iconClassName: styles.metricIconLoading,
        }
        : activeDays30d < 10
            ? {
                label: "Низкая активность",
                icon: <CloudOff size={12} />,
                iconClassName: styles.metricIconLow,
            }
            : activeDays30d < 20
                ? {
                    label: "Средняя активность",
                    icon: <Cloud size={12} />,
                    iconClassName: styles.metricIconMedium,
                }
                : {
                    label: "Высокая активность",
                    icon: <CloudCheck size={12} />,
                    iconClassName: styles.metricIconHigh,
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
                <MetricStatusTip
                    icon={<span className={`${styles.metricIcon} ${activity.iconClassName}`}>{activity.icon}</span>}
                    text={activity.label}
                    tooltip="Этот показатель отражает регулярность работы канала. Рассчитывается по числу активных дней за последний месяц и показывает, насколько стабильно публикуются прогнозы."
                    ariaLabel="Уровень активности канала. Рассчитывается по активности канала за последние 30 дней."
                />
            </div>
        </div>
    );
}

function RoiLevelIndicator({ roiPercent, settledPredictions, loading }: { roiPercent: number; settledPredictions: number; loading: boolean }) {
    const roiLevel = loading
        ? {
            label: "...",
            iconClassName: styles.metricIconGray,
        }
        : settledPredictions < 100
            ? {
                label: INSUFFICIENT_DISTANCE_TEXT,
                iconClassName: styles.metricIconGray,
            }
        : roiPercent < 0
            ? {
                label: "Убыточная доходность",
                iconClassName: styles.metricIconRed,
            }
            : roiPercent < 2
                ? {
                    label: "Низкая доходность",
                    iconClassName: styles.metricIconGray,
                }
                : roiPercent < 5
                    ? {
                        label: "Уверенная доходность",
                        iconClassName: styles.metricIconLightGreen,
                    }
                    : roiPercent < 10
                        ? {
                            label: "Высокая доходность",
                            iconClassName: styles.metricIconGreen,
                        }
                        : {
                            label: "Высокая доходность",
                            iconClassName: `${styles.metricIconGreen} ${styles.metricIconExceptional}`,
                        };

    return (
        <MetricStatusTip
            icon={
                <span className={`${styles.metricIcon} ${roiLevel.iconClassName}`}>
                    <ChartNoAxesCombined size={12} />
                </span>
            }
            text={roiLevel.label}
            tooltip={
                roiLevel.label === INSUFFICIENT_DISTANCE_TEXT ? (
                    INSUFFICIENT_DISTANCE_TOOLTIP
                ) : (
                    <>
                        <p className={styles.helpTooltipParagraph}>
                            Уровень доходности отражает эффективность стратегии на основе значения ROI и помогает определить какую прибыль стратегия генерирует относительно общего оборота ставок.
                        </p>
                    </>
                )
            }
            ariaLabel="Уровень доходности канала. Рассчитывается по ROI за выбранный период."
        />
    );
}

function StakeAndOddsStat({
                              stakePercent,
                              odds,
                              loading,
                              deltaStake,
                              deltaOdds,
                              settledPredictions,
                          }: {
    stakePercent: string;
    odds: string;
    loading: boolean;
    deltaStake: number;
    deltaOdds: number;
    settledPredictions: number;
}) {
    const isChangesCalculated = settledPredictions >= 100;
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
                {isChangesCalculated ? <span className={styles.changesMetaTitle}>Динамика</span> : null}
                {isChangesCalculated ? (
                    <>
                        <span className={`${styles.changePart} ${stakeChangeClassName}`}>
                            {effectiveDeltaStake > 0 ? <ArrowUp size={10} /> : null}
                            {effectiveDeltaStake < 0 ? <ArrowDown size={10} /> : null}
                            <span>{loading ? "..." : stakeDeltaText}</span>
                        </span>
                        <div className={styles.outcomesDividermini} />
                        <span className={`${styles.changePart} ${oddsChangeClassName}`}>
                            {effectiveDeltaOdds > 0 ? <ArrowUp size={10} /> : null}
                            {effectiveDeltaOdds < 0 ? <ArrowDown size={10} /> : null}
                            <span>{loading ? "..." : oddsDeltaText}</span>
                        </span>
                    </>
                ) : (
                    <InsufficientDistanceTip className={styles.changePart} textClassName={styles.changePart} disableTooltip />
                )}
                {isChangesCalculated ? (
                    <span className={styles.changesTooltip} role="tooltip">
                        <span className={styles.changesTooltipParagraph}>Показатель динамики отражает, как новые рассчитанные прогнозы повлияли на общие средние значения за весь период.</span>
                        <span className={styles.changesTooltipParagraph}>Он помогает понять, сохраняет ли прогнозист свой стиль ставок или меняет подход.</span>
                        <span className={styles.changesTooltipDivider} />
                        <span className={styles.changesTooltipIndicatorBlock}>
                            <span className={styles.changesTooltipIndicatorTitle}>
                                <TrendingUpDown size={12} className={styles.changesTooltipIconNegative} />
                                <span>Красный индикатор</span>
                            </span>
                            <span className={styles.changesTooltipParagraph}>Сигнализирует о корректировке стратегии или изменении степени агрессивности.</span>
                        </span>
                        <span className={styles.changesTooltipIndicatorBlock}>
                            <span className={styles.changesTooltipIndicatorTitle}>
                                <TrendingUpDown size={12} className={styles.changesTooltipIconPositive} />
                                <span>Зелёный индикатор</span>
                            </span>
                            <span className={styles.changesTooltipParagraph}>Указывает на сохранение выбранной стратегии и стиля ставок.</span>
                        </span>
                    </span>
                ) : (
                    <span className={styles.changesTooltip} role="tooltip">
                        {INSUFFICIENT_DISTANCE_TOOLTIP}
                    </span>
                )}
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

function PlannedProfitStat({
                               plannedProfit,
                               trustLabel,
                               trustToneClassName,
                               trustTone,
                               highlightTone,
                               roiHeadBgState,
                           }: {
    plannedProfit: string;
    trustLabel: string;
    trustToneClassName: string;
    trustTone?: "danger" | "warning" | "success";
    highlightTone?: RoiHeadHighlightTone;
    roiHeadBgState: RoiHeadBgState;
}) {
    const normalizedTrustLabel = trustLabel.toLowerCase();
    const TrustIcon = trustTone
        ? trustTone === "danger"
            ? ShieldX
            : trustTone === "warning"
                ? Shield
                : ShieldCheck
        : normalizedTrustLabel.includes("низк")
            ? ShieldX
            : normalizedTrustLabel.includes("средн")
                ? Shield
                : ShieldCheck;

    return (
        <div className={styles.statItem}>
            <div className={styles.statHead}>
                <div
                    className={`${styles.iconWrap} ${
                        highlightTone === "danger"
                            ? styles.roiHeadIconDanger
                            : highlightTone === "success"
                                ? styles.roiHeadIconExceptional
                                : ""
                    }`.trim()}
                >
                    {highlightTone ? renderRoiHeadIconBackground(roiHeadBgState, highlightTone) : null}
                    <Goal size={16} className={styles.roiHeadIconGlyph} />
                </div>
                <div className={styles.title}>Планируемая прибыль</div>
            </div>
            <div className={styles.value}>{plannedProfit}</div>
            <div className={styles.metaGroup}>
                <MetricStatusTip
                    icon={
                        <span className={`${styles.metricIcon} ${trustToneClassName}`}>
                            <TrustIcon size={12} className={styles.trustShieldIcon} />
                        </span>
                    }
                    text={trustLabel}
                    tooltip="Уровень доверия рассчитывается на основе комплексной оценки ключевых статистических параметров канала: объёма выборки, продолжительности активности, стабильности результатов и уровня риска. Показатель отражает степень надёжности представленной статистики."
                    ariaLabel="Уровень доверия"
                />
            </div>
        </div>
    );
}

function MaxDrawdownStat({
                             drawdownMoney,
                             drawdownPercent,
                             loading,
                             helpText,
                             riskLabel,
                             riskTooltip,
                             riskIconClassName,
                             iconWrapClassName,
                             iconBackground,
                         }: {
    drawdownMoney: string;
    drawdownPercent: string;
    loading: boolean;
    helpText: React.ReactNode;
    riskLabel: string;
    riskTooltip: React.ReactNode;
    riskIconClassName: string;
    iconWrapClassName?: string;
    iconBackground?: React.ReactNode;
}) {
    return (
        <div className={styles.statItem}>
            <HelpTip content={helpText} ariaLabelText="Максимальная просадка" />
            <div className={styles.statHead}>
                <div className={`${styles.iconWrap} ${iconWrapClassName ?? ""}`.trim()}>
                    {iconBackground}
                    <Scale size={16} className={styles.roiHeadIconGlyph} />
                </div>
                <div className={styles.title}>Максимальная просадка</div>
            </div>
            <SplitValue left={drawdownMoney} right={drawdownPercent} loading={loading} />
            <div className={styles.metaGroup}>
                <MetricStatusTip
                    icon={
                        <span className={`${styles.metricIcon} ${riskIconClassName}`}>
                            <Scale size={12} />
                        </span>
                    }
                    text={riskLabel}
                    tooltip={riskTooltip}
                    ariaLabel="Уровень риска"
                />
            </div>
        </div>
    );
}

export function ChannelStatsBlock({ slug }: { slug: string }) {
    const { stats, plannedProfitStats, loading, error } = useChannelStats(slug);
    const [roiHeadBgState, setRoiHeadBgState] = useState<RoiHeadBgState>(() => createRoiHeadBgState());

    const totalPredictions = stats ? stats.totalPredictions : 0;
    const turnoverPercent = stats ? `${stats.turnoverPercent.toFixed(1)}%` : loading ? "..." : "0.0%";
    const activeDays30d = stats ? stats.activeDays30d : 0;

    const hitRatePercent = stats ? stats.hitRatePercent : 0;
    const wins = stats ? stats.outcomes.wins : 0;
    const losses = stats ? stats.outcomes.losses : 0;
    const voids = stats ? stats.outcomes.voids : 0;
    const settledPredictions = wins + losses + voids;

    const avgStake = stats ? `${stats.averageStakePercent.toFixed(1)}%` : "0.0%";
    const avgOdds = stats ? stats.averageOdds.toFixed(2) : "0.00";
    const isStakeAndOddsChangesCalculated = Boolean(stats && stats.totalPredictions >= 50);
    const deltaStake =
        stats && isStakeAndOddsChangesCalculated ? stats.averageStakePercent - stats.averageStakePercentBeforeLast50 : 0;
    const deltaOdds = stats && isStakeAndOddsChangesCalculated ? stats.averageOdds - stats.averageOddsBeforeLast50 : 0;

    const roiPercent = stats ? stats.roiPercent : 0;
    const roi = stats ? `${stats.roiPercent.toFixed(1)}%` : loading ? "..." : "0.0%";
    const isExceptionalRoi = !loading && roiPercent >= 10;

    const profitMoney = stats ? `${stats.totalProfit.toFixed(2)}$` : "0.00$";
    const profitPercentAllTime = stats
        ? `${(stats.startingBankroll > 0 ? (stats.totalProfit / stats.startingBankroll) * 100 : 0).toFixed(1)}%`
        : loading
            ? "..."
            : "0.0%";

    const maxDrawdownMoney = stats ? `${stats.maxDrawdown.toFixed(2)}$` : "0.00$";
    const ddPercentValue = stats && stats.startingBankroll > 0 ? (stats.maxDrawdown / stats.startingBankroll) * 100 : 0;
    const maxDrawdownPercent = `${ddPercentValue.toFixed(1)}%`;
    const hasInsufficientBetHistory = settledPredictions < 100;
    const drawdownRiskLevel = hasInsufficientBetHistory
        ? {
            label: "Высокий риск",
            iconClassName: styles.metricIconNoHistory,
        }
        : ddPercentValue > 75
            ? {
                label: "Критический риск",
                iconClassName: styles.metricIconRed,
            }
            : ddPercentValue >= 51
                ? {
                    label: "Повышенный риск",
                    iconClassName: styles.outcomesHitRateIconOrange,
                }
                : ddPercentValue >= 31
                    ? {
                        label: "Умеренный риск",
                        iconClassName: styles.metricIconGreen,
                }
                    : {
                        label: "Низкий риск",
                        iconClassName: styles.metricIconGreen,
                    };
    const isLowRiskHighlighted = !hasInsufficientBetHistory && ddPercentValue <= 30;
    const isDrawdownDangerHighlighted = !hasInsufficientBetHistory && ddPercentValue > 75;
    const volatilityValue = stats ? stats.volatility : 0;
    const volatility = stats ? volatilityValue.toFixed(2) : loading ? "..." : "0.00";
    const volatilityLevel = loading
        ? {
            label: "...",
            iconClassName: styles.metricIconGray,
        }
        : settledPredictions < 100
            ? {
                label: INSUFFICIENT_DISTANCE_TEXT,
                iconClassName: styles.metricIconGray,
            }
            : volatilityValue <= 25
                ? {
                    label: "Спокойный стиль",
                    iconClassName: styles.metricIconGreen,
                }
                : volatilityValue <= 50
                    ? {
                        label: "Динамичный стиль",
                        iconClassName: styles.metricIconGreen,
                    }
                    : volatilityValue <= 75
                        ? {
                            label: "Агрессивный стиль",
                            iconClassName: styles.outcomesHitRateIconOrange,
                        }
                        : {
                            label: "Экстремальный стиль",
                            iconClassName: styles.metricIconRed,
                        };
    const isVolatilityExceptional = settledPredictions >= 100 && volatilityValue <= 25;
    const isVolatilityDangerHighlighted = settledPredictions >= 100 && volatilityValue > 75;
    const plannedProfit = plannedProfitStats ? `${plannedProfitStats.plannedProfitPercent.toFixed(2)}%` : loading ? "..." : "0.00%";
    const plannedProfitTrust = plannedProfitStats
        ? {
            label: plannedProfitStats.trustLevel,
            toneClassName:
                plannedProfitStats.trustTone === "danger"
                    ? styles.trustToneDanger
                    : plannedProfitStats.trustTone === "warning"
                        ? styles.trustToneWarning
                        : styles.trustToneSuccess,
        }
        : {
            label: "...",
            toneClassName: styles.trustToneNeutral,
        };
    const isPlannedProfitTrustHighlighted = Boolean(plannedProfitStats?.isTrustHighlighted);
    const isPlannedProfitDangerHighlighted = Boolean(plannedProfitStats && plannedProfitStats.plannedProfitPercent < -5);

    const isExceptionalHitRate = !loading && hitRatePercent >= 60 && totalPredictions > 100;
    const isDangerHitRate = !loading && settledPredictions >= 10 && hitRatePercent < 45;
    const isDangerRoi = !loading && settledPredictions >= 100 && roiPercent < 0;
    const hasAnimatedHeadHighlight =
        isExceptionalHitRate ||
        isDangerHitRate ||
        isExceptionalRoi ||
        isDangerRoi ||
        isVolatilityExceptional ||
        isVolatilityDangerHighlighted ||
        isLowRiskHighlighted ||
        isDrawdownDangerHighlighted ||
        isPlannedProfitTrustHighlighted ||
        isPlannedProfitDangerHighlighted;

    useEffect(() => {
        let intervalTimeoutId: ReturnType<typeof setTimeout> | undefined;
        let switchTimeoutId: ReturnType<typeof setTimeout> | undefined;

        if (!hasAnimatedHeadHighlight) {
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
    }, [hasAnimatedHeadHighlight, slug]);


    if (error && !stats) return <div className={styles.stateError}>{error}</div>;

    return (
        <div className={styles.wrap}>
            <PredictionsAndTurnoverStat
                totalPredictions={totalPredictions}
                turnoverPercent={turnoverPercent}
                activeDays30d={activeDays30d}
                loading={loading}
            />
            <OutcomesStat
                wins={wins}
                losses={losses}
                voids={voids}
                loading={loading}
                winRate={hitRatePercent}
                totalBets={totalPredictions}
                settledPredictions={settledPredictions}
                iconWrapClassName={
                    isDangerHitRate ? styles.roiHeadIconDanger : isExceptionalHitRate ? styles.roiHeadIconExceptional : undefined
                }
                iconBackground={
                    isDangerHitRate || isExceptionalHitRate
                        ? renderRoiHeadIconBackground(roiHeadBgState, isDangerHitRate ? "danger" : "success")
                        : null
                }
            />
            <StatItem
                icon={<TrendingUp size={16} className={styles.roiHeadIconGlyph} />}
                title="ROI"
                value={roi}
                metaClassName={styles.metaWithTooltip}
                meta={<RoiLevelIndicator roiPercent={roiPercent} settledPredictions={settledPredictions} loading={loading} />}
                helpText={
                    <>
                        <p className={styles.helpTooltipParagraph}>
                            ROI — показатель эффективности ставок. Он отражает, какой процент прибыли или убытка вы получаете
                            от общего оборота ставок. Чем выше ROI, тем лучше результат на дистанции.
                        </p>

                        <p className={styles.helpTooltipParagraph}>
                            <TriangleAlert size={14} className={`${styles.metricIconRed} ${styles.metricIconInline}`} /> Мы настоятельно рекомендуем с осторожностью
                            интерпретировать показатель ROI, если общее число прогнозов на канале меньше 500. На короткой дистанции
                            результаты могут значительно искажаться из-за случайных серий выигрышей или проигрышей.
                        </p>

                        <p className={styles.helpTooltipParagraph}>
                            Небольшая выборка не позволяет объективно оценить устойчивость стратегии. Чем больше дистанция прогнозов,
                            тем точнее ROI отражает реальную доходность на длительном промежутке времени.
                        </p>
                    </>
                }
                iconWrapClassName={isDangerRoi ? styles.roiHeadIconDanger : isExceptionalRoi ? styles.roiHeadIconExceptional : undefined}
                iconBackground={
                    isDangerRoi || isExceptionalRoi
                        ? renderRoiHeadIconBackground(roiHeadBgState, isDangerRoi ? "danger" : "success")
                        : null
                }
            />
            <TotalProfitStat profitMoney={profitMoney} profitPercent={profitPercentAllTime} loading={loading} />

            <StakeAndOddsStat
                stakePercent={avgStake}
                odds={avgOdds}
                loading={loading}
                deltaStake={deltaStake}
                deltaOdds={deltaOdds}
                settledPredictions={settledPredictions}
            />
            <StatItem
                icon={<Activity size={16} />}
                title="Волатильность"
                value={volatility}
                metaClassName={styles.metaWithTooltip}
                meta={
                    <MetricStatusTip
                        icon={
                            <span className={`${styles.metricIcon} ${volatilityLevel.iconClassName}`}>
                                <HeartPulse size={12} />
                            </span>
                        }
                        text={volatilityLevel.label}
                        tooltip={
                            volatilityLevel.label === INSUFFICIENT_DISTANCE_TEXT
                                ? INSUFFICIENT_DISTANCE_TOOLTIP
                                : "Уровень стиля ставок отражает степень агрессивности стратегии на основе текущей волатильности. Он характеризует допустимый уровень риска и амплитуду возможных отклонений банкролла."
                        }
                        ariaLabel="Стиль волатильности канала"
                    />
                }
                helpText={
                    <>
                        <p className={styles.helpTooltipParagraph}>
                            Волатильность — отражение степени разброса прибыли относительно среднего значения и устойчивости стратегии к отклонениям.
                        </p>
                        <p className={styles.helpTooltipParagraph}>
                            Чем выше показатель, тем выше вероятность резких изменений банкролла — как в сторону роста, так и в сторону просадки. Низкая волатильность говорит о более ровной динамике и меньшей вероятности экстремальных колебаний.
                        </p>
                        <p className={styles.helpTooltipParagraph}>
                            Метрика особенно важна при работе с крупным банкроллом и помогает оценить риск-профиль канала, потенциальную глубину просадок и сопоставить стратегию с вашим допустимым уровнем риска.
                        </p>
                    </>
                }
                iconWrapClassName={
                    isVolatilityDangerHighlighted
                        ? styles.roiHeadIconDanger
                        : isVolatilityExceptional
                            ? styles.roiHeadIconExceptional
                            : undefined
                }
                iconBackground={
                    isVolatilityDangerHighlighted || isVolatilityExceptional
                        ? renderRoiHeadIconBackground(
                            roiHeadBgState,
                            isVolatilityDangerHighlighted ? "danger" : "success",
                        )
                        : null
                }
            />
            <MaxDrawdownStat
                drawdownMoney={maxDrawdownMoney}
                drawdownPercent={maxDrawdownPercent}
                loading={loading}
                helpText={
                    <>
                        <p className={styles.helpTooltipParagraph}>
                            Максимальная просадка показывает наибольшее снижение банкролла от локального пика до последующего минимума за всё время публикации прогнозов. Показатель отражает самый глубокий спад банкролла и позволяет оценить максимальный уровень временных потерь, которые могла испытывать стратегия.
                        </p>

                        <p className={styles.helpTooltipParagraph}>
                            Важно учитывать, что даже при высокой просадке последующее восстановление банкролла и выход из глубокого спада могут указывать на устойчивость стратегии и способность автора адаптироваться к неблагоприятным сериям.
                        </p>
                    </>
                }
                riskLabel={drawdownRiskLevel.label}
                riskTooltip={
                    hasInsufficientBetHistory
                    ? "Уровень риска установлен как высокий, поскольку канал пока не имеет достаточной истории ставок. При отсутствии накопленной статистики невозможно объективно оценить возможные просадки банкролла и стабильность результатов стратегии. По мере публикации новых прогнозов и формирования истории ставок показатель риска будет пересчитан на основе фактических данных."
                    : "Уровень риска определяется на основе максимальной просадки банкролла и общего объёма опубликованных прогнозов. Чем выше уровень риска — тем выше вероятность потери банкролла.\nПри этом способность канала восстановить банкролл после глубокой просадки также может говорить о долгосрочной устойчивости стратегии и в отдельных случаях снижать итоговую оценку уровня риска."
                }
                riskIconClassName={drawdownRiskLevel.iconClassName}
                iconWrapClassName={
                    isDrawdownDangerHighlighted
                        ? styles.roiHeadIconDanger
                        : isLowRiskHighlighted
                            ? styles.roiHeadIconExceptional
                            : undefined
                }
                iconBackground={
                    isDrawdownDangerHighlighted || isLowRiskHighlighted
                        ? renderRoiHeadIconBackground(
                            roiHeadBgState,
                            isDrawdownDangerHighlighted ? "danger" : "success",
                        )
                        : null
                }
            />
            <PlannedProfitStat
                plannedProfit={plannedProfit}
                trustLabel={plannedProfitTrust.label}
                trustToneClassName={plannedProfitTrust.toneClassName}
                trustTone={plannedProfitStats?.trustTone}
                highlightTone={
                    isPlannedProfitDangerHighlighted ? "danger" : isPlannedProfitTrustHighlighted ? "success" : undefined
                }
                roiHeadBgState={roiHeadBgState}
            />
        </div>
    );
}
