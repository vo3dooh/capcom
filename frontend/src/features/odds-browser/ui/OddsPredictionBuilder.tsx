import { useMemo, useState } from "react";
import { useOddsSports } from "../model/useOddsSports";
import { useOddsEvents } from "../model/useOddsEvents";
import { useOddsEventOdds } from "../model/useOddsEventOdds";
import { useCreatePrediction } from "@/features/predictions-create/model/useCreatePrediction";
import styles from "./OddsPredictionBuilder.module.css";

type PickedLeague = { sportKey: string; sportId: string; title: string; group: string };
type PickedEvent = { id: string; home: string; away: string; commenceTime: string };
type PickedOutcome = { market: string; selection: string; odds: number };

export function OddsPredictionBuilder({ slug }: { slug: string }) {
    const sports = useOddsSports();

    const [league, setLeague] = useState<PickedLeague | null>(null);
    const events = useOddsEvents({ sportKey: league ? league.sportKey : null });

    const [event, setEvent] = useState<PickedEvent | null>(null);
    const eventOdds = useOddsEventOdds({ sportKey: league ? league.sportKey : null, eventId: event ? event.id : null });

    const [activeMarket, setActiveMarket] = useState<"h2h" | "spreads" | "totals">("h2h");
    const [picked, setPicked] = useState<PickedOutcome | null>(null);
    const [stake, setStake] = useState("1");

    const create = useCreatePrediction(slug);

    const canSubmit = useMemo(() => {
        const stakeNum = Number(stake);
        return (
            !!league &&
            !!event &&
            !!picked &&
            Number.isFinite(stakeNum) &&
            stakeNum >= 0.01 &&
            !create.saving
        );
    }, [league, event, picked, stake, create.saving]);

    function resetFromLeague() {
        setEvent(null);
        setPicked(null);
        setActiveMarket("h2h");
    }

    function resetFromEvent() {
        setPicked(null);
        setActiveMarket("h2h");
    }

    async function submit() {
        if (!league || !event || !picked) return;

        const stakeNum = Number(stake);
        if (!Number.isFinite(stakeNum) || stakeNum < 0.01) return;

        await create.submit({
            sportId: league.sportId,
            leagueName: league.title,
            competitorType: "team",
            homeName: event.home,
            awayName: event.away,
            startTime: event.commenceTime,
            odds: picked.odds,
            stake: stakeNum,
            market: picked.market,
            selection: picked.selection,
        });
    }

    const marketsAvailable = useMemo(() => {
        const bms = eventOdds.data?.bookmakers ?? [];
        const set = new Set<string>();
        for (const b of bms) for (const m of b.markets) set.add(m.key);
        const has = (k: string) => set.has(k);
        return {
            h2h: has("h2h"),
            spreads: has("spreads"),
            totals: has("totals"),
        };
    }, [eventOdds.data]);

    const table = useMemo(() => {
        if (!eventOdds.data) return null;

        const bookmakers = eventOdds.data.bookmakers || [];
        const rows = bookmakers.map((b) => {
            const market = b.markets.find((m) => m.key === activeMarket);
            const outcomes = market ? market.outcomes : [];
            return { bookmaker: b, outcomes };
        });

        const outcomeNames = Array.from(
            new Set(
                rows.flatMap((r) => r.outcomes.map((o) => (o.point !== null ? `${o.name} (${o.point})` : o.name))),
            ),
        );

        return { rows, outcomeNames };
    }, [eventOdds.data, activeMarket]);

    return (
        <div className={styles.wrap}>
            <div className={styles.stepTitle}>1) Выбор лиги</div>

            {sports.loading ? <div className={styles.state}>Загрузка…</div> : null}
            {sports.error ? <div className={styles.error}>{sports.error}</div> : null}

            {!sports.loading && !sports.error ? (
                <div className={styles.groups}>
                    {sports.grouped.map((g) => (
                        <div key={g.group} className={styles.group}>
                            <div className={styles.groupTitle}>{g.group}</div>

                            <div className={styles.list}>
                                {g.items.map((s) => {
                                    const disabled = !s.sportId;
                                    const active = league?.sportKey === s.key;
                                    return (
                                        <button
                                            key={s.key}
                                            className={active ? styles.itemActive : styles.item}
                                            disabled={disabled}
                                            onClick={() => {
                                                if (!s.sportId) return;
                                                setLeague({ sportKey: s.key, sportId: s.sportId, title: s.title, group: s.group });
                                                resetFromLeague();
                                            }}
                                        >
                                            {s.title} {disabled ? "(нет sportId)" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            {league ? (
                <>
                    <div className={styles.hr} />

                    <div className={styles.stepTitle}>
                        2) События — {league.group} / {league.title}
                    </div>

                    {events.loading ? <div className={styles.state}>Загрузка…</div> : null}
                    {events.error ? <div className={styles.error}>{events.error}</div> : null}

                    {!events.loading && !events.error ? (
                        <div className={styles.events}>
                            {events.items.length === 0 ? <div className={styles.state}>Событий нет</div> : null}

                            {events.items.map((e) => (
                                <button
                                    key={e.id}
                                    className={event?.id === e.id ? styles.eventActive : styles.event}
                                    onClick={() => {
                                        setEvent({ id: e.id, home: e.home, away: e.away, commenceTime: e.commenceTime });
                                        resetFromEvent();
                                    }}
                                >
                                    <div className={styles.eventTeams}>
                                        {e.home} — {e.away}
                                    </div>
                                    <div className={styles.eventTime}>{e.commenceTime}</div>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </>
            ) : null}

            {league && event ? (
                <>
                    <div className={styles.hr} />

                    <div className={styles.stepTitle}>
                        3) Коэффициенты — {event.home} — {event.away}
                    </div>

                    <div className={styles.actionsRow}>
                        <button className={styles.btn} onClick={() => eventOdds.load()} disabled={eventOdds.loading}>
                            {eventOdds.loading ? "Загрузка…" : "Загрузить коэффициенты"}
                        </button>

                        <div className={styles.tabs}>
                            <button
                                className={activeMarket === "h2h" ? styles.tabActive : styles.tab}
                                disabled={!marketsAvailable.h2h}
                                onClick={() => setActiveMarket("h2h")}
                            >
                                1X2 / H2H
                            </button>
                            <button
                                className={activeMarket === "spreads" ? styles.tabActive : styles.tab}
                                disabled={!marketsAvailable.spreads}
                                onClick={() => setActiveMarket("spreads")}
                            >
                                Фора
                            </button>
                            <button
                                className={activeMarket === "totals" ? styles.tabActive : styles.tab}
                                disabled={!marketsAvailable.totals}
                                onClick={() => setActiveMarket("totals")}
                            >
                                Тотал
                            </button>
                        </div>
                    </div>

                    {eventOdds.error ? <div className={styles.error}>{eventOdds.error}</div> : null}

                    {table ? (
                        <div className={styles.table}>
                            <div className={styles.tableHead}>
                                <div className={styles.thBookmaker}>БК</div>
                                {table.outcomeNames.map((n) => (
                                    <div key={n} className={styles.th}>{n}</div>
                                ))}
                            </div>

                            {table.rows.map((r) => (
                                <div key={r.bookmaker.key} className={styles.tr}>
                                    <div className={styles.tdBookmaker}>{r.bookmaker.title}</div>

                                    {table.outcomeNames.map((name) => {
                                        const o = r.outcomes.find((x) =>
                                            (x.point !== null ? `${x.name} (${x.point})` : x.name) === name
                                        );

                                        if (!o) return <div key={name} className={styles.tdEmpty}>—</div>;

                                        const selection = o.point !== null ? `${o.name} (${o.point})` : o.name;
                                        const active =
                                            picked?.market === activeMarket && picked?.selection === selection && picked?.odds === o.price;

                                        return (
                                            <button
                                                key={name}
                                                className={active ? styles.oddActive : styles.odd}
                                                onClick={() => setPicked({ market: activeMarket, selection, odds: o.price })}
                                            >
                                                {o.price.toFixed(2)}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.state}>Нажми “Загрузить коэффициенты”</div>
                    )}
                </>
            ) : null}

            {league && event && picked ? (
                <>
                    <div className={styles.hr} />

                    <div className={styles.stepTitle}>4) Ставка</div>

                    <div className={styles.summary}>
                        <div>
                            <b>Market:</b> {picked.market}
                        </div>
                        <div>
                            <b>Selection:</b> {picked.selection}
                        </div>
                        <div>
                            <b>Odds:</b> {picked.odds.toFixed(2)}
                        </div>
                    </div>

                    <div className={styles.stakeRow}>
                        <div className={styles.field}>
                            <div className={styles.label}>Stake</div>
                            <input className={styles.input} value={stake} onChange={(e) => setStake(e.target.value)} inputMode="decimal" />
                        </div>

                        <button className={styles.btnPrimary} disabled={!canSubmit} onClick={submit}>
                            {create.saving ? "Создание…" : "Создать прогноз"}
                        </button>
                    </div>

                    {create.error ? <div className={styles.error}>{create.error}</div> : null}
                </>
            ) : null}
        </div>
    );
}