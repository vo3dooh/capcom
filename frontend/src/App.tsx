import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./app/layout/AppShell";
import { DashboardPage } from "@/pages/dashboard";
import { ProfilePage } from "@/pages/profile";
import { SettingsPage } from "@/pages/settings";
import { ChannelsPage } from "@/pages/channels";
import { ChannelPage } from "@/pages/channel";
import { ChannelSettingsPage } from "@/pages/channel-settings";
import { CreateChannelPage } from "@/pages/create-channel";
import { CreatePredictionPage } from "@/pages/create-prediction";

export default function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    <Route path="/channels" element={<ChannelsPage />} />
                    <Route path="/channels/new" element={<CreateChannelPage />} />
                    <Route path="/channels/:slug" element={<ChannelPage />} />
                    <Route path="/channels/:slug/settings" element={<ChannelSettingsPage />} />
                    <Route path="/channels/:slug/predictions/new" element={<CreatePredictionPage />} />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}