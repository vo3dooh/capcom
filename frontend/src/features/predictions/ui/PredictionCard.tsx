import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import {
    Trophy,
    XCircle,
    RotateCcw,
    Clock,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { PredictionItem } from "../api/predictionsApi";
import styles from "./PredictionCard.module.css";

function formatDateTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function formatShortDateTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function resultTone(result: string) {
    if (result === "win") return styles.badgeWin;
    if (result === "loss") return styles.badgeLoss;
    if (result === "void") return styles.badgeVoid;
    return styles.badgePending;
}

function resultIcon(result: string) {
    if (result === "win") return <Trophy className={styles.badgeIcon} aria-hidden="true" />;
    if (result === "loss") return <XCircle className={styles.badgeIcon} aria-hidden="true" />;
    if (result === "void") return <RotateCcw className={styles.badgeIcon} aria-hidden="true" />;
    return <Clock className={styles.badgeIcon} aria-hidden="true" />;
}

function sportVisualByKey(sportKey?: string) {
    const key = (sportKey || "").toLowerCase();

    if (key.includes("soccer") || key.includes("football")) {
        return { icon: "ph:soccer-ball", iconClassName: styles.sportIconFootball, pillClassName: styles.sportPillFootball };
    }

    if (key.includes("basket")) {
        return { icon: "ph:basketball", iconClassName: styles.sportIconBasketball, pillClassName: styles.sportPillBasketball };
    }

    if (key.includes("tennis")) {
        return { icon: "ph:tennis-ball", iconClassName: styles.sportIconTennis, pillClassName: styles.sportPillTennis };
    }

    if (key.includes("baseball")) {
        return { icon: "ph:baseball", iconClassName: styles.sportIconBaseball, pillClassName: styles.sportPillBaseball };
    }

    if (key.includes("mma") || key.includes("boxing")) {
        return { icon: "ph:boxing-glove", iconClassName: styles.sportIconMma, pillClassName: styles.sportPillMma };
    }

    if (key.includes("esports") || key.includes("game")) {
        return { icon: "ph:game-controller", iconClassName: styles.sportIconEsports, pillClassName: styles.sportPillEsports };
    }

    return { icon: "ph:globe", iconClassName: styles.sportIconDefault, pillClassName: styles.sportPillDefault };
}

function normalizeText(value: string) {
    return (value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function prettifyPick(market: string, selection: string, homeName: string, awayName: string) {
    const m = (market || "").toLowerCase();
    const sRaw = (selection || "").trim();
    const s = normalizeText(sRaw);

    const homeNorm = normalizeText(homeName);
    const awayNorm = normalizeText(awayName);

    const isHome =
        s === "home" ||
        s === "1" ||
        s === "p1" ||
        s === "п1" ||
        s === homeNorm ||
        (homeNorm && s.includes(homeNorm));

    const isAway =
        s === "away" ||
        s === "2" ||
        s === "p2" ||
        s === "п2" ||
        s === awayNorm ||
        (awayNorm && s.includes(awayNorm));

    const isDraw =
        s === "draw" ||
        s === "x" ||
        s === "х" ||
        s === "ничья" ||
        s === "ничья (x)" ||
        s === "ничья x";

    if (m === "h2h") {
        if (isHome) return "П1";
        if (isAway) return "П2";
        if (isDraw) return "Х";
        return sRaw || "—";
    }

    if (m === "totals") {
        if (s === "over") return "ТБ";
        if (s === "under") return "ТМ";
        return "Тотал";
    }

    if (m === "spreads") {
        if (isHome) return "Ф1";
        if (isAway) return "Ф2";
        return "Ф";
    }

    return sRaw || "—";
}

function computeStakePercent(stake: number) {
    const baseBankroll = 1000;
    return (stake / baseBankroll) * 100;
}

function computePnlPercent(result: string, stake: number, odds: number) {
    const baseBankroll = 1000;

    if (!stake || stake <= 0) return null;

    if (result === "win") {
        const profit = stake * (odds - 1);
        return (profit / baseBankroll) * 100;
    }

    if (result === "loss") {
        return (-stake / baseBankroll) * 100;
    }

    if (result === "void") {
        return 0;
    }

    return null;
}

function formatPercent(value: number) {
    const rounded = Math.round(value * 10) / 10;
    const fixed = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
    const withComma = fixed.replace(".", ",");
    return `${rounded > 0 ? "+" : ""}${withComma}%`;
}

function formatNumber(value: number, digits: number) {
    const fixed = value.toFixed(digits);
    return fixed.replace(".", ",");
}

function resolveBookmaker(item: PredictionItem) {
    const anyItem = item as any;
    const raw =
        anyItem?.bookmaker ||
        anyItem?.bookmakerKey ||
        anyItem?.bookmakerName ||
        anyItem?.oddsBookmaker ||
        anyItem?.bookmaker?.name;

    const value = typeof raw === "string" ? raw.trim() : "";
    return value ? value : "";
}

export function PredictionCard({ item }: { item: PredictionItem }) {
    const [openDesc, setOpenDesc] = useState(false);

    const home = item.event.homeCompetitor.name;
    const away = item.event.awayCompetitor.name;

    const homeLogo = item.event.homeCompetitor.logoUrl || "";
    const awayLogo = item.event.awayCompetitor.logoUrl || "";

    const league = item.event.league ? item.event.league.name : null;
    const sportName = item.event.sport?.name || "Sport";

    const sportKey =
        (item.event.sport as any)?.slug ||
        (item.event as any)?.sportKey ||
        (item as any)?.sportKey ||
        "";

    const sportVisual = sportVisualByKey(sportKey);

    const bookmaker = resolveBookmaker(item);

    const startLabel = formatShortDateTime(item.event.startTime);
    const createdLabel = (item as any)?.createdAt ? formatDateTime((item as any).createdAt) : "";

    const pickText = useMemo(
        () => prettifyPick(item.market, item.selection, home, away),
        [item.market, item.selection, home, away]
    );

    const stakePct = useMemo(() => computeStakePercent(item.stake), [item.stake]);

    const pnlPct = useMemo(
        () => computePnlPercent(item.result, item.stake, item.odds),
        [item.result, item.stake, item.odds]
    );

    const formattedPnl = pnlPct !== null ? formatPercent(pnlPct) : null;

    const hasDescription = Boolean((item as any)?.description && String((item as any).description).trim());
    const descriptionText = hasDescription ? String((item as any).description).trim() : "";

    const stakeLabel = `${formatNumber(stakePct, 1)}%`;
    const oddsLabel = formatNumber(item.odds, 2);

    return (
        <article className={styles.card}>
            <div className={styles.row}>
                <div className={styles.leftCol}>
                    <div className={styles.metaTop}>
<span
    className={`${styles.sportPill} ${sportVisual.pillClassName}`}
    title={sportName}
>
    <Icon
        icon={sportVisual.icon}
        className={`${styles.sportIcon} ${sportVisual.iconClassName}`}
        aria-hidden="true"
    />
</span>

                        <div className={styles.metaStack}>
                            <div className={styles.leagueText} title={league ? league : sportName}>
                                🏳️ {league ? league : sportName}
                            </div>
                            {bookmaker ? (
                                <div className={styles.bookmakerText} title={bookmaker}>
                                    {bookmaker}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div
                        className={styles.metaBottom}
                        title={createdLabel ? `Введено: ${createdLabel}` : undefined}
                    >
                        ⏱ {startLabel}
                    </div>
                </div>

                <div className={styles.midCol}>
                    <div className={styles.teamRow}>
                        {homeLogo ? (
                            <img className={styles.teamLogo} src={homeLogo} alt="" />
                        ) : (
                            <span className={styles.teamLogoFallback} />
                        )}
                        <span className={styles.teamName} title={home}>
                            {home}
                        </span>
                    </div>

                    <div className={styles.teamRow}>
                        {awayLogo ? (
                            <img className={styles.teamLogo} src={awayLogo} alt="" />
                        ) : (
                            <span className={styles.teamLogoFallback} />
                        )}
                        <span className={styles.teamName} title={away}>
                            {away}
                        </span>
                    </div>
                </div>

                <div className={styles.rightCol}>
                    <div className={styles.metrics}>
                        <div className={styles.metric}>
                            <div className={styles.metricLabel}>Прогноз</div>
                            <div className={styles.metricValue}>
                                <span className={styles.valuePill}>{pickText}</span>
                            </div>
                        </div>

                        <div className={styles.metric}>
                            <div className={styles.metricLabel}>Ставка</div>
                            <div className={styles.metricValue}>
                                <span className={styles.valuePill}>{stakeLabel}</span>
                            </div>
                        </div>

                        <div className={styles.metric}>
                            <div className={styles.metricLabel}>Коэффициент</div>
                            <div className={styles.metricValue}>
                                <span className={styles.valuePill}>{oddsLabel}</span>
                            </div>
                        </div>

                        <div className={styles.metricResult}>
                            <div className={styles.metricLabel}>Результат</div>
                            <div className={styles.metricValueResult}>
                                <span className={`${styles.resultPill} ${resultTone(item.result)}`}>
                                    {resultIcon(item.result)}
                                    {formattedPnl ? <span className={styles.resultPnl}>{formattedPnl}</span> : null}
                                </span>

                                {hasDescription ? (
                                    <button
                                        className={styles.descBtn}
                                        type="button"
                                        onClick={() => setOpenDesc((v) => !v)}
                                    >
                                        {openDesc ? (
                                            <ChevronUp className={styles.descIcon} />
                                        ) : (
                                            <ChevronDown className={styles.descIcon} />
                                        )}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {hasDescription && openDesc ? (
                <div className={styles.desc}>{descriptionText}</div>
            ) : null}
        </article>
    );
}