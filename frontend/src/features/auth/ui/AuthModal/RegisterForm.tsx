import React from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Check, X } from "lucide-react";

type Props = {
    nonce: number;
    ids: {
        registerEmailId: string;
        registerPassId: string;
        registerEmailMsgId: string;
        registerPassMsgId: string;
    };
    isSubmitting: boolean;
    canSubmit: boolean;

    email: string;
    password: string;
    showPassword: boolean;
    locked: boolean;

    emailError?: string;
    passwordError?: string;

    emailWrapState: string;
    passRegisterWrapState: string;

    showStrength: boolean;
    strengthLevel: number;
    strengthText: string;

    agreed: boolean;
    onAgreeChange: (value: boolean) => void;

    passwordRules: {
        length8: boolean;
        length12: boolean;
        hasUpper: boolean;
        hasLower: boolean;
        hasDigit: boolean;
        hasSpecial: boolean;
        noCyrillic: boolean;
        hasLetterCase: boolean;
    };
    passwordValid: boolean;

    error: string | null;
    state: "idle" | "submitting" | "success" | "error";

    emailRef: React.RefObject<HTMLInputElement | null>;
    passRef: React.RefObject<HTMLInputElement | null>;

    onSubmit: (e: React.FormEvent) => void;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onEmailBlur: () => void;
    onUnlockAndFocusPass: () => void;
    onPassBlur: () => void;
    onTogglePassword: () => void;
    onClearEmailError: () => void;
    onClearPasswordError: () => void;
};

function ReqItem(props: { ok: boolean; text: string; danger?: boolean }) {
    return (
        <div className={`authPassReqItem ${props.ok ? "isOk" : props.danger ? "isDanger" : "isBad"}`}>
            {props.ok ? <Check className="authPassReqIcon" /> : <X className="authPassReqIcon" />}
            <span className="authPassReqText">{props.text}</span>
        </div>
    );
}

export function RegisterForm(props: Props) {
    const meterState = `authPassMeter--${props.strengthLevel}`;

    return (
        <form key={`register-${props.nonce}`} className="authForm" onSubmit={props.onSubmit} autoComplete="on" noValidate>
            <div className="authField">
                <label className="authLabel" htmlFor={props.ids.registerEmailId}>
                    Email
                </label>

                <div className={`authInputWrap ${props.emailWrapState}`}>
                    <Mail className="authLeftIcon" />
                    <input
                        ref={props.emailRef}
                        id={props.ids.registerEmailId}
                        name="cc_register_email"
                        className={`authInput authInput--leftIcon ${props.emailError ? "authInput--invalid" : ""}`}
                        type="email"
                        inputMode="email"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="Введите свою почту"
                        value={props.email}
                        onChange={(e) => {
                            props.onEmailChange(e.target.value);
                            props.onClearEmailError();
                        }}
                        onBlur={props.onEmailBlur}
                        disabled={props.isSubmitting}
                        required
                        aria-invalid={!!props.emailError}
                        aria-describedby={props.emailError ? props.ids.registerEmailMsgId : undefined}
                    />
                </div>

                {props.emailError ? (
                    <div className="authFieldMsgSlot isOpen">
                        <div id={props.ids.registerEmailMsgId} className="authFieldMsg authFieldMsg--error" role="alert">
                            <AlertCircle className="authFieldMsgIcon" />
                            <span>{props.emailError}</span>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="authField authField--password">
                <label className="authLabel" htmlFor={props.ids.registerPassId}>
                    Пароль
                </label>

                <div className={`authInputWrap ${props.passRegisterWrapState}`}>
                    <Lock className="authLeftIcon" />
                    <input
                        ref={props.passRef}
                        id={props.ids.registerPassId}
                        name="cc_register_password"
                        className={`authInput authInput--leftIcon authInput--withIcon ${props.passwordError ? "authInput--invalid" : ""}`}
                        type={props.showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Придумайте пароль"
                        value={props.password}
                        onChange={(e) => {
                            props.onPasswordChange(e.target.value);
                            props.onClearPasswordError();
                        }}
                        readOnly={props.locked}
                        disabled={props.isSubmitting}
                        minLength={8}
                        required
                        onFocus={props.onUnlockAndFocusPass}
                        onBlur={props.onPassBlur}
                        aria-invalid={!!props.passwordError}
                        aria-describedby={props.passwordError ? props.ids.registerPassMsgId : undefined}
                    />

                    <button
                        type="button"
                        className="authPassToggle"
                        onClick={props.onTogglePassword}
                        disabled={props.isSubmitting || props.locked}
                        aria-label={props.showPassword ? "Скрыть пароль" : "Показать пароль"}
                        title={props.showPassword ? "Скрыть пароль" : "Показать пароль"}
                        tabIndex={-1}
                    >
                        {props.showPassword ? <EyeOff className="authIcon" /> : <Eye className="authIcon" />}
                    </button>
                </div>

                {props.passwordError ? (
                    <div className="authFieldMsgSlot isOpen">
                        <div id={props.ids.registerPassMsgId} className="authFieldMsg authFieldMsg--error" role="alert">
                            <AlertCircle className="authFieldMsgIcon" />
                            <span>{props.passwordError}</span>
                        </div>
                    </div>
                ) : null}

                {props.showStrength ? (
                    <div className="authStrengthWrap isOpen">
                        <div className={`authPassMeter ${meterState}`}>
                            <div className="authPassMeterHead">
                                <span className="authPassMeterTitle">
                                    <span className="authPassMeterDot" />
                                    <span className="authPassMeterLabel">{props.strengthText}</span>
                                </span>

                                <span className="authPassMeterMeta">{props.password.length > 0 ? "Надежность пароля" : ""}</span>
                            </div>

                            <div className="authPassMeterBars" aria-hidden="true">
                                <span className="authPassMeterBar" />
                                <span className="authPassMeterBar" />
                                <span className="authPassMeterBar" />
                                <span className="authPassMeterBar" />
                            </div>

                            <div className="authPassReqList">
                                {props.password.length > 0 && !props.passwordRules.noCyrillic ? (
                                    <ReqItem ok={false} danger text="В пароле разрешены только латинские буквы" />
                                ) : (
                                    <>
                                        <ReqItem ok={props.passwordRules.length8} text="Не менее 8 символов" />
                                        <ReqItem ok={props.passwordRules.hasLetterCase} text="Хотя бы одна заглавная и строчная буква" />
                                        <ReqItem ok={props.passwordRules.hasDigit} text="Хотя бы одна цифра (0–9)" />
                                        <ReqItem ok={props.passwordRules.hasSpecial} text="Хотя бы один спецсимвол (например: ! @ # $ %)" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {props.error && <div className="authError">{props.error}</div>}

            <div className="authConsent">
                <label className="authConsentLabel">
                    <input
                        type="checkbox"
                        className="authConsentCheckbox"
                        checked={props.agreed}
                        onChange={(e) => props.onAgreeChange(e.target.checked)}
                        disabled={props.isSubmitting}
                        required
                    />
                    <span className="authConsentBox" aria-hidden="true">
                        <Check className="authConsentIcon" />
                    </span>
                    <span className="authConsentText">
                        Я даю свое согласие на обработку персональных данных, ознакомлен и полностью согласен с{" "}
                        <a href="#" className="authConsentLink">
                            политикой конфиденциальности
                        </a>
                    </span>
                </label>
            </div>

            <button className="authSubmit" type="submit" disabled={!props.canSubmit}>
                {props.isSubmitting ? "Создаём..." : "Создать аккаунт"}
            </button>

            {props.state === "success" && <div className="authSuccess">Аккаунт создан. Можете войти.</div>}
        </form>
    );
}
