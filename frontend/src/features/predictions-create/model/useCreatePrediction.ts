import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpError } from "@/shared/api/http";
import { createPrediction, CreatePredictionDto } from "@/features/predictions/api/predictionsApi";

export function useCreatePrediction(slug: string) {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(dto: CreatePredictionDto) {
        if (saving) return;
        setSaving(true);
        setError(null);

        try {
            await createPrediction(slug, dto);
            navigate(`/channels/${slug}`);
        } catch (e: unknown) {
            if (e instanceof HttpError) setError(e.message);
            else setError("Не удалось создать прогноз");
        } finally {
            setSaving(false);
        }
    }

    return { submit, saving, error };
}