import { useState } from "react";
import { useCreateChannel } from "../model/useCreateChannel";
import styles from "./CreateChannelForm.module.css";

export function CreateChannelForm() {
    const { submit, saving, error } = useCreateChannel();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
    const [joinPolicy, setJoinPolicy] = useState<"open" | "request" | "inviteOnly">("open");
    const [predictionsVisibility, setPredictionsVisibility] = useState<"public" | "members">("public");
    const [startingBankroll, setStartingBankroll] = useState("1000");
    const [bankrollCurrency, setBankrollCurrency] = useState("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        const bankrollNum = Number(startingBankroll);
        const bankroll = Number.isFinite(bankrollNum) ? bankrollNum : 1000;

        await submit({
            name: name.trim(),
            slug: slug.trim().length ? slug.trim() : undefined,
            description: description.trim().length ? description.trim() : null,
            visibility,
            joinPolicy,
            predictionsVisibility,
            startingBankroll: bankroll,
            bankrollCurrency: bankrollCurrency.trim().length ? bankrollCurrency.trim() : null,
        });
    }

    const disabled = saving || !name.trim().length;

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Название</label>
                    <input
                        className={styles.input}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например: Capper Academy"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Slug (необязательно)</label>
                    <input
                        className={styles.input}
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="capper-academy"
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Описание</label>
                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Коротко о канале"
                />
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Видимость</label>
                    <select className={styles.select} value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                        <option value="public">public</option>
                        <option value="private">private</option>
                        <option value="unlisted">unlisted</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Политика вступления</label>
                    <select className={styles.select} value={joinPolicy} onChange={(e) => setJoinPolicy(e.target.value as any)}>
                        <option value="open">open</option>
                        <option value="request">request</option>
                        <option value="inviteOnly">inviteOnly</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Доступ к прогнозам</label>
                    <select
                        className={styles.select}
                        value={predictionsVisibility}
                        onChange={(e) => setPredictionsVisibility(e.target.value as any)}
                    >
                        <option value="public">для всех (авторизованных)</option>
                        <option value="members">только для подписчиков</option>
                    </select>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <label className={styles.label}>Стартовый банкролл</label>
                    <input
                        className={styles.input}
                        value={startingBankroll}
                        onChange={(e) => setStartingBankroll(e.target.value)}
                        inputMode="decimal"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Валюта (необязательно)</label>
                    <input
                        className={styles.input}
                        value={bankrollCurrency}
                        onChange={(e) => setBankrollCurrency(e.target.value)}
                        placeholder="USD"
                    />
                </div>
            </div>

            {error ? <div className={styles.error}>{error}</div> : null}

            <button className={styles.btnPrimary} type="submit" disabled={disabled}>
                {saving ? "Создание…" : "Создать канал"}
            </button>
        </form>
    );
}