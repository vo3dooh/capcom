import React from "react";
import { Modal } from "@/shared/ui/Modal";
import type { AuthMode } from "@/features/auth/api/types";
import { X } from "lucide-react";
import { AuthAside } from "./AuthAside";
import { AuthSlides } from "./AuthSlides";
import { useAuthForm } from "./useAuthForm";

import "./auth-modal.css";

type Props = {
    open: boolean;
    mode: AuthMode;
    onClose: () => void;
    onModeChange?: (mode: AuthMode) => void;
    onSuccess?: (accessToken: string) => void;
};

export function AuthModal({ open, mode, onClose, onModeChange, onSuccess }: Props) {
    const form = useAuthForm({ open, mode, onSuccess });

    function close() {
        if (form.isSubmitting) return;
        onClose();
    }

    function switchMode(next: AuthMode) {
        if (form.isSubmitting) return;
        onModeChange?.(next);
    }

    return (
        <Modal open={open} onClose={close} title={mode === "register" ? "Регистрация" : "Вход"}>
            <div className={`authModal ${mode === "login" ? "authModal--swap" : ""}`}>
                <AuthAside mode={mode} />

                <div key={`authContent-${mode}-${form.nonce}`} className="authContent authContent--enter">
                    <div className="authCloseWrap">
                        <button type="button" className="authClose" onClick={close} aria-label="Закрыть" title="Закрыть">
                            <X className="authIcon" />
                        </button>
                    </div>

                    <div className="authEnterItem authEnterItem--1">
                        <AuthSlides mode={mode} isSubmitting={form.isSubmitting} onSwitchMode={switchMode} form={form} />
                    </div>

                    <div className="authEnterItem authEnterItem--6">
                        <div className="authFooterSwitch">
                            {mode === "login" ? (
                                <>
                                    Нет аккаунта?{" "}
                                    <button type="button" className="authLinkStrong" onClick={() => switchMode("register")} disabled={form.isSubmitting}>
                                        Зарегистрироваться
                                    </button>
                                </>
                            ) : (
                                <>
                                    Уже есть аккаунт?{" "}
                                    <button type="button" className="authLinkStrong" onClick={() => switchMode("login")} disabled={form.isSubmitting}>
                                        Войти
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
