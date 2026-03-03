import { http } from "@/shared/api/http";

export type ChannelSettingsModel = {
    slug: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    visibility: "public" | "private" | "unlisted";
    joinPolicy: "open" | "request" | "inviteOnly";
    predictionsVisibility: "public" | "members";
};

export type ChannelSettingsDto = {
    name: string;
    slug: string;
    description: string;
    avatarUrl: string;
    coverUrl: string;
    visibility: "public" | "private" | "unlisted";
    joinPolicy: "open" | "request" | "inviteOnly";
    predictionsVisibility: "public" | "members";
};

export async function fetchChannelSettings(slug: string) {
    return http<ChannelSettingsModel>(`/channels/${slug}`);
}

export async function patchChannelSettings(slug: string, dto: ChannelSettingsDto) {
    return http<ChannelSettingsModel>(`/channels/${slug}/settings`, { method: "PATCH", body: dto });
}

export async function deleteChannel(slug: string) {
    return http<{ success: true }>(`/channels/${slug}`, { method: "DELETE" });
}
