import { useMemo, useState } from "react";
import { ChannelSettingsDto, patchChannelSettings } from "../api/channelSettingsApi";
import { HttpError } from "@/shared/api/http";

export function useChannelSettings(slug: string) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    const initial = useMemo(() => {
        return {
            visibility: "public" as const,
            joinPolicy: "open" as const,
            predictionsVisibility: "public" as const,
        };
    }, []);

    async function save(dto: ChannelSettingsDto) {
        if (saving) return;
        setSaving(true);
        setError(null);
        setOk(false);

        try {
            await patchChannelSettings(slug, dto);
            setOk(true);
        } catch (e: unknown) {
            if (e instanceof HttpError) setError(e.message);
            else setError("Не удалось сохранить настройки");
        } finally {
            setSaving(false);
        }
    }

    return { save, saving, error, ok, initial };
}