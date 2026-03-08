import { http } from "@/shared/api/http";
import { TeamRolePermissions } from "../model/teamRolePermissions";

export type ChannelSettingsModel = {
    slug: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    visibility: "public" | "private" | "unlisted";
    joinPolicy: "open" | "request" | "inviteOnly";
    telegramUrl: string | null;
    twitterUrl: string | null;
    instagramUrl: string | null;
    vkUrl: string | null;
    websiteUrl: string | null;
    telegramEnabled: boolean;
    vkEnabled: boolean;
    websiteEnabled: boolean;
    teamRolePermissions: TeamRolePermissions | null;
};

export type ChannelSettingsDto = {
    name: string;
    slug: string;
    description: string;
    avatarUrl: string;
    coverUrl: string;
    visibility: "public" | "private" | "unlisted";
    joinPolicy: "open" | "request" | "inviteOnly";
    telegramUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    vkUrl: string;
    websiteUrl: string;
    telegramEnabled: boolean;
    vkEnabled: boolean;
    websiteEnabled: boolean;
    teamRolePermissions: TeamRolePermissions;
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
