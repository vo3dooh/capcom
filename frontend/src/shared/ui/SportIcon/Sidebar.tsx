import { Icon } from "@iconify/react";

type Props = {
    slug: string;
    size?: number;
};

const sportIconMap: Record<string, string> = {
    football: "ph:soccer-ball",
    basketball: "ph:basketball",
    tennis: "ph:tennis-ball",
    hockey: "ph:hockey",
    baseball: "ph:baseball",
    boxing: "ph:boxing-glove",
    mma: "ph:sword",
    esports: "ph:game-controller",
};

export function SportIcon({ slug, size = 18 }: Props) {
    const icon = sportIconMap[slug] || "ph:trophy";
    return <Icon icon={icon} width={size} height={size} />;
}