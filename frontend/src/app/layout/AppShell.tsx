import type { ReactNode } from "react"
import "./app-shell.css"
import { Sidebar } from "@/shared/ui/Sidebar/Sidebar"
import { Topbar } from "./Topbar"

export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="app">
            <Sidebar />

            <Topbar />

            <main className="content">
                <div className="container">{children}</div>
            </main>
        </div>
    )
}
