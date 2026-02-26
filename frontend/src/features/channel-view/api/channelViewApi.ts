import { http } from "@/shared/api/http";

export type ChannelViewModel = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    visibility: "public" | "private" | "unlisted";
    joinPolicy: "open" | "request" | "inviteOnly";
    predictionsVisibility: "public" | "members";
    membersCount: number;
    isMember: boolean;
    myRole: "owner" | "editor" | "moderator" | "member" | null;
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

export async function fetchChannel(slug: string) {
    return http<ChannelViewModel>(`/channels/${slug}`);
}

export async function joinChannel(slug: string) {
    return http<{ success: true }>(`/channels/${slug}/join`, { method: "POST" });
}

export async function leaveChannel(slug: string) {
    return http<{ success: true }>(`/channels/${slug}/leave`, { method: "POST" });
}