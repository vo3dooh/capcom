import { useCallback, useEffect, useState } from "react";
import { ChannelSettingsDto, ChannelSettingsModel, deleteChannel, fetchChannelSettings, patchChannelSettings } from "../api/channelSettingsApi";
import { HttpError } from "@/shared/api/http";

const defaultForm: ChannelSettingsDto = {
    name: "",
    slug: "",
    description: "",
    avatarUrl: "",
    coverUrl: "",
    visibility: "public",
    joinPolicy: "open",
    telegramUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    vkUrl: "",
    websiteUrl: "",
};

function toForm(data: ChannelSettingsModel): ChannelSettingsDto {
    return {
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        avatarUrl: data.avatarUrl ?? "",
        coverUrl: data.coverUrl ?? "",
        visibility: data.visibility,
        joinPolicy: data.joinPolicy,
        telegramUrl: data.telegramUrl ?? "",
        twitterUrl: data.twitterUrl ?? "",
        instagramUrl: data.instagramUrl ?? "",
        vkUrl: data.vkUrl ?? "",
        websiteUrl: data.websiteUrl ?? "",
    };
}

export function useChannelSettings(slug: string) {
    const [form, setForm] = useState<ChannelSettingsDto>(defaultForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);

        fetchChannelSettings(slug)
            .then((data) => setForm(toForm(data)))
            .catch((e: unknown) => {
                if (e instanceof HttpError) setError(e.message);
                else setError("Не удалось загрузить настройки");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        load();
    }, [load]);

    async function save(dto: ChannelSettingsDto): Promise<{ updated: ChannelSettingsModel | null; error: unknown | null }> {
        if (saving) return { updated: null, error: null };
        setSaving(true);
        setError(null);
        setOk(false);

        try {
            const updated = await patchChannelSettings(slug, dto);
            setForm(toForm(updated));
            setOk(true);
            return { updated, error: null };
        } catch (e: unknown) {
            if (e instanceof HttpError) setError(e.message);
            else setError("Не удалось сохранить настройки");
            return { updated: null, error: e };
        } finally {
            setSaving(false);
        }
    }

    async function removeChannel() {
        if (deleting) return false;
        setDeleting(true);
        setDeleteError(null);

        try {
            await deleteChannel(slug);
            return true;
        } catch (e: unknown) {
            if (e instanceof HttpError) setDeleteError(e.message);
            else setDeleteError("Не удалось удалить канал");
            return false;
        } finally {
            setDeleting(false);
        }
    }

    return { form, loading, save, saving, error, ok, deleting, deleteError, removeChannel };
}
