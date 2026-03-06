import { AlertCircle, CheckCircle2, X } from "lucide-react";
import styles from "./Toast.module.css";

type ToastType = "success" | "error";

type ToastProps = {
    type: ToastType;
    title: string;
    description: string;
    onClose: () => void;
};

export function Toast({ type, title, description, onClose }: ToastProps) {
    const isSuccess = type === "success";

    return (
        <div className={`${styles.toast} ${isSuccess ? styles.toastSuccess : styles.toastError}`} role="status" aria-live="polite">
            <div className={styles.iconWrap}>{isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}</div>
            <div className={styles.body}>
                <div className={styles.title}>{title}</div>
                <div className={styles.description}>{description}</div>
            </div>
            <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Закрыть уведомление">
                <X size={20} />
            </button>
        </div>
    );
}

export type { ToastType };
