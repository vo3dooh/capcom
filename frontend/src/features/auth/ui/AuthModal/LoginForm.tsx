import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Check } from "lucide-react";

type Props = {
    nonce: number;
    ids: {
        loginEmailId: string;
        loginPassId: string;
        loginEmailMsgId: string;
        loginPassMsgId: string;
    };
    isSubmitting: boolean;
    canSubmit: boolean;

    email: string;
    password: string;
    showPassword: boolean;

    emailError?: string;
    passwordError?: string;

    emailWrapState: string;
    passLoginWrapState: string;

    error: string | null;
    state: "idle" | "submitting" | "success" | "error";

    emailRef: React.RefObject<HTMLInputElement | null>;
    passRef: React.RefObject<HTMLInputElement | null>;

    onSubmit: (e: React.FormEvent) => void;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onEmailBlur: () => void;
    onTogglePassword: () => void;
    onForgot: () => void;
    onClearEmailError: () => void;
    onClearPasswordError: () => void;
};

export function LoginForm(props: Props) {
    const [remember, setRemember] = useState(false);

    return (
        <form key={`login-${props.nonce}`} className="authForm" onSubmit={props.onSubmit} autoComplete="off" noValidate>
            <div className="authField">
                <label className="authLabel" htmlFor={props.ids.loginEmailId}>
                    Email
                </label>

                <div className={`authInputWrap ${props.emailWrapState}`}>
                    <Mail className="authLeftIcon" />
                    <input
                        ref={props.emailRef}
                        id={props.ids.loginEmailId}
                        name="cc_login_email"
                        className={`authInput authInput--leftIcon ${props.emailError ? "authInput--invalid" : ""}`}
                        type="email"
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
                        aria-describedby={props.emailError ? props.ids.loginEmailMsgId : undefined}
                    />
                </div>

                {props.emailError ? (
                    <div className="authFieldMsgSlot isOpen">
                        <div id={props.ids.loginEmailMsgId} className="authFieldMsg authFieldMsg--error" role="alert">
                            <AlertCircle className="authFieldMsgIcon" />
                            <span>{props.emailError}</span>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="authField">
                <label className="authLabel" htmlFor={props.ids.loginPassId}>
                    Пароль
                </label>

                <div className={`authInputWrap ${props.passLoginWrapState}`}>
                    <Lock className="authLeftIcon" />
                    <input
                        ref={props.passRef}
                        id={props.ids.loginPassId}
                        name="cc_login_password"
                        className={`authInput authInput--leftIcon authInput--withIcon ${props.passwordError ? "authInput--invalid" : ""}`}
                        type={props.showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Введите свой пароль"
                        value={props.password}
                        onChange={(e) => {
                            props.onPasswordChange(e.target.value);
                            props.onClearPasswordError();
                        }}
                        disabled={props.isSubmitting}
                        minLength={1}
                        required
                        aria-invalid={!!props.passwordError}
                        aria-describedby={props.passwordError ? props.ids.loginPassMsgId : undefined}
                    />

                    <button
                        type="button"
                        className="authPassToggle"
                        onClick={props.onTogglePassword}
                        disabled={props.isSubmitting}
                        aria-label={props.showPassword ? "Скрыть пароль" : "Показать пароль"}
                        title={props.showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {props.showPassword ? <EyeOff className="authIcon" /> : <Eye className="authIcon" />}
                    </button>
                </div>

                {props.passwordError ? (
                    <div className="authFieldMsgSlot isOpen">
                        <div id={props.ids.loginPassMsgId} className="authFieldMsg authFieldMsg--error" role="alert">
                            <AlertCircle className="authFieldMsgIcon" />
                            <span>{props.passwordError}</span>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="authConsent authConsent--compact">
                <div className="authLoginMetaRow">
                    <label className="authConsentLabel">
                        <input
                            type="checkbox"
                            className="authConsentCheckbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            disabled={props.isSubmitting}
                        />
                        <span className="authConsentBox" aria-hidden="true">
                            <Check className="authConsentIcon" />
                        </span>
                        <span className="authConsentText">Запомнить меня</span>
                    </label>

                    <button className="authLink" type="button" disabled={props.isSubmitting} onClick={props.onForgot}>
                        Забыли пароль?
                    </button>
                </div>
            </div>

            {props.error && <div className="authError">{props.error}</div>}

            <button className="authSubmit" type="submit" disabled={!props.canSubmit}>
                {props.isSubmitting ? "Входим..." : "Войти"}
            </button>
        </form>
    );
}
