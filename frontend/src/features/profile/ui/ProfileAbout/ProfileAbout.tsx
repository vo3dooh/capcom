import type { ProfileData } from "../../model/profile.types";
import "./profile-about.css";

type Props = {
    profile: ProfileData;
};

export function ProfileAbout({ profile }: Props) {
    return (
        <section className="profile-about">
            <div className="profile-about__title">О каппере</div>

            <div className="profile-about__text">{profile.about}</div>

            <div className="profile-about__subTitle">Подход</div>
            <div className="profile-about__tags">
                {profile.approachTags.map((t) => (
                    <div key={t} className="profile-about__tag">
                        {t}
                    </div>
                ))}
            </div>
        </section>
    );
}
