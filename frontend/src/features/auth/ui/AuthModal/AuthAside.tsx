import React from "react";
import asideRegister from "@/shared/assets/images/auth/register-aside.jpg";
import asideLogin from "@/shared/assets/images/auth/login-aside.jpg";
import type { AuthMode } from "@/features/auth/api/types";

export function AuthAside({ mode }: { mode: AuthMode }) {
    return (
        <div className={`authAside ${mode === "login" ? "isLogin" : "isRegister"}`}>
            <div className="authAsideTrack">
                <img className="authAsideImg authAsideImg--register" src={asideRegister} alt="" />
                <img className="authAsideImg authAsideImg--login" src={asideLogin} alt="" />
            </div>

            <div className="authAsideGlass">
                <div key={`glass-${mode}`} className="authAsideGlassInner authAsideGlassInner--enter">
                    <div className="authAsideQuote">
                        {mode === "register"
                            ? "«Capper Community помогает находить сильных аналитиков и следить за результатами прозрачно.»"
                            : "«Вернитесь в аккаунт — свежие прогнозы и статистика уже ждут.»"}
                    </div>

                    <div className="authAsideName">Capper Community</div>
                    <div className="authAsideMeta">{mode === "register" ? "Сообщество капперов" : "Панель управления"}</div>
                </div>
            </div>
        </div>
    );
}
