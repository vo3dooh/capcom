import { useMemo } from "react";
import "./logo.css";

type Props = {
    nameMain?: string;
    nameBadge?: string;
};

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function Logo({
    nameMain = "Capper",
    nameBadge = "Community",
}: Props) {
    const styleVars = useMemo(() => {
        const angle = Math.round(rand(25, 70));
        const d1 = `${Math.round(rand(10, 40))}s`;
        const d2 = `${Math.round(rand(18, 55))}s`;
        const delay = `-${Math.round(rand(0, 12))}s`;
        const x = `${Math.round(rand(0, 100))}%`;
        const y = `${Math.round(rand(0, 100))}%`;

        return {
            ["--cc-angle" as any]: `${angle}deg`,
            ["--cc-dur1" as any]: d1,
            ["--cc-dur2" as any]: d2,
            ["--cc-delay" as any]: delay,
            ["--cc-seed-x" as any]: x,
            ["--cc-seed-y" as any]: y,
        } as React.CSSProperties;
    }, []);

    return (
        <a
            className="logo logo--link"
            href="/dashboard"
            aria-label={`${nameMain} ${nameBadge}`}
        >
            <div className="logo__stack">
                <div className="logo__main">{nameMain}</div>
                <div className="logo__badge" style={styleVars}>
                    {nameBadge}
                </div>
            </div>
        </a>
    );
}
