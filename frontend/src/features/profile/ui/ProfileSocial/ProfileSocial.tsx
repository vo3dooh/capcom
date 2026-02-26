import { Globe, Instagram, Send, Twitter } from "lucide-react";
import type { ProfileData, ProfileSocial } from "../../model/profile.types";
import "./profile-social.css";

type Props = {
    profile: ProfileData;
};

function iconFor(type: ProfileSocial["type"]) {
    if (type === "telegram") return <Send size={16} />;
    if (type === "instagram") return <Instagram size={16} />;
    if (type === "twitter") return <Twitter size={16} />;
    return <Globe size={16} />;
}

export function ProfileSocial({ profile }: Props) {
    if (!profile.socials.length) return null;

    return (
        <section className="profile-social">
            <div className="profile-social__title">Соцсети</div>

            <div className="profile-social__list">
                {profile.socials.map((s) => (
                    <a key={s.url} className="profile-social__item" href={s.url} target="_blank" rel="noreferrer">
                        <span className="profile-social__icon">{iconFor(s.type)}</span>
                        <span className="profile-social__label">{s.label}</span>
                        <span className="profile-social__url">{s.url}</span>
                    </a>
                ))}
            </div>
        </section>
    );
}
