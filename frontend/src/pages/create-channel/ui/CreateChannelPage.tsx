import { CreateChannelForm } from "@/features/channel-create/ui/CreateChannelForm";
import styles from "./CreateChannelPage.module.css";

export function CreateChannelPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Создание канала</h1>
                <div className={styles.subtitle}>Заполни базовую информацию, потом настроим детали</div>
            </div>

            <CreateChannelForm />
        </div>
    );
}