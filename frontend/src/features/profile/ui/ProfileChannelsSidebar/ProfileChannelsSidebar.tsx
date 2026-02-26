import type { ProfileChannel, ProfileData } from "../../model/profile.types";
import "./profile-channels-sidebar.css";

type Props = {
    profile: ProfileData;
};

function roleLabel(role: ProfileChannel["role"]) {
    if (role === "owner") return "Owner";
    if (role === "moderator") return "Moderator";
    return "Editor";
}

export function ProfileChannelsSidebar({ profile }: Props) {
    const channels = profile.channels.filter((c) => c.isPublic);

    return (
        <section className="profile-channels">
            <div className="profile-channels__title">Каналы</div>

            <div className="profile-channels__list">
                {channels.map((c) => (
                    <button key={c.id} className="profile-channels__item" type="button">
                        <div className="profile-channels__itemTop">
                            <div className="profile-channels__name">{c.title}</div>
                            <div className="profile-channels__role">{roleLabel(c.role)}</div>
                        </div>
                        <div className="profile-channels__desc">{c.description}</div>
                    </button>
                ))}
            </div>
        </section>
    );
}
