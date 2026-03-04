import { http } from "@/shared/api/http";

export type CreateChannelDto = {
    name: string;
    slug?: string;
    description?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    visibility?: "public" | "private" | "unlisted";
    joinPolicy?: "open" | "request" | "inviteOnly";
    startingBankroll?: number;
    bankrollCurrency?: string | null;
    sportIds?: string[];
};

export type CreatedChannel = {
    id: string;
    slug: string;
    name: string;
};

export async function createChannel(dto: CreateChannelDto) {
    return http<CreatedChannel>("/channels", { method: "POST", body: dto });
}
