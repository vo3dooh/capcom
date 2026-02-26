import React from "react";
import type { AuthMode } from "@/features/auth/api/types";
import { RegisterForm } from "./RegisterForm";
import { LoginForm } from "./LoginForm";

type Props = {
    mode: AuthMode;
    isSubmitting: boolean;
    onSwitchMode: (next: AuthMode) => void;
    form: any;
};

export function AuthSlides(props: Props) {
    const f = props.form;

    function switchTo(next: AuthMode) {
        if (props.isSubmitting) return;
        if (next === props.mode) return;
        props.onSwitchMode(next);
    }

    return (
        <div className="authStage">
            <div className="authHeader">
                <div className="authTopTabs authEnterItem authEnterItem--2">
                    <button
                        type="button"
                        className={`authTopTab ${props.mode === "login" ? "isActive" : ""}`}
                        onClick={() => switchTo("login")}
                        disabled={props.isSubmitting}
                    >
                        Вход
                    </button>
                    <button
                        type="button"
                        className={`authTopTab ${props.mode === "register" ? "isActive" : ""}`}
                        onClick={() => switchTo("register")}
                        disabled={props.isSubmitting}
                    >
                        Регистрация
                    </button>
                </div>

                <div className="authEnterItem authEnterItem--3">
                    {props.mode === "register" ? <h2 className="authTitle">Создать аккаунт</h2> : <h2 className="authTitle">С возвращением!</h2>}
                </div>

                <div className="authEnterItem authEnterItem--4">
                    {props.mode === "register" ? (
                        <p className="authSubtitle">Введите данные для регистрации.</p>
                    ) : (
                        <p className="authSubtitle">Введите данные, чтобы войти.</p>
                    )}
                </div>
            </div>

            <div className="authEnterItem authEnterItem--5">
                {props.mode === "register" ? (
                    <RegisterForm
                        nonce={f.nonce}
                        ids={{
                            registerEmailId: f.ids.registerEmailId,
                            registerPassId: f.ids.registerPassId,
                            registerEmailMsgId: f.ids.registerEmailMsgId,
                            registerPassMsgId: f.ids.registerPassMsgId,
                        }}
                        isSubmitting={f.isSubmitting}
                        canSubmit={f.canSubmit}

                        agreed={f.agreed}
                        onAgreeChange={f.setAgreed}

                        email={f.email}
                        password={f.password}
                        showPassword={f.showPassword}
                        locked={f.locked}
                        emailError={f.emailError}
                        passwordError={f.passwordError}
                        emailWrapState={f.emailWrapState}
                        passRegisterWrapState={f.passRegisterWrapState}
                        showStrength={f.showStrength}
                        strengthLevel={f.strengthLevel}
                        strengthText={f.strengthText}
                        passwordRules={f.passwordRules}
                        passwordValid={f.passwordValid}
                        error={f.error}
                        state={f.state}
                        emailRef={f.emailRef1}
                        passRef={f.passRef1}
                        onSubmit={f.submit}
                        onEmailChange={f.setEmail}
                        onPasswordChange={f.setPassword}
                        onEmailBlur={f.validateEmailOnBlur}
                        onUnlockAndFocusPass={() => {
                            f.unlock();
                            f.setPassFocused(true);
                        }}
                        onPassBlur={() => f.setPassFocused(false)}
                        onTogglePassword={() => f.setShowPassword((v: boolean) => !v)}
                        onClearEmailError={() => f.setFieldErrors((p: any) => ({ ...p, email: undefined }))}
                        onClearPasswordError={() => f.setFieldErrors((p: any) => ({ ...p, password: undefined }))}
                    />
                ) : (
                    <LoginForm
                        nonce={f.nonce}
                        ids={{
                            loginEmailId: f.ids.loginEmailId,
                            loginPassId: f.ids.loginPassId,
                            loginEmailMsgId: f.ids.loginEmailMsgId,
                            loginPassMsgId: f.ids.loginPassMsgId,
                        }}
                        isSubmitting={f.isSubmitting}
                        canSubmit={f.canSubmit}
                        email={f.email}
                        password={f.password}
                        showPassword={f.showPassword}
                        emailError={f.emailError}
                        passwordError={f.passwordError}
                        emailWrapState={f.emailWrapState}
                        passLoginWrapState={f.passLoginWrapState}
                        error={f.error}
                        state={f.state}
                        emailRef={f.emailRef2}
                        passRef={f.passRef2}
                        onSubmit={f.submit}
                        onEmailChange={f.setEmail}
                        onPasswordChange={f.setPassword}
                        onEmailBlur={f.validateEmailOnBlur}
                        onTogglePassword={() => f.setShowPassword((v: boolean) => !v)}
                        onForgot={() => alert("Восстановление пароля добавим позже")}
                        onClearEmailError={() => f.setFieldErrors((p: any) => ({ ...p, email: undefined }))}
                        onClearPasswordError={() => f.setFieldErrors((p: any) => ({ ...p, password: undefined }))}
                    />
                )}
            </div>
        </div>
    );
}
