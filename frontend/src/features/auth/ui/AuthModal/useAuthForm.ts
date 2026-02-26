import { useEffect, useMemo, useRef, useState } from "react";
import type { AuthMode } from "@/features/auth/api/types";
import { authApi } from "@/features/auth/api/authApi";
import { isEmailValid, type FieldErrors } from "./validators";

type State = "idle" | "submitting" | "success" | "error";

export function useAuthForm(params: { open: boolean; mode: AuthMode; onSuccess?: (accessToken: string) => void }) {
    const { open, mode, onSuccess } = params;

    const [state, setState] = useState<State>("idle");
    const [error, setError] = useState<string | null>(null);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [nonce, setNonce] = useState(0);
    const [locked, setLocked] = useState(true);
    const [passFocused, setPassFocused] = useState(false);

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [attempted, setAttempted] = useState(false);

    const [registerTouched, setRegisterTouched] = useState(false);

    const [agreed, setAgreed] = useState(false);

    const isSubmitting = state === "submitting";

    const emailRef1 = useRef<HTMLInputElement | null>(null);
    const passRef1 = useRef<HTMLInputElement | null>(null);
    const emailRef2 = useRef<HTMLInputElement | null>(null);
    const passRef2 = useRef<HTMLInputElement | null>(null);

    const email = mode === "register" ? registerEmail : loginEmail;
    const password = mode === "register" ? registerPassword : loginPassword;

    const setEmail = (value: string) => {
        if (mode === "register") setRegisterEmail(value);
        else setLoginEmail(value);
    };

    const setPassword = (value: string) => {
        if (mode === "register") setRegisterPassword(value);
        else setLoginPassword(value);
    };

    function hardClearRegisterDom() {
        if (emailRef1.current) emailRef1.current.value = "";
        if (passRef1.current) passRef1.current.value = "";
    }

    function hardClearLoginDom() {
        if (emailRef2.current) emailRef2.current.value = "";
        if (passRef2.current) passRef2.current.value = "";
    }

    function resetCommon() {
        setShowPassword(false);
        setState("idle");
        setError(null);
        setPassFocused(false);
        setFieldErrors({});
        setAttempted(false);
        setAgreed(false);
    }

    function resetAll() {
        setLoginEmail("");
        setLoginPassword("");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterTouched(false);
        resetCommon();
        hardClearRegisterDom();
        hardClearLoginDom();
    }

    function resetRegister() {
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterTouched(false);
        resetCommon();
        hardClearRegisterDom();
    }

    function resetLogin() {
        setLoginEmail("");
        setLoginPassword("");
        resetCommon();
        hardClearLoginDom();
    }

    useEffect(() => {
        if (!open) return;
        setLocked(true);
        setNonce((v) => v + 1);
        resetAll();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        setLocked(true);
        setNonce((v) => v + 1);

        if (mode === "register") resetRegister();
        else resetLogin();
    }, [mode, open]);

    useEffect(() => {
        if (!open) return;
        if (mode !== "register") return;
        if (registerTouched) return;

        const t1 = window.setTimeout(() => {
            if (registerTouched) return;
            setRegisterEmail("");
            setRegisterPassword("");
            hardClearRegisterDom();
        }, 0);

        const t2 = window.setTimeout(() => {
            if (registerTouched) return;
            setRegisterEmail("");
            setRegisterPassword("");
            hardClearRegisterDom();
        }, 80);

        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [open, mode, registerTouched]);

    function markRegisterTouched() {
        if (registerTouched) return;
        setRegisterTouched(true);
    }

    function unlock() {
        if (!locked) return;
        setLocked(false);
    }

    const passwordRules = useMemo(() => {
        const length8 = password.length >= 8;
        const length12 = password.length >= 12;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const noCyrillic = !/[А-Яа-яЁё]/.test(password);
        const hasLetterCase = hasUpper && hasLower;

        return { length8, length12, hasUpper, hasLower, hasDigit, hasSpecial, noCyrillic, hasLetterCase };
    }, [password]);

    const passwordValid = useMemo(() => {
        if (mode === "login") return password.length >= 1;
        return passwordRules.length8 && passwordRules.hasLetterCase && passwordRules.hasDigit && passwordRules.noCyrillic;
    }, [mode, passwordRules, password.length]);

    const strengthLevel = useMemo(() => {
        if (mode !== "register") return 0;

        if (password.length === 0) return 0;

        if (!passwordRules.noCyrillic) return 1;

        let score = 0;
        if (passwordRules.length8) score += 1;
        if (passwordRules.hasLower) score += 1;
        if (passwordRules.hasUpper) score += 1;
        if (passwordRules.hasDigit) score += 1;
        if (passwordRules.hasSpecial) score += 1;
        if (passwordRules.length12) score += 1;
        if (passwordRules.noCyrillic) score += 1;

        if (score <= 2) return 1;
        if (score <= 4) return 2;
        if (score <= 6) return 3;
        return 4;
    }, [mode, passwordRules, password.length]);

    const strengthText = useMemo(() => {
        if (mode !== "register") return "";
        if (password.length === 0) return "Введите пароль";
        if (!passwordRules.noCyrillic) return "Слабая";
        if (strengthLevel === 1) return "Слабая";
        if (strengthLevel === 2) return "Средняя";
        if (strengthLevel === 3) return "Хорошая";
        return "Сильная";
    }, [mode, password.length, strengthLevel, passwordRules.noCyrillic]);

    const canSubmit = useMemo(() => {
        if (mode === "register") {
            return email.trim().length > 0 && passwordValid && agreed && !isSubmitting;
        }
        return email.trim().length > 0 && passwordValid && !isSubmitting;
    }, [mode, email, passwordValid, agreed, isSubmitting]);

    function validatePassword(): FieldErrors {
        const next: FieldErrors = {};

        if (mode === "login") {
            if (password.length === 0) next.password = "Введите пароль";
        } else {
            if (password.length === 0) next.password = "Введите пароль";
            else if (!passwordRules.noCyrillic) next.password = "Пароль не должен содержать русские буквы";
            else if (!passwordValid) next.password = "Пароль не соответствует требованиям";
        }

        return next;
    }

    function validateEmailOnBlur() {
        const e = email.trim();

        if (e.length === 0) {
            setFieldErrors((p) => ({ ...p, email: undefined }));
            return;
        }

        if (!isEmailValid(e)) {
            setFieldErrors((p) => ({ ...p, email: "Введите корректную почту (например: name@mail.com)" }));
            return;
        }

        setFieldErrors((p) => ({ ...p, email: undefined }));
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isSubmitting) return;

        setAttempted(true);

        const trimmedEmail = email.trim();

        if (trimmedEmail.length === 0) {
            setFieldErrors((p) => ({ ...p, email: "Введите email" }));
            return;
        }

        if (!isEmailValid(trimmedEmail)) {
            setFieldErrors((p) => ({ ...p, email: "Введите корректную почту (например: name@mail.com)" }));
            return;
        }

        if (mode === "register" && !agreed) {
            return;
        }

        const v = validatePassword();
        if (v.password) {
            setFieldErrors((p) => ({ ...p, password: v.password }));
            setState("idle");
            setError(null);
            return;
        }

        setFieldErrors({});
        setError(null);
        setState("submitting");

        try {
            const res =
                mode === "register"
                    ? await authApi.register(registerEmail.trim(), registerPassword)
                    : await authApi.login(loginEmail.trim(), loginPassword);

            setState("success");
            onSuccess?.(res.accessToken);
        } catch (err) {
            setState("error");
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        }
    }

    const ids = {
        registerEmailId: `auth-email-${nonce}`,
        registerPassId: `auth-pass-${nonce}`,
        loginEmailId: `auth-email-2-${nonce}`,
        loginPassId: `auth-pass-2-${nonce}`,
        registerEmailMsgId: `auth-email-msg-register-${nonce}`,
        registerPassMsgId: `auth-pass-msg-register-${nonce}`,
        loginEmailMsgId: `auth-email-msg-login-${nonce}`,
        loginPassMsgId: `auth-pass-msg-login-${nonce}`,
    };

    const showStrength = mode === "register" && passFocused;

    const emailError = fieldErrors.email;
    const passwordError = attempted ? fieldErrors.password : undefined;

    const emailOk = isEmailValid(email);
    const emailWrapState = emailError ? "authInputWrap--error" : emailOk ? "authInputWrap--ok" : "";

    const passRegisterWrapState = passwordError
        ? "authInputWrap--error"
        : password.length > 0
            ? `authInputWrap--strength-${strengthLevel}`
            : "";

    const passLoginWrapState = passwordError ? "authInputWrap--error" : password.length > 0 ? "authInputWrap--ok" : "";

    return {
        state,
        error,

        email,
        password,

        showPassword,
        locked,
        passFocused,
        nonce,

        fieldErrors,
        attempted,
        isSubmitting,

        agreed,
        setAgreed,

        passwordRules,
        passwordValid,
        strengthLevel,
        strengthText,
        canSubmit,

        ids,
        showStrength,
        emailError,
        passwordError,
        emailWrapState,
        passRegisterWrapState,
        passLoginWrapState,

        emailRef1,
        passRef1,
        emailRef2,
        passRef2,

        setEmail,
        setPassword,
        setShowPassword,
        setPassFocused,
        setFieldErrors,

        unlock,
        markRegisterTouched,
        validateEmailOnBlur,
        submit,
    };
}
