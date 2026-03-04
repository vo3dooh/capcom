import { useParams } from "react-router-dom";
import { ChannelSettings } from "@/features/channel-settings/ui/ChannelSettings";
import styles from "./ChannelSettingsPage.module.css";

export function ChannelSettingsPage() {
    const { slug } = useParams();

    if (!slug) return null;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Настройки канала</h1>
                <div className={styles.subtitle}>Управляйте параметрами канала и сохраните изменения одной кнопкой.</div>
            </div>
            <ChannelSettings slug={slug} />
        </div>
    );
}
