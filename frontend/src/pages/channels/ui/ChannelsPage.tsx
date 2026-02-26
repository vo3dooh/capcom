import { Link } from "react-router-dom";
import { ChannelsList } from "@/features/channels-list/ui/ChannelsList";
import styles from "./ChannelsPage.module.css";

export function ChannelsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <h1 className={styles.title}>Каналы</h1>
                    <Link className={styles.createBtn} to="/channels/new">
                        Создать канал
                    </Link>
                </div>
                <div className={styles.subtitle}>Список публичных каналов</div>
            </div>

            <ChannelsList />
        </div>
    );
}