import "./settings-view.css"
import { useMemo, useState } from "react"
import { useSettingsProfile } from "@/features/settings/model/useSettingsProfile"

type Tab = "profile" | "socials" | "account"

export function SettingsView() {
    const [tab, setTab] = useState<Tab>("profile")
    const vm = useSettingsProfile()

    const title = useMemo(() => {
        if (tab === "profile") return "Профиль"
        if (tab === "socials") return "Соцсети"
        return "Аккаунт"
    }, [tab])

    if (vm.load.status === "idle") {
        return <div className="settings">Нет сессии</div>
    }

    if (vm.load.status === "loading") {
        return <div className="settings">Загрузка...</div>
    }

    if (vm.load.status === "error") {
        return <div className="settings">{vm.load.error}</div>
    }

    const form = vm.form

    if (!form) {
        return <div className="settings">Загрузка...</div>
    }

    return (
        <div className="settings">
            <div className="settings__head">
                <div>
                    <div className="settings__title">Настройки</div>
                    <div className="settings__subtitle">
                        Управляй профилем и настройками аккаунта
                    </div>
                </div>
            </div>

            {vm.saveError ? (
                <div className="settings__error">{vm.saveError}</div>
            ) : null}

            {vm.saveOk ? (
                <div className="settings__ok">Сохранено</div>
            ) : null}

            <div className="settings__grid">
                <aside className="settings__side">
                    <div className="settings__nav">
                        <button
                            className={
                                tab === "profile"
                                    ? "settings__tab settings__tab--active"
                                    : "settings__tab"
                            }
                            onClick={() => setTab("profile")}
                            type="button"
                        >
                            Профиль
                        </button>

                        <button
                            className={
                                tab === "socials"
                                    ? "settings__tab settings__tab--active"
                                    : "settings__tab"
                            }
                            onClick={() => setTab("socials")}
                            type="button"
                        >
                            Соцсети
                        </button>

                        <button
                            className={
                                tab === "account"
                                    ? "settings__tab settings__tab--active"
                                    : "settings__tab"
                            }
                            onClick={() => setTab("account")}
                            type="button"
                        >
                            Аккаунт
                        </button>
                    </div>
                </aside>

                <section className="settings__main">
                    <div className="settings__card">
                        <div className="settings__cardHead">
                            <div className="settings__cardTitle">{title}</div>
                            <div className="settings__cardHint">
                                Измени данные и нажми «Сохранить»
                            </div>
                        </div>

                        {tab === "profile" ? (
                            <div className="settings__fields">
                                <div className="settings__row">
                                    <div className="settings__label">
                                        Имя пользователя
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.username}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                username: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="settings__row">
                                    <div className="settings__label">
                                        О себе
                                    </div>
                                    <textarea
                                        className="settings__textarea"
                                        value={form.about}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                about: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="settings__row">
                                    <div className="settings__label">
                                        Avatar URL
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.avatarUrl}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                avatarUrl: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="settings__row">
                                    <div className="settings__label">
                                        Cover URL
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.coverUrl}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                coverUrl: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ) : null}

                        {tab === "socials" ? (
                            <div className="settings__fields">
                                <div className="settings__row">
                                    <div className="settings__label">
                                        Telegram
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.telegram}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                telegram: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="settings__row">
                                    <div className="settings__label">
                                        Twitter
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.twitter}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                twitter: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="settings__row">
                                    <div className="settings__label">
                                        Instagram
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.instagram}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                instagram: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="settings__row">
                                    <div className="settings__label">
                                        Website
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.website}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                website: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ) : null}

                        {tab === "account" ? (
                            <div className="settings__fields">
                                <div className="settings__row">
                                    <div className="settings__label">
                                        Email
                                    </div>
                                    <input
                                        className="input settings__input"
                                        value={form.email}
                                        onChange={(e) =>
                                            vm.setForm({
                                                ...form,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="settings__note">
                                    Пароль и 2FA добавим позже.
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="settings__footer">
                        <div className="settings__footerLeft">
                            {vm.dirty ? (
                                <span className="settings__dirty">
                                    Есть несохранённые изменения
                                </span>
                            ) : (
                                <span className="settings__muted">
                                    Без изменений
                                </span>
                            )}
                        </div>

                        <div className="settings__footerRight">
                            <button
                                className="btn btn--primary"
                                onClick={vm.save}
                                disabled={!vm.dirty || vm.saving}
                            >
                                {vm.saving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
