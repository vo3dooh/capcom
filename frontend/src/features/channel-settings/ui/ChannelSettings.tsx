import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/shared/ui/Modal";
import { ChannelSettingsDto } from "../api/channelSettingsApi";
import { useChannelSettings } from "../model/useChannelSettings";
import styles from "./ChannelSettings.module.css";

function normalizeSlug(value: string): string {
    return value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

function urlError(value: string): string | null {
    const clean = value.trim();
    if (!clean) return null;
    if (clean.startsWith("http://") || clean.startsWith("https://")) return null;
    return "Ссылка должна начинаться с http:// или https://";
}

export function ChannelSettings({ slug }: { slug: string }) {
    const navigate = useNavigate();
    const { form, loading, save, saving, error, ok, deleting, deleteError, removeChannel } = useChannelSettings(slug);

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [description, setDescription] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
    const [joinPolicy, setJoinPolicy] = useState<"open" | "request" | "inviteOnly">("open");
    const [predVis, setPredVis] = useState<"public" | "members">("public");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    useEffect(() => {
        setName(form.name);
        setUsername(form.slug);
        setDescription(form.description);
        setAvatarUrl(form.avatarUrl);
        setCoverUrl(form.coverUrl);
        setVisibility(form.visibility);
        setJoinPolicy(form.joinPolicy);
        setPredVis(form.predictionsVisibility);
    }, [form]);

    const slugError = useMemo(() => {
        if (!username.trim()) return "Юзернейм не может быть пустым";
        if (!/^[a-z0-9-]+$/.test(username)) return "Разрешены только a-z, 0-9 и -";
        return null;
    }, [username]);

    const avatarError = useMemo(() => urlError(avatarUrl), [avatarUrl]);
    const coverError = useMemo(() => urlError(coverUrl), [coverUrl]);

    const hasValidationError = !!slugError || !!avatarError || !!coverError;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (hasValidationError) return;

        const payload: ChannelSettingsDto = {
            name: name.trim(),
            slug: username,
            description: description.trim(),
            avatarUrl: avatarUrl.trim(),
            coverUrl: coverUrl.trim(),
            visibility,
            joinPolicy,
            predictionsVisibility: predVis,
        };

        const updated = await save(payload);
        if (!updated) return;

        if (updated.slug !== slug) {
            navigate(`/channels/${updated.slug}/settings`, { replace: true });
        }
    }

    async function confirmDelete() {
        if (confirmText !== "DELETE") return;
        const okDelete = await removeChannel();
        if (!okDelete) return;
        navigate("/channels", { replace: true, state: { channelDeleted: true } });
    }

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <>
            <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.row}>
                    <label className={styles.label}>Название канала</label>
                    <input className={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>Юзернейм канала</label>
                    <div className={styles.slugInputWrap}>
                        <span className={styles.slugPrefix}>@</span>
                        <input
                            className={styles.slugInput}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(normalizeSlug(e.target.value))}
                        />
                    </div>
                    {slugError ? <div className={styles.error}>{slugError}</div> : null}
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>Описание</label>
                    <textarea
                        className={styles.textarea}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>Ссылка на аватар</label>
                    <input
                        className={styles.input}
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                    />
                    <div className={styles.previewRow}>
                        <div className={styles.avatarPreviewWrap}>
                            {avatarUrl.trim() ? <img className={styles.avatarPreview} src={avatarUrl.trim()} alt="avatar preview" /> : null}
                        </div>
                    </div>
                    {avatarError ? <div className={styles.error}>{avatarError}</div> : null}
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>Ссылка на обложку</label>
                    <input
                        className={styles.input}
                        type="url"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="https://..."
                    />
                    <div className={styles.previewRow}>
                        <div className={styles.coverPreviewWrap}>
                            {coverUrl.trim() ? <img className={styles.coverPreview} src={coverUrl.trim()} alt="cover preview" /> : null}
                        </div>
                    </div>
                    {coverError ? <div className={styles.error}>{coverError}</div> : null}
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>Видимость канала</label>
                    <select
                        className={styles.select}
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as "public" | "private" | "unlisted")}
                    >
                        <option value="public">public</option>
                        <option value="private">private</option>
                        <option value="unlisted">unlisted</option>
                    </select>
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>Политика вступления</label>
                    <select
                        className={styles.select}
                        value={joinPolicy}
                        onChange={(e) => setJoinPolicy(e.target.value as "open" | "request" | "inviteOnly")}
                    >
                        <option value="open">open</option>
                        <option value="request">request</option>
                        <option value="inviteOnly">inviteOnly</option>
                    </select>
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>Доступ к прогнозам</label>
                    <select
                        className={styles.select}
                        value={predVis}
                        onChange={(e) => setPredVis(e.target.value as "public" | "members")}
                    >
                        <option value="public">для всех участников (авторизованных)</option>
                        <option value="members">только для подписчиков</option>
                    </select>
                </div>

                {error ? <div className={styles.error}>{error}</div> : null}
                {ok ? <div className={styles.ok}>Сохранено</div> : null}

                <button className={styles.btn} type="submit" disabled={saving || hasValidationError}>
                    {saving ? "Сохранение…" : "Сохранить"}
                </button>
            </form>

            <div className={styles.dangerZone}>
                <div className={styles.dangerTitle}>Опасная зона</div>
                <div className={styles.dangerText}>Удаление канала необратимо. Все связанные данные будут удалены.</div>
                {deleteError ? <div className={styles.error}>{deleteError}</div> : null}
                <button className={styles.deleteBtn} type="button" onClick={() => setConfirmOpen(true)} disabled={deleting}>
                    {deleting ? "Удаление…" : "Удалить канал"}
                </button>
            </div>

            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Подтверждение удаления канала">
                <div className={styles.modalBody}>
                    <div className={styles.modalTitle}>Подтвердите удаление канала</div>
                    <div className={styles.modalText}>Введите DELETE, чтобы подтвердить удаление канала.</div>
                    <input
                        className={styles.input}
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                    />
                    <div className={styles.modalActions}>
                        <button className={styles.btn} type="button" onClick={() => setConfirmOpen(false)}>
                            Отмена
                        </button>
                        <button
                            className={styles.deleteBtn}
                            type="button"
                            onClick={confirmDelete}
                            disabled={deleting || confirmText !== "DELETE"}
                        >
                            {deleting ? "Удаление…" : "Подтвердить удаление"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
