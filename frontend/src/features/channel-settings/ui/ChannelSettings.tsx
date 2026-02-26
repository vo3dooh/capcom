import { useState } from "react";
import { useChannelSettings } from "../model/useChannelSettings";
import styles from "./ChannelSettings.module.css";

export function ChannelSettings({ slug }: { slug: string }) {
    const { save, saving, error, ok, initial } = useChannelSettings(slug);

    const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">(initial.visibility);
    const [joinPolicy, setJoinPolicy] = useState<"open" | "request" | "inviteOnly">(initial.joinPolicy);
    const [predVis, setPredVis] = useState<"public" | "members">(initial.predictionsVisibility);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        await save({
            visibility,
            joinPolicy,
            predictionsVisibility: predVis,
        });
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.row}>
                <label className={styles.label}>Видимость канала</label>
                <select
                    className={styles.select}
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                >
                    <option value="public">public</option>
                    <option value="private">private</option>
                    <option value="unlisted">unlisted</option>
                </select>
            </div>

            <div className={styles.row}>
                <label className={styles.label}>Политика вступления</label>
                <select
                    className={styles.select}
                    value={joinPolicy}
                    onChange={(e) => setJoinPolicy(e.target.value as any)}
                >
                    <option value="open">open</option>
                    <option value="request">request</option>
                    <option value="inviteOnly">inviteOnly</option>
                </select>
            </div>

            <div className={styles.row}>
                <label className={styles.label}>Доступ к прогнозам</label>
                <select
                    className={styles.select}
                    value={predVis}
                    onChange={(e) => setPredVis(e.target.value as any)}
                >
                    <option value="public">для всех участников (авторизованных)</option>
                    <option value="members">только для подписчиков</option>
                </select>
            </div>

            {error ? <div className={styles.error}>{error}</div> : null}
            {ok ? <div className={styles.ok}>Сохранено</div> : null}

            <button className={styles.btn} type="submit" disabled={saving}>
                {saving ? "Сохранение…" : "Сохранить"}
            </button>
        </form>
    );
}