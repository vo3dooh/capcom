import type { ProfileData } from "./profile.types";

export const profileMock: ProfileData = {
    id: "u_001",
    displayName: "vo3dooh2",
    handle: "vo3dooh2",
    tagline: "CAPPER COMMUNITY • Verified bets • Long-term edge",
    about:
        "Я публикую аккуратные разборы и веду дисциплину банка. Предпочитаю понятные рынки и прозрачную логику. Важно: никаких догонов и хаотичных решений.",
    specialties: ["Football", "NBA", "Totals", "Props"],
    approachTags: ["Flat staking", "Value focus", "Line shopping"],
    badges: ["verified"],
    createdAtIso: "2026-02-01T10:00:00.000Z",
    verificationStatus: "Verified",
    avatarUrl: "",
    coverUrl: "",
    channels: [
        {
            id: "c_001",
            title: "Main Picks",
            description: "Основной поток ставок и разборов",
            role: "owner",
            isPublic: true
        },
        {
            id: "c_002",
            title: "Live Watchlist",
            description: "Лайв-наблюдение, идеи и контекст",
            role: "editor",
            isPublic: true
        }
    ],
    socials: [
        { type: "telegram", label: "Telegram", url: "https://t.me/example" },
        { type: "twitter", label: "Twitter", url: "https://x.com/example" },
        { type: "website", label: "Website", url: "https://example.com" }
    ]
};
