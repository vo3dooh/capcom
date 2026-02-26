import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpError } from "@/shared/api/http";
import { createChannel, CreateChannelDto } from "../api/channelCreateApi";

export function useCreateChannel() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(dto: CreateChannelDto) {
        if (saving) return;
        setSaving(true);
        setError(null);

        try {
            const created = await createChannel(dto);
            navigate(`/channels/${created.slug}`);
        } catch (e: unknown) {
            if (e instanceof HttpError) setError(e.message);
            else setError("Не удалось создать канал");
        } finally {
            setSaving(false);
        }
    }

    return { submit, saving, error };
}