import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/shared/ui/Modal";
import { ChannelSettingsDto } from "../api/channelSettingsApi";
import { useChannelSettings } from "../model/useChannelSettings";
import styles from "./ChannelSettings.module.css";

type SettingsTab = "general" | "branding" | "social" | "team" | "subscriptions";

const TAB_ITEMS: Array<{ key: SettingsTab; label: string }> = [
    { key: "general", label: "Общие настройки канала" },
    { key: "branding", label: "Оформление канала" },
    { key: "social", label: "Социальные сети" },
    { key: "team", label: "Команда канала" },
    { key: "subscriptions", label: "Платные подписки" },
];

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

    const [activeTab, setActiveTab] = useState<SettingsTab>("general");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [description, setDescription] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
    const [joinPolicy, setJoinPolicy] = useState<"open" | "request" | "inviteOnly">("open");
    const [telegramUrl, setTelegramUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [vkUrl, setVkUrl] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
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
        setTelegramUrl(form.telegramUrl);
        setTwitterUrl(form.twitterUrl);
        setInstagramUrl(form.instagramUrl);
        setVkUrl(form.vkUrl);
        setWebsiteUrl(form.websiteUrl);
    }, [form]);

    const slugError = useMemo(() => {
        if (!username.trim()) return "Юзернейм не может быть пустым";
        if (!/^[a-z0-9-]+$/.test(username)) return "Разрешены только a-z, 0-9 и -";
        return null;
    }, [username]);

    const avatarError = useMemo(() => urlError(avatarUrl), [avatarUrl]);
    const coverError = useMemo(() => urlError(coverUrl), [coverUrl]);
    const telegramError = useMemo(() => urlError(telegramUrl), [telegramUrl]);
    const twitterError = useMemo(() => urlError(twitterUrl), [twitterUrl]);
    const instagramError = useMemo(() => urlError(instagramUrl), [instagramUrl]);
    const vkError = useMemo(() => urlError(vkUrl), [vkUrl]);
    const websiteError = useMemo(() => urlError(websiteUrl), [websiteUrl]);

    const hasValidationError =
        !!slugError || !!avatarError || !!coverError || !!telegramError || !!twitterError || !!instagramError || !!vkError || !!websiteError;

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
            telegramUrl: telegramUrl.trim(),
            twitterUrl: twitterUrl.trim(),
            instagramUrl: instagramUrl.trim(),
            vkUrl: vkUrl.trim(),
            websiteUrl: websiteUrl.trim(),
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
            <form className={styles.channelSettingsLayout} onSubmit={onSubmit}>
                <aside className={styles.sidebar}>
                    {TAB_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={item.key === activeTab ? styles.sidebarItemActive : styles.sidebarItem}
                            onClick={() => setActiveTab(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </aside>

                <section className={styles.contentCard}>
                    {activeTab === "general" ? (
                        <>
                            <h2 className={styles.sectionTitle}>Общие настройки канала</h2>
                            <p className={styles.sectionDescription}>Измените базовые данные и режим видимости канала.</p>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Название канала</label>
                                <input className={styles.fieldInput} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Юзернейм канала</label>
                                <div className={styles.slugInputWrap}>
                                    <span className={styles.slugPrefix}>@</span>
                                    <input
                                        className={styles.slugInput}
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(normalizeSlug(e.target.value))}
                                    />
                                </div>
                                {slugError ? <div className={styles.fieldError}>{slugError}</div> : null}
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Описание канала</label>
                                <textarea
                                    className={styles.fieldTextarea}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Видимость канала</label>
                                <select
                                    className={styles.fieldSelect}
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value as "public" | "private" | "unlisted")}
                                >
                                    <option value="public">public</option>
                                    <option value="private">private</option>
                                    <option value="unlisted">unlisted</option>
                                </select>
                            </div>

                            <div className={styles.dangerZone}>
                                <div className={styles.dangerZoneTitle}>Danger zone</div>
                                <div className={styles.dangerZoneText}>Удаление канала необратимо. Все связанные данные будут удалены.</div>
                                {deleteError ? <div className={styles.fieldError}>{deleteError}</div> : null}
                                <button className={styles.deleteButton} type="button" onClick={() => setConfirmOpen(true)} disabled={deleting}>
                                    {deleting ? "Удаление…" : "Удалить канал"}
                                </button>
                            </div>
                        </>
                    ) : null}

                    {activeTab === "branding" ? (
                        <>
                            <h2 className={styles.sectionTitle}>Оформление канала</h2>
                            <p className={styles.sectionDescription}>Настройте визуальное представление аватара и обложки канала.</p>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Аватар канала (URL)</label>
                                <div className={styles.previewLine}>
                                    <div className={styles.avatarPreviewWrap}>
                                        {avatarUrl.trim() ? <img className={styles.avatarPreview} src={avatarUrl.trim()} alt="avatar preview" /> : null}
                                    </div>
                                    <input
                                        className={styles.fieldInput}
                                        type="url"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="https://example.com/channel-avatar.png"
                                    />
                                </div>
                                {avatarError ? <div className={styles.fieldError}>{avatarError}</div> : null}
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Обложка канала (URL)</label>
                                <div className={styles.previewLine}>
                                    <div className={styles.coverPreviewWrap}>
                                        {coverUrl.trim() ? <img className={styles.coverPreview} src={coverUrl.trim()} alt="cover preview" /> : null}
                                    </div>
                                    <input
                                        className={styles.fieldInput}
                                        type="url"
                                        value={coverUrl}
                                        onChange={(e) => setCoverUrl(e.target.value)}
                                        placeholder="https://example.com/channel-cover.jpg"
                                    />
                                </div>
                                {coverError ? <div className={styles.fieldError}>{coverError}</div> : null}
                            </div>
                        </>
                    ) : null}

                    {activeTab === "social" ? (
                        <>
                            <h2 className={styles.sectionTitle}>Социальные сети</h2>
                            <p className={styles.sectionDescription}>Ссылки будут отображаться в профиле канала.</p>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Telegram</label>
                                <input
                                    className={styles.fieldInput}
                                    type="url"
                                    value={telegramUrl}
                                    onChange={(e) => setTelegramUrl(e.target.value)}
                                    placeholder="https://t.me/channel_name"
                                />
                                {telegramError ? <div className={styles.fieldError}>{telegramError}</div> : null}
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Twitter</label>
                                <input
                                    className={styles.fieldInput}
                                    type="url"
                                    value={twitterUrl}
                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                    placeholder="https://twitter.com/channel_name"
                                />
                                {twitterError ? <div className={styles.fieldError}>{twitterError}</div> : null}
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Instagram</label>
                                <input
                                    className={styles.fieldInput}
                                    type="url"
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    placeholder="https://instagram.com/channel_name"
                                />
                                {instagramError ? <div className={styles.fieldError}>{instagramError}</div> : null}
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>VK</label>
                                <input
                                    className={styles.fieldInput}
                                    type="url"
                                    value={vkUrl}
                                    onChange={(e) => setVkUrl(e.target.value)}
                                    placeholder="https://vk.com/channel_name"
                                />
                                {vkError ? <div className={styles.fieldError}>{vkError}</div> : null}
                            </div>

                            <div className={styles.formRow}>
                                <label className={styles.fieldLabel}>Website</label>
                                <input
                                    className={styles.fieldInput}
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    placeholder="https://example.com"
                                />
                                {websiteError ? <div className={styles.fieldError}>{websiteError}</div> : null}
                            </div>
                        </>
                    ) : null}

                    {activeTab === "team" ? (
                        <>
                            <h2 className={styles.sectionTitle}>Команда канала</h2>
                            <p className={styles.sectionDescription}>Скоро будет.</p>
                        </>
                    ) : null}

                    {activeTab === "subscriptions" ? (
                        <>
                            <h2 className={styles.sectionTitle}>Платные подписки</h2>
                            <p className={styles.sectionDescription}>Скоро будет.</p>
                        </>
                    ) : null}
                </section>

                <div className={styles.footerRow}>
                    {error ? <div className={styles.fieldError}>{error}</div> : null}
                    {ok ? <div className={styles.successMessage}>Сохранено</div> : null}
                    <button className={styles.saveButton} type="submit" disabled={saving || hasValidationError}>
                        {saving ? "Сохранение…" : "Сохранить"}
                    </button>
                </div>
            </form>

            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Подтверждение удаления канала">
                <div className={styles.modalBody}>
                    <div className={styles.modalTitle}>Подтвердите удаление канала</div>
                    <div className={styles.modalText}>Введите DELETE, чтобы подтвердить удаление канала.</div>
                    <input className={styles.fieldInput} type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                    <div className={styles.modalActions}>
                        <button className={styles.secondaryButton} type="button" onClick={() => setConfirmOpen(false)}>
                            Отмена
                        </button>
                        <button
                            className={styles.deleteButton}
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
