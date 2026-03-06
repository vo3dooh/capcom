import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChannelSettings } from "@/features/channel-settings/ui/ChannelSettings";
import { Toast, ToastType } from "@/shared/ui/Toast";
import styles from "./ChannelSettingsPage.module.css";

type PageToast = {
    type: ToastType;
    title: string;
    description: string;
    id: number;
};

export function ChannelSettingsPage() {
    const { slug } = useParams();
    const [toast, setToast] = useState<PageToast | null>(null);

    useEffect(() => {
        if (!toast) return;

        const timerId = window.setTimeout(() => {
            setToast(null);
        }, 4000);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [toast]);

    function handleSaveResult(type: ToastType) {
        if (type === "success") {
            setToast({
                type: "success",
                title: "Настройки сохранены",
                description: "Изменения успешно применены.",
                id: Date.now(),
            });
            return;
        }

        setToast({
            type: "error",
            title: "Ошибка сохранения",
            description: "Не удалось сохранить изменения.",
            id: Date.now(),
        });
    }

    if (!slug) return null;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Настройки канала</h1>
                    <div className={styles.subtitle}>Управляйте параметрами канала и сохраните изменения одной кнопкой.</div>
                </div>
                <div className={styles.toastSlot}>{toast ? <Toast key={toast.id} type={toast.type} title={toast.title} description={toast.description} onClose={() => setToast(null)} /> : null}</div>
            </div>
            <ChannelSettings slug={slug} onSaveResult={handleSaveResult} />
        </div>
    );
}
