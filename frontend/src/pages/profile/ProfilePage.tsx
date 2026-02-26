import "./profile-page.css"
import { ProfileHeader } from "@/features/profile/ui/ProfileHeader"
import { ProfileAbout } from "@/features/profile/ui/ProfileAbout"
import { ProfileChannelsSidebar } from "@/features/profile/ui/ProfileChannelsSidebar"
import { ProfileSocial } from "@/features/profile/ui/ProfileSocial"
import { ProfileTrust } from "@/features/profile/ui/ProfileTrust"
import { useMyProfile } from "@/features/profile/model/useMyProfile"

export function ProfilePage() {
    const state = useMyProfile()

    if (state.status === "idle") {
        return <div className="profile-page">Нет сессии</div>
    }

    if (state.status === "loading") {
        return <div className="profile-page">Загрузка...</div>
    }

    if (state.status === "error") {
        return <div className="profile-page">{state.error}</div>
    }

    const profile = state.data

    const headerProfile = {
        id: profile.id,
        displayName: profile.displayName,
        handle: profile.handle,
        tagline: "",
        about: profile.about || "",
        specialties: profile.specialties || [],
        approachTags: profile.approachTags || [],
        badges: (profile.badges as any) || [],
        createdAtIso: profile.createdAt,
        verificationStatus: profile.verificationStatus,
        avatarUrl: profile.avatarUrl || "",
        coverUrl: profile.coverUrl || "",
        channels: (profile.channels as any) || [],
        socials: (profile.socials as any) || []
    }

    const aboutProfile = {
        id: profile.id,
        displayName: profile.displayName,
        handle: profile.handle,
        tagline: "",
        about: profile.about || "",
        specialties: profile.specialties || [],
        approachTags: profile.approachTags || [],
        badges: (profile.badges as any) || [],
        createdAtIso: profile.createdAt,
        verificationStatus: profile.verificationStatus,
        avatarUrl: profile.avatarUrl || "",
        coverUrl: profile.coverUrl || "",
        channels: (profile.channels as any) || [],
        socials: (profile.socials as any) || []
    }

    const channelsProfile = {
        id: profile.id,
        displayName: profile.displayName,
        handle: profile.handle,
        tagline: "",
        about: "",
        specialties: [],
        approachTags: [],
        badges: [],
        createdAtIso: profile.createdAt,
        verificationStatus: profile.verificationStatus,
        avatarUrl: "",
        coverUrl: "",
        channels: (profile.channels as any) || [],
        socials: []
    }

    const socialsProfile = {
        id: profile.id,
        displayName: profile.displayName,
        handle: profile.handle,
        tagline: "",
        about: "",
        specialties: [],
        approachTags: [],
        badges: [],
        createdAtIso: profile.createdAt,
        verificationStatus: profile.verificationStatus,
        avatarUrl: "",
        coverUrl: "",
        channels: [],
        socials: (profile.socials as any) || []
    }

    const trustProfile = {
        id: profile.id,
        displayName: profile.displayName,
        handle: profile.handle,
        tagline: "",
        about: "",
        specialties: [],
        approachTags: [],
        badges: [],
        createdAtIso: profile.createdAt,
        verificationStatus: profile.verificationStatus,
        avatarUrl: "",
        coverUrl: "",
        channels: [],
        socials: []
    }

    return (
        <div className="profile-page">
            <div className="profile-page__layout">
                <div className="profile-page__left">
                    <ProfileHeader profile={headerProfile} />
                    <div className="profile-page__leftStack">
                        <ProfileAbout profile={aboutProfile} />
                    </div>
                </div>

                <div className="profile-page__right">
                    <div className="profile-page__sideStack">
                        <ProfileChannelsSidebar profile={channelsProfile} />
                        <ProfileSocial profile={socialsProfile} />
                        <ProfileTrust profile={trustProfile} />
                    </div>
                </div>
            </div>
        </div>
    )
}
