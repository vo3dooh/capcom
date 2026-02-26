import { useMemo, useRef, useState, useEffect } from "react"
import { Bell, Search, Settings, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"

import "./topbar.css"

import { AuthModal } from "@/features/auth/ui/AuthModal"
import type { AuthMode } from "@/features/auth/api/types"
import { authSession } from "@/features/auth/model/authSession"
import { useAuthSession } from "@/features/auth/model/useAuthSession"
import { UserDropdown } from "@/features/auth/ui/UserDropdown"

export function Topbar() {
    const session = useAuthSession()
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<AuthMode>("register")
    const [query, setQuery] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const [searchOpen, setSearchOpen] = useState(false)

    const profileWrapRef = useRef<HTMLDivElement>(null)
    const searchWrapRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    function openRegister() {
        setMode("register")
        setOpen(true)
    }

    function openLogin() {
        setMode("login")
        setOpen(true)
    }

    const hasToken = Boolean(session.accessToken)
    const showAuthedUi = session.status === "authed" || (session.status === "loading" && hasToken)

    const profileName = useMemo(() => {
        const u = session.user
        return u?.username || u?.email || "User"
    }, [session.user])

    const profileSub = useMemo(() => {
        const role = session.user?.role
        if (!role) return "Designer"
        if (role === "admin") return "Admin"
        if (role === "moderator") return "Moderator"
        return "Designer"
    }, [session.user])

    const avatarUrl = session.user?.avatarUrl || ""

    useEffect(() => {
        if (!searchOpen) return
        const id = window.setTimeout(() => {
            searchInputRef.current?.focus()
        }, 10)
        return () => window.clearTimeout(id)
    }, [searchOpen])

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (!searchOpen) return
            if (e.key === "Escape") {
                setSearchOpen(false)
            }
        }

        function onPointerDown(e: PointerEvent) {
            if (!searchOpen) return
            const el = searchWrapRef.current
            if (!el) return
            if (el.contains(e.target as Node)) return
            setSearchOpen(false)
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("pointerdown", onPointerDown)
        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("pointerdown", onPointerDown)
        }
    }, [searchOpen])

    return (
        <>
            <header className="topbar">
                {showAuthedUi ? (
                    <>
                        <div className="topbar__left">
                            <div
                                className={searchOpen ? "topbarSearch topbarSearch--open" : "topbarSearch"}
                                ref={searchWrapRef}
                            >
                                <button
                                    className="topbarSearch__btn"
                                    type="button"
                                    aria-label={searchOpen ? "Close search" : "Open search"}
                                    onClick={() => setSearchOpen((v) => !v)}
                                >
                                    <Search className="topbarSearch__icon" aria-hidden="true" />
                                </button>

                                <div className="topbarSearch__field">
                                    <input
                                        ref={searchInputRef}
                                        className="topbarSearch__input"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search"
                                        aria-label="Search"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="topbar__right">
                            <button className="topbar__iconBtn" type="button" aria-label="Notifications">
                                <Bell className="topbar__icon" />
                            </button>

                            <button className="topbar__iconBtn" type="button" aria-label="Settings">
                                <Settings className="topbar__icon" />
                            </button>

                            <div className="topbar__profileWrapper" ref={profileWrapRef}>
                                <button
                                    className="topbar__profilePill"
                                    type="button"
                                    aria-label="Profile"
                                    onClick={() => setDropdownOpen((v) => !v)}
                                >
                                    {avatarUrl ? (
                                        <img className="topbar__avatarImg" src={avatarUrl} alt="avatar" />
                                    ) : (
                                        <span className="topbar__avatarFallback" aria-hidden="true" />
                                    )}

                                    <span className="topbar__profileText">
                                        <span className="topbar__profileName">{profileName}</span>
                                        <span className="topbar__profileSub">{profileSub}</span>
                                    </span>

                                    <ChevronDown className="topbar__chevIcon" aria-hidden="true" />
                                </button>

                                <UserDropdown
                                    isOpen={dropdownOpen}
                                    onClose={() => setDropdownOpen(false)}
                                    username={profileName}
                                    email={session.user?.email || ""}
                                    avatarUrl={avatarUrl}
                                    anchorRef={profileWrapRef}
                                    onProfile={() => {
                                        setDropdownOpen(false)
                                        navigate("/profile")
                                    }}
                                    onSettings={() => {
                                        setDropdownOpen(false)
                                        navigate("/settings")
                                    }}
                                    onChannels={() => {
                                        setDropdownOpen(false)
                                        navigate("/channels")
                                    }}
                                    onSupport={() => {
                                        setDropdownOpen(false)
                                    }}
                                    onUpgrade={() => {
                                        setDropdownOpen(false)
                                    }}
                                    onLogout={() => {
                                        authSession.clear()
                                        setDropdownOpen(false)
                                        navigate("/dashboard")
                                    }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="topbar__spacer" />

                        <div className="topbar__auth">
                            <button className="btn" type="button" onClick={openLogin}>
                                Вход
                            </button>

                            <button className="btn btn--primary" type="button" onClick={openRegister}>
                                Регистрация
                            </button>
                        </div>
                    </>
                )}
            </header>

            <AuthModal
                open={open}
                mode={mode}
                onClose={() => setOpen(false)}
                onModeChange={setMode}
                onSuccess={(token) => {
                    authSession.setAccessToken(token)
                    authSession.refresh()
                    setOpen(false)
                }}
            />
        </>
    )
}