import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Pencil, X } from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { ChannelSettingsDto } from "../api/channelSettingsApi";
import { useChannelSettings } from "../model/useChannelSettings";
import styles from "./ChannelSettings.module.css";
import { ToastType } from "@/shared/ui/Toast";
import { mapChannelSettingsSaveError } from "../lib/mapChannelSettingsSaveError";
import TelegramIcon from "@/shared/assets/social/TelegramIcon";
import VkIcon from "@/shared/assets/social/VkIcon";
import WebsiteIcon from "@/shared/assets/social/WebsiteIcon";

type SettingsTab = "general" | "branding" | "social" | "team" | "subscriptions";
type GeneralEditableField = "name" | "username" | "description" | "visibility";

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


function hasMixedCyrillicAndLatin(value: string): boolean {
    return /[A-Za-z]/.test(value) && /[А-Яа-яЁё]/.test(value);
}

function urlError(value: string): string | null {
    const clean = value.trim();
    if (!clean) return null;
    if (clean.startsWith("http://") || clean.startsWith("https://")) return null;
    return "Ссылка должна начинаться с http:// или https://";
}

type ChannelSaveResult = {
    type: ToastType;
    description?: string;
};

type ChannelSettingsProps = {
    slug: string;
    onSaveResult?: (result: ChannelSaveResult) => void;
};

type SocialKey = "telegram" | "vk" | "website";

type SocialCard = {
    key: SocialKey;
    label: string;
    placeholder: string;
    icon: typeof TelegramIcon;
};

const SOCIAL_CARDS: SocialCard[] = [
    { key: "telegram", label: "Telegram", placeholder: "https://t.me/channel_name", icon: TelegramIcon },
    { key: "vk", label: "VK", placeholder: "https://vk.com/channel_name", icon: VkIcon },
    { key: "website", label: "Website", placeholder: "https://example.com", icon: WebsiteIcon },
];

export function ChannelSettings({ slug, onSaveResult }: ChannelSettingsProps) {
    const navigate = useNavigate();
    const { form, loading, save, saving, ok, deleting, deleteError, removeChannel } = useChannelSettings(slug);

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
    const [telegramEnabled, setTelegramEnabled] = useState(false);
    const [vkEnabled, setVkEnabled] = useState(false);
    const [websiteEnabled, setWebsiteEnabled] = useState(false);
    const [savingSocial, setSavingSocial] = useState<SocialKey | null>(null);
    const [socialEditing, setSocialEditing] = useState<Record<SocialKey, boolean>>({
        telegram: false,
        vk: false,
        website: false,
    });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [editingField, setEditingField] = useState<GeneralEditableField | null>(null);

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
        setTelegramEnabled(form.telegramEnabled);
        setVkEnabled(form.vkEnabled);
        setWebsiteEnabled(form.websiteEnabled);
        setSocialEditing({
            telegram: form.telegramEnabled && !form.telegramUrl.trim(),
            vk: form.vkEnabled && !form.vkUrl.trim(),
            website: form.websiteEnabled && !form.websiteUrl.trim(),
        });
    }, [form]);

    const nameError = useMemo(() => {
        if (hasMixedCyrillicAndLatin(name.trim())) return "Название канала должно быть только на одном языке.";
        return null;
    }, [name]);

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
        !!nameError || !!slugError || !!avatarError || !!coverError || !!telegramError || !!twitterError || !!instagramError || !!vkError || !!websiteError;

    function buildPayload(overrides?: Partial<ChannelSettingsDto>): ChannelSettingsDto {
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
            telegramEnabled,
            vkEnabled,
            websiteEnabled,
        };

        return { ...payload, ...overrides };
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (hasValidationError) {
            onSaveResult?.({ type: "error", description: nameError ?? mapChannelSettingsSaveError("client_validation") });
            return;
        }

        const payload = buildPayload();

        const result = await save(payload);
        if (!result.updated) {
            onSaveResult?.({ type: "error", description: mapChannelSettingsSaveError(result.error) });
            return;
        }

        onSaveResult?.({ type: "success" });

        if (result.updated.slug !== slug) {
            navigate(`/channels/${result.updated.slug}/settings`, { replace: true });
        }
    }

    async function confirmDelete() {
        if (confirmText !== "DELETE") return;
        const okDelete = await removeChannel();
        if (!okDelete) return;
        navigate("/channels", { replace: true, state: { channelDeleted: true } });
    }

    function cancelGeneralEdit(field: GeneralEditableField) {
        if (field === "name") setName(form.name);
        if (field === "username") setUsername(form.slug);
        if (field === "description") setDescription(form.description);
        if (field === "visibility") setVisibility(form.visibility);
        setEditingField(null);
    }

    async function saveGeneralEdit(field: GeneralEditableField) {
        if (field === "name" && nameError) {
            onSaveResult?.({ type: "error", description: nameError });
            return;
        }

        if (field === "username" && slugError) {
            onSaveResult?.({ type: "error", description: mapChannelSettingsSaveError("client_validation") });
            return;
        }

        const result = await save(buildPayload());
        if (!result.updated) {
            onSaveResult?.({ type: "error", description: mapChannelSettingsSaveError(result.error) });
            return;
        }

        onSaveResult?.({ type: "success" });

        setEditingField(null);
        if (result.updated.slug !== slug) {
            navigate(`/channels/${result.updated.slug}/settings`, { replace: true });
        }
    }

    function generalDisplayValue(value: string, placeholder: string): string {
        const clean = value.trim();
        return clean ? clean : placeholder;
    }

    function getSocialValue(type: SocialKey): string {
        if (type === "telegram") return telegramUrl;
        if (type === "vk") return vkUrl;
        return websiteUrl;
    }

    function getSocialError(type: SocialKey): string | null {
        if (type === "telegram") return telegramError;
        if (type === "vk") return vkError;
        return websiteError;
    }

    function isSocialEnabled(type: SocialKey): boolean {
        if (type === "telegram") return telegramEnabled;
        if (type === "vk") return vkEnabled;
        return websiteEnabled;
    }

    function setSocialEnabled(type: SocialKey, value: boolean) {
        if (type === "telegram") setTelegramEnabled(value);
        if (type === "vk") setVkEnabled(value);
        if (type === "website") setWebsiteEnabled(value);
    }

    function setSocialValue(type: SocialKey, value: string) {
        if (type === "telegram") setTelegramUrl(value);
        if (type === "vk") setVkUrl(value);
        if (type === "website") setWebsiteUrl(value);
    }

    async function saveSocialCard(type: SocialKey) {
        const error = getSocialError(type);
        if (error) {
            onSaveResult?.({ type: "error", description: mapChannelSettingsSaveError("client_validation") });
            return;
        }

        setSavingSocial(type);
        const result = await save(buildPayload());
        setSavingSocial(null);

        if (!result.updated) {
            onSaveResult?.({ type: "error", description: mapChannelSettingsSaveError(result.error) });
            return;
        }

        onSaveResult?.({ type: "success" });
        setSocialEditing((prev) => ({ ...prev, [type]: false }));

        if (result.updated.slug !== slug) {
            navigate(`/channels/${result.updated.slug}/settings`, { replace: true });
        }
    }

    function setSocialEditMode(type: SocialKey, value: boolean) {
        setSocialEditing((prev) => ({ ...prev, [type]: value }));
    }

    async function toggleSocial(type: SocialKey, nextValue: boolean) {
        const prevValue = isSocialEnabled(type);
        const currentValue = getSocialValue(type);

        setSocialEnabled(type, nextValue);
        if (!nextValue) {
            setSocialEditMode(type, false);
        }

        setSavingSocial(type);
        const result = await save(buildPayload({
            telegramEnabled: type === "telegram" ? nextValue : telegramEnabled,
            vkEnabled: type === "vk" ? nextValue : vkEnabled,
            websiteEnabled: type === "website" ? nextValue : websiteEnabled,
        }));
        setSavingSocial(null);

        if (!result.updated) {
            setSocialEnabled(type, prevValue);
            setSocialEditMode(type, prevValue && !currentValue.trim());
            onSaveResult?.({ type: "error", description: mapChannelSettingsSaveError(result.error) });
            return;
        }

        onSaveResult?.({ type: "success" });
        if (nextValue) {
            setSocialEditMode(type, !currentValue.trim());
        }

        if (result.updated.slug !== slug) {
            navigate(`/channels/${result.updated.slug}/settings`, { replace: true });
        }
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

                <section className={styles.contentColumn}>
                    {activeTab === "general" ? (
                        <>
                            <div className={styles.generalGrid}>
                                <div className={styles.contentCard}>
                                    <label className={styles.fieldLabel}>Название канала</label>
                                    <div className={styles.editableRow}>
                                        <div className={styles.valueSlot}>
                                            {editingField === "name" ? (
                                                <input className={styles.fieldInput} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                            ) : (
                                                <div className={styles.displayValue}>{generalDisplayValue(name, "Название не указано")}</div>
                                            )}
                                        </div>
                                        {editingField === "name" ? (
                                            <div className={styles.rowActions}>
                                                <button className={`${styles.actionButton} ${styles.actionButtonSave}`} type="button" onClick={() => saveGeneralEdit("name")} disabled={saving} aria-label="Сохранить название">
                                                    <Check size={16} />
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.actionButtonCancel}`} type="button" onClick={() => cancelGeneralEdit("name")} aria-label="Отменить редактирование названия">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className={styles.actionButton} type="button" onClick={() => setEditingField("name")} aria-label="Редактировать название">
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.contentCard}>
                                    <label className={styles.fieldLabel}>Ссылка на канал</label>
                                    <div className={styles.editableRow}>
                                        <div className={styles.valueSlot}>
                                            {editingField === "username" ? (
                                                <div className={styles.slugInputWrap}>
                                                    <span className={styles.slugPrefix}>.../channels/</span>
                                                    <input
                                                        className={styles.slugInput}
                                                        type="text"
                                                        value={username}
                                                        onChange={(e) => setUsername(normalizeSlug(e.target.value))}
                                                    />
                                                </div>
                                            ) : (
                                                <div className={styles.slugDisplayWrap}>
                                                    {username.trim() ? (
                                                        <>
                                                            <span className={styles.slugPrefix}>.../channels/</span>
                                                            <span className={styles.slugValue}>{username}</span>
                                                        </>
                                                    ) : (
                                                        <span className={styles.slugValue}>Ссылка на канал не указана</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {editingField === "username" ? (
                                            <div className={styles.rowActions}>
                                                <button
                                                    className={`${styles.actionButton} ${styles.actionButtonSave}`}
                                                    type="button"
                                                    onClick={() => saveGeneralEdit("username")}
                                                    disabled={saving || !!slugError}
                                                    aria-label="Сохранить ссылку на канал"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.actionButtonCancel}`} type="button" onClick={() => cancelGeneralEdit("username")} aria-label="Отменить редактирование ссылки на канал">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className={styles.actionButton} type="button" onClick={() => setEditingField("username")} aria-label="Редактировать ссылку на канал">
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.contentCard}>
                                    <label className={styles.fieldLabel}>Описание канала</label>
                                    <div className={styles.editableRow}>
                                        <div className={styles.valueSlot}>
                                            {editingField === "description" ? (
                                                <input className={styles.fieldInput} type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                                            ) : (
                                                <div className={styles.displayValue}>{generalDisplayValue(description, "Описание не добавлено")}</div>
                                            )}
                                        </div>
                                        {editingField === "description" ? (
                                            <div className={styles.rowActions}>
                                                <button className={`${styles.actionButton} ${styles.actionButtonSave}`} type="button" onClick={() => saveGeneralEdit("description")} disabled={saving} aria-label="Сохранить описание">
                                                    <Check size={16} />
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.actionButtonCancel}`} type="button" onClick={() => cancelGeneralEdit("description")} aria-label="Отменить редактирование описания">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className={styles.actionButton} type="button" onClick={() => setEditingField("description")} aria-label="Редактировать описание">
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.contentCard}>
                                    <label className={styles.fieldLabel}>Видимость канала</label>
                                    <div className={styles.editableRow}>
                                        <div className={styles.valueSlot}>
                                            {editingField === "visibility" ? (
                                                <select
                                                    className={styles.fieldSelect}
                                                    value={visibility}
                                                    onChange={(e) => setVisibility(e.target.value as "public" | "private" | "unlisted")}
                                                >
                                                    <option value="public">public</option>
                                                    <option value="private">private</option>
                                                    <option value="unlisted">unlisted</option>
                                                </select>
                                            ) : (
                                                <div className={styles.displayValue}>{visibility}</div>
                                            )}
                                        </div>
                                        {editingField === "visibility" ? (
                                            <div className={styles.rowActions}>
                                                <button className={`${styles.actionButton} ${styles.actionButtonSave}`} type="button" onClick={() => saveGeneralEdit("visibility")} disabled={saving} aria-label="Сохранить видимость">
                                                    <Check size={16} />
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.actionButtonCancel}`} type="button" onClick={() => cancelGeneralEdit("visibility")} aria-label="Отменить редактирование видимости">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className={styles.actionButton} type="button" onClick={() => setEditingField("visibility")} aria-label="Редактировать видимость">
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.contentCard} ${styles.dangerCard}`}>
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
                            <div className={styles.contentCard}>
                                <h2 className={styles.sectionTitle}>Оформление канала</h2>
                                <p className={styles.sectionDescription}>Настройте визуальное представление аватара и обложки канала.</p>
                            </div>

                            <div className={styles.contentCard}>
                                <div className={styles.formRow}>
                                    <label className={styles.fieldLabel}>Аватар канала (URL)</label>
                                    <div className={styles.previewLine}>
                                        <div className={styles.avatarPreviewWrap}>{avatarUrl.trim() ? <img className={styles.avatarPreview} src={avatarUrl.trim()} alt="avatar preview" /> : null}</div>
                                        <input
                                            className={styles.fieldInput}
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="https://example.com/channel-avatar.png"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.contentCard}>
                                <div className={styles.formRow}>
                                    <label className={styles.fieldLabel}>Обложка канала (URL)</label>
                                    <div className={styles.previewLine}>
                                        <div className={styles.coverPreviewWrap}>{coverUrl.trim() ? <img className={styles.coverPreview} src={coverUrl.trim()} alt="cover preview" /> : null}</div>
                                        <input
                                            className={styles.fieldInput}
                                            type="url"
                                            value={coverUrl}
                                            onChange={(e) => setCoverUrl(e.target.value)}
                                            placeholder="https://example.com/channel-cover.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}

                    {activeTab === "social" ? (
                        <>
                            <div className={styles.contentCard}>
                                <h2 className={styles.sectionTitle}>Социальные сети</h2>
                                <p className={styles.sectionDescription}>Отображение иконок на обложке зависит от переключателя каждой карточки.</p>
                            </div>

                            <div className={styles.socialCards}>
                                {SOCIAL_CARDS.map((item) => {
                                    const enabled = isSocialEnabled(item.key);
                                    const value = getSocialValue(item.key);
                                    const error = getSocialError(item.key);
                                    const Icon = item.icon;
                                    const pending = saving || savingSocial === item.key;

                                    return (
                                        <div className={styles.contentCard} key={item.key}>
                                            <div className={styles.socialCardTop}>
                                                <div className={styles.socialIdentity}>
                                                    <span className={styles.socialIconWrap}>
                                                        <Icon className={styles.socialIcon} aria-hidden="true" />
                                                    </span>
                                                    <span className={styles.socialName}>{item.label}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className={`${styles.switchButton} ${enabled ? styles.switchButtonActive : ""}`}
                                                    aria-pressed={enabled}
                                                    onClick={() => toggleSocial(item.key, !enabled)}
                                                    disabled={pending}
                                                >
                                                    <span className={styles.switchThumb} />
                                                </button>
                                            </div>

                                            {enabled ? (
                                                socialEditing[item.key] ? (
                                                    <div className={styles.socialCardEditor}>
                                                        <input
                                                            className={styles.fieldInput}
                                                            type="url"
                                                            value={value}
                                                            onChange={(e) => setSocialValue(item.key, e.target.value)}
                                                            placeholder={item.placeholder}
                                                        />
                                                        <button
                                                            className={`${styles.actionButton} ${styles.actionButtonSave}`}
                                                            type="button"
                                                            onClick={() => saveSocialCard(item.key)}
                                                            disabled={pending || !value.trim() || !!error}
                                                            aria-label={`Сохранить ${item.label}`}
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className={styles.socialCardEditor}>
                                                        <div className={styles.displayValue}>{value.trim() || "Ссылка не указана"}</div>
                                                        <button
                                                            className={styles.actionButton}
                                                            type="button"
                                                            onClick={() => setSocialEditMode(item.key, true)}
                                                            disabled={pending}
                                                            aria-label={`Редактировать ${item.label}`}
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    </div>
                                                )
                                            ) : null}

                                            {enabled && socialEditing[item.key] && error ? <div className={styles.fieldError}>{error}</div> : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}

                    {activeTab === "team" ? (
                        <div className={styles.contentCard}>
                            <h2 className={styles.sectionTitle}>Команда канала</h2>
                            <p className={styles.sectionDescription}>Скоро будет.</p>
                        </div>
                    ) : null}

                    {activeTab === "subscriptions" ? (
                        <div className={styles.contentCard}>
                            <h2 className={styles.sectionTitle}>Платные подписки</h2>
                            <p className={styles.sectionDescription}>Скоро будет.</p>
                        </div>
                    ) : null}
                </section>

                {activeTab !== "general" && activeTab !== "social" ? (
                    <div className={styles.footerRow}>
                        {ok ? <div className={styles.successMessage}>Сохранено</div> : null}
                        <button className={styles.saveButton} type="submit" disabled={saving || hasValidationError}>
                            {saving ? "Сохранение…" : "Сохранить"}
                        </button>
                    </div>
                ) : null}
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
                        <button className={styles.deleteButton} type="button" onClick={confirmDelete} disabled={deleting || confirmText !== "DELETE"}>
                            {deleting ? "Удаление…" : "Подтвердить удаление"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
