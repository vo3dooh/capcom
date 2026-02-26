import { http } from "@/shared/api/http";

export type PredictionStatus = "pending" | "win" | "loss" | "void";

export type PredictionItem = {
    id: string;
    channelId: string;
    authorId: string;
    eventId: string;

    odds: number;
    stake: number;
    market: string;
    selection: string;
    result: PredictionStatus;

    createdAt: string;
    settledAt: string | null;

    author: {
        id: string;
        username: string | null;
        handle: string | null;
        avatarUrl: string | null;
    };

    event: {
        id: string;
        startTime: string;
        sport: { id: string; slug: string; name: string };
        league: { id: string; name: string; logoUrl: string | null } | null;
        homeCompetitor: { id: string; name: string; type: "team" | "player"; logoUrl: string | null };
        awayCompetitor: { id: string; name: string; type: "team" | "player"; logoUrl: string | null };
    };
};

export type CreatePredictionDto = {
    sportId: string;
    leagueName?: string | null;

    competitorType?: "team" | "player";
    homeName: string;
    awayName: string;
    homeLogoUrl?: string | null;
    awayLogoUrl?: string | null;

    startTime: string;

    odds: number;
    stake: number;
    market: string;
    selection: string;
};

export type PredictionsPage = {
    items: PredictionItem[];
    pagination: {
        take: number;
        skip: number;
        total: number;
        totalPages: number;
        currentPage: number;
    };
};

export async function fetchChannelPredictions(slug: string, take?: number, skip?: number) {
    const qs = new URLSearchParams();
    if (typeof take === "number") qs.set("take", String(take));
    if (typeof skip === "number") qs.set("skip", String(skip));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";

    return http<PredictionsPage>(`/channels/${slug}/predictions${suffix}`);
}

export async function createPrediction(slug: string, dto: CreatePredictionDto) {
    return http<PredictionItem>(`/channels/${slug}/predictions`, { method: "POST", body: dto });
}
