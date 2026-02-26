import type { ProfileData } from "../../model/profile.types";
import "./profile-trust.css";

type Props = {
    profile: ProfileData;
};

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
}

export function ProfileTrust({ profile }: Props) {
    return (
        <section className="profile-trust">
            <div className="profile-trust__title">Доверие</div>

            <div className="profile-trust__rows">
                <div className="profile-trust__row">
                    <div className="profile-trust__label">Регистрация</div>
                    <div className="profile-trust__value">{formatDate(profile.createdAtIso)}</div>
                </div>

                <div className="profile-trust__row">
                    <div className="profile-trust__label">Верификация</div>
                    <div className="profile-trust__value">{profile.verificationStatus}</div>
                </div>

                <div className="profile-trust__row">
                    <div className="profile-trust__label">Профиль</div>
                    <div className="profile-trust__value">Public</div>
                </div>
            </div>
        </section>
    );
}
