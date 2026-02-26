import { Share2, BadgeCheck, Sparkles } from "lucide-react";
import type { ProfileData, ProfileBadge } from "../../model/profile.types";
import "./profile-header.css";

type Props = {
    profile: ProfileData;
};

function badgeLabel(badge: ProfileBadge) {
    if (badge === "verified") return "VERIFIED";
    return "PRO";
}

export function ProfileHeader({ profile }: Props) {
    const displayName = (profile.displayName || "").trim();
    const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "U";
    const hasCover = Boolean(profile.coverUrl);

    const share = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            window.prompt("Скопируй ссылку:", url);
        }
    };

    return (
        <section className="profile-header">
            <div
                className={
                    hasCover
                        ? "profile-header__cover"
                        : "profile-header__cover profile-header__cover--compact"
                }
            >
                {profile.coverUrl ? (
                    <img className="profile-header__coverImg" src={profile.coverUrl} alt="cover" />
                ) : (
                    <div className="profile-header__coverPlaceholder" />
                )}
            </div>

            <div className="profile-header__content">
                <div className="profile-header__avatarWrap">
                    {profile.avatarUrl ? (
                        <img className="profile-header__avatarImg" src={profile.avatarUrl} alt="avatar" />
                    ) : (
                        <div className="profile-header__avatarFallback" aria-hidden="true">
                            {initials}
                        </div>
                    )}
                </div>

                <div className="profile-header__main">
                    <div className="profile-header__topRow">
                        <div className="profile-header__title">
                            <div className="profile-header__name">{displayName || "User"}</div>
                            <div className="profile-header__handle">@{profile.handle}</div>
                        </div>

                        <button className="profile-header__shareBtn" type="button" onClick={share}>
                            <Share2 size={16} />
                            Поделиться
                        </button>
                    </div>

                    {profile.badges.length > 0 && (
                        <div className="profile-header__badges">
                            {profile.badges.map((b) => (
                                <div key={b} className={`profile-header__badge profile-header__badge--${b}`}>
                                    {b === "verified" ? <BadgeCheck size={14} /> : <Sparkles size={14} />}
                                    {badgeLabel(b)}
                                </div>
                            ))}
                        </div>
                    )}

                    {profile.tagline && <div className="profile-header__tagline">{profile.tagline}</div>}

                    {profile.specialties.length > 0 && (
                        <div className="profile-header__chips">
                            {profile.specialties.map((s) => (
                                <div key={s} className="profile-header__chip">
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
