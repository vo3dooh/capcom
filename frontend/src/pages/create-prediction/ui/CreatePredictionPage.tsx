import { useParams } from "react-router-dom";
import { OddsPredictionBuilder } from "@/features/odds-browser/ui/OddsPredictionBuilder";
import styles from "./CreatePredictionPage.module.css";

export function CreatePredictionPage() {
    const { slug } = useParams();
    if (!slug) return null;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Создание прогноза</h1>
                <div className={styles.subtitle}>Выбери событие и коэффициент, затем укажи ставку</div>
            </div>

            <OddsPredictionBuilder slug={slug} />
        </div>
    );
}