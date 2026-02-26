import { ReactNode, useEffect, useRef, useState } from "react";
import "./modal.css";

type Props = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: ReactNode;
};

const OUT_MS = 260;

export function Modal({ open, title, onClose, children }: Props) {
    const [mounted, setMounted] = useState(open);
    const [state, setState] = useState<"open" | "closing">(open ? "open" : "closing");
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (open) {
            setMounted(true);
            setState("open");
            return;
        }

        if (!mounted) return;

        setState("closing");

        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            setMounted(false);
        }, OUT_MS);
    }, [open, mounted]);

    useEffect(() => {
        if (!mounted) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && state !== "closing") onClose();
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [mounted, state, onClose]);

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="modal" role="dialog" aria-modal="true" aria-label={title ?? "Окно"} data-state={state}>
            <div
                className="modal__overlay"
                onMouseDown={() => {
                    if (state === "closing") return;
                    onClose();
                }}
            />
            <div className="modal__panel" onMouseDown={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
