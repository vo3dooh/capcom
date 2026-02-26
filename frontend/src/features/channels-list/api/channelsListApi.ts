import { http } from "@/shared/api/http";

export type ChannelListItem = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    membersCount: number;
    owner: { id: string; username: string | null; handle: string | null; avatarUrl: string | null };
    stats?: {
        totalPredictions: number;
        wins: number;
        losses: number;
        voids: number;
        totalStake: number;
        totalProfit: number;
        roi: number;
        winRate: number;
    } | null;
};

export async function fetchChannels(take?: number, skip?: number) {
    const qs = new URLSearchParams();
    if (typeof take === "number") qs.set("take", String(take));
    if (typeof skip === "number") qs.set("skip", String(skip));

    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return http<ChannelListItem[]>(`/channels${suffix}`);
}