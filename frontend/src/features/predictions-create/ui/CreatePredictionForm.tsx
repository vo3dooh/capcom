import { useMemo, useState } from "react";
import { useCreatePrediction } from "../model/useCreatePrediction";
import styles from "./CreatePredictionForm.module.css";
import { useSports } from "@/shared/model/useSports";

export function CreatePredictionForm({ slug }: { slug: string }) {
    const { submit, saving, error } = useCreatePrediction(slug);
    const sports = useSports();

    const [sportId, setSportId] = useState("");
    const [leagueName, setLeagueName] = useState("");
    const [competitorType, setCompetitorType] = useState<"team" | "player">("team");
    const [homeName, setHomeName] = useState("");
    const [awayName, setAwayName] = useState("");
    const [startTime, setStartTime] = useState("");
    const [odds, setOdds] = useState("1.80");
    const [stake, setStake] = useState("1");
    const [market, setMarket] = useState("");
    const [selection, setSelection] = useState("");

    const canSubmit = useMemo(() => {
        if (saving) return false;
        if (sports.loading) return false;
        if (sports.error) return false;

        const oddsNum = Number(odds);
        const stakeNum = Number(stake);

        return (
            sportId.trim().length > 0 &&
            homeName.trim().length > 0 &&
            awayName.trim().length > 0 &&
            startTime.trim().length > 0 &&
            market.trim().length > 0 &&
            selection.trim().length > 0 &&
            Number.isFinite(oddsNum) &&
            oddsNum > 1 &&
            Number.isFinite(stakeNum) &&
            stakeNum > 0
        );
    }, [
        saving,
        sports.loading,
        sports.error,
        sportId,
        homeName,
        awayName,
        startTime,
        market,
        selection,
        odds,
        stake,
    ]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;

        const oddsNum = Number(odds);
        const stakeNum = Number(stake);

        await submit({
            sportId: sportId.trim(),
            leagueName: leagueName.trim().length ? leagueName.trim() : null,
            competitorType,
            homeName: homeName.trim(),
            awayName: awayName.trim(),
            startTime: startTime.trim(),
            odds: oddsNum,
            stake: stakeNum,
            market: market.trim(),
            selection: selection.trim(),
        });
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Спорт</label>

                    {sports.loading ? (
                        <div className={styles.hint}>Загрузка спортов…</div>
                    ) : sports.error ? (
                        <div className={styles.error}>{sports.error}</div>
                    ) : (
                        <select
                            className={styles.select}
                            value={sportId}
                            onChange={(e) => setSportId(e.target.value)}
                        >
                            <option value="">Выбери спорт</option>
                            {sports.items.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Лига (необязательно)</label>
                    <input
                        className={styles.input}
                        value={leagueName}
                        onChange={(e) => setLeagueName(e.target.value)}
                        placeholder="Premier League"
                    />
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Тип соперников</label>
                    <select
                        className={styles.select}
                        value={competitorType}
                        onChange={(e) => setCompetitorType(e.target.value as "team" | "player")}
                    >
                        <option value="team">команды</option>
                        <option value="player">игроки</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Время начала</label>
                    <input
                        className={styles.input}
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Хозяева</label>
                    <input
                        className={styles.input}
                        value={homeName}
                        onChange={(e) => setHomeName(e.target.value)}
                        placeholder="Team A"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Гости</label>
                    <input
                        className={styles.input}
                        value={awayName}
                        onChange={(e) => setAwayName(e.target.value)}
                        placeholder="Team B"
                    />
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Маркет</label>
                    <input
                        className={styles.input}
                        value={market}
                        onChange={(e) => setMarket(e.target.value)}
                        placeholder="Победа / Фора / Тотал"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Выбор</label>
                    <input
                        className={styles.input}
                        value={selection}
                        onChange={(e) => setSelection(e.target.value)}
                        placeholder="Team A win"
                    />
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Коэффициент</label>
                    <input
                        className={styles.input}
                        value={odds}
                        onChange={(e) => setOdds(e.target.value)}
                        inputMode="decimal"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Ставка</label>
                    <input
                        className={styles.input}
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        inputMode="decimal"
                    />
                </div>
            </div>

            {error ? <div className={styles.error}>{error}</div> : null}

            <button className={styles.btnPrimary} type="submit" disabled={!canSubmit}>
                {saving ? "Создание…" : "Создать прогноз"}
            </button>
        </form>
    );
}