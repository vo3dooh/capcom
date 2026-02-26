import { Link } from "react-router-dom";
import { useChannelsList } from "../model/useChannelsList";
import styles from "./ChannelsList.module.css";

export function ChannelsList() {
    const { items, loading, error } = useChannelsList();

    if (loading) {
        return <div className={styles.state}>Загрузка…</div>;
    }

    if (error) {
        return <div className={styles.stateError}>{error}</div>;
    }

    if (!items.length) {
        return <div className={styles.state}>Каналов пока нет</div>;
    }

    return (
        <div className={styles.grid}>
            {items.map((c) => (
                <Link key={c.id} to={`/channels/${c.slug}`} className={styles.card}>
                    <div className={styles.cardTop}>
                        <div className={styles.cardTitle}>{c.name}</div>
                        <div className={styles.cardMeta}>{c.membersCount} участников</div>
                    </div>

                    <div className={styles.cardDesc}>
                        {c.description ? c.description : "Описание не задано"}
                    </div>

                    <div className={styles.cardBottom}>
                        <div className={styles.pill}>ROI {c.stats ? c.stats.roi.toFixed(1) : "0.0"}%</div>
                        <div className={styles.pill}>WR {c.stats ? c.stats.winRate.toFixed(1) : "0.0"}%</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}