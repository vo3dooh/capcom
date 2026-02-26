import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { Home, MessagesSquare, Hash, Trophy, Newspaper } from "lucide-react"
import { Logo } from "@/shared/ui/Logo"
import "./sidebar.css"

function SidebarLink({
    to,
    icon,
    label
}: {
    to: string
    icon: ReactNode
    label: string
}) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
            }
        >
            <span className="sidebar__icon">{icon}</span>
            <span className="sidebar__label">{label}</span>
        </NavLink>
    )
}

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar__top">
                <div className="sidebar__logo">
                    <Logo nameMain="Capper" nameBadge="Community" />
                </div>
            </div>

            <div className="sidebar__section">
                <nav className="sidebar__nav">
                    <SidebarLink to="/dashboard" icon={<Home size={18} />} label="Главная" />
                    <SidebarLink to="/messages" icon={<MessagesSquare size={18} />} label="Сообщения" />
                    <SidebarLink to="/channels" icon={<Hash size={18} />} label="Каналы" />
                    <SidebarLink to="/tournaments" icon={<Trophy size={18} />} label="Турниры" />
                    <SidebarLink to="/articles" icon={<Newspaper size={18} />} label="Статьи" />
                </nav>
            </div>
        </aside>
    )
}
