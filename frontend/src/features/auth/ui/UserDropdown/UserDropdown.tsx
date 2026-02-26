import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Settings, User, LifeBuoy, Sparkles, Folder } from "lucide-react"
import "./user-dropdown.css"

type Props = {
    isOpen: boolean
    onClose: () => void
    username: string
    email: string
    avatarUrl?: string
    onChannels: () => void
    onSupport: () => void
    onUpgrade: () => void
    onLogout: () => void
    anchorRef?: React.RefObject<HTMLElement>
}

export const UserDropdown = ({
                                 isOpen,
                                 onClose,
                                 onChannels,
                                 onSupport,
                                 onUpgrade,
                                 onLogout,
                                 anchorRef
                             }: Props) => {
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node

            if (anchorRef?.current && anchorRef.current.contains(target)) return
            if (dropdownRef.current && dropdownRef.current.contains(target)) return

            onClose()
        }

        if (isOpen) {
            document.addEventListener("pointerdown", handlePointerDown)
        }

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
        }
    }, [isOpen, onClose, anchorRef])

    const goProfile = () => {
        navigate("/profile")
        onClose()
    }

    const goSettings = () => {
        navigate("/settings")
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="user-dropdown-wrapper">
            <div
                ref={dropdownRef}
                className="user-dropdown user-dropdown--open"
                aria-hidden={false}
            >
                <button className="user-dropdown__item" onClick={goProfile} type="button">
                    <User size={18} />
                    Профиль
                </button>

                <button className="user-dropdown__item" onClick={goSettings} type="button">
                    <Settings size={18} />
                    Настройки
                </button>

                <button className="user-dropdown__item" onClick={onChannels} type="button">
                    <Folder size={18} />
                    Мои каналы
                </button>

                <div className="user-dropdown__divider" />

                <button className="user-dropdown__item" onClick={onSupport} type="button">
                    <LifeBuoy size={18} />
                    Поддержка
                </button>

                <button className="user-dropdown__item" onClick={onUpgrade} type="button">
                    <Sparkles size={18} />
                    Улучшить аккаунт
                </button>

                <div className="user-dropdown__divider" />

                <button
                    className="user-dropdown__item user-dropdown__item--danger"
                    onClick={onLogout}
                    type="button"
                >
                    <LogOut size={18} />
                    Выйти
                </button>
            </div>
        </div>
    )
}