export type ProfileBadge = "verified" | "pro";

export type ProfileChannelRole = "owner" | "editor" | "moderator";

export type ProfileChannel = {
    id: string;
    title: string;
    description: string;
    role: ProfileChannelRole;
    isPublic: boolean;
};

export type ProfileSocial = {
    type: "telegram" | "twitter" | "instagram" | "website";
    label: string;
    url: string;
};

export type ProfileData = {
    id: string;
    displayName: string;
    handle: string;
    tagline: string;
    about: string;
    specialties: string[];
    approachTags: string[];
    badges: ProfileBadge[];
    createdAtIso: string;
    verificationStatus: "Verified" | "Not verified";
    avatarUrl?: string;
    coverUrl?: string;
    channels: ProfileChannel[];
    socials: ProfileSocial[];
};
