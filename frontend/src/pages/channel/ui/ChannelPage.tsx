import { useParams } from "react-router-dom";
import { ChannelView } from "@/features/channel-view/ui/ChannelView";
import styles from "./ChannelPage.module.css";

export function ChannelPage() {
    const { slug } = useParams();

    if (!slug) {
        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Канал</h1>
                    <div className={styles.subtitle}>Некорректный slug</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <ChannelView slug={slug} />
        </div>
    );
}