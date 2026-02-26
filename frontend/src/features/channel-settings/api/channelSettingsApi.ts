import { http } from "@/shared/api/http";

export type ChannelSettingsDto = {
    name?: string;
    description?: string;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    visibility?: "public" | "private" | "unlisted";
    joinPolicy?: "open" | "request" | "inviteOnly";
    predictionsVisibility?: "public" | "members";
    startingBankroll?: number;
    bankrollCurrency?: string | null;
};

export async function patchChannelSettings(slug: string, dto: ChannelSettingsDto) {
    return http<any>(`/channels/${slug}/settings`, { method: "PATCH", body: dto });
}