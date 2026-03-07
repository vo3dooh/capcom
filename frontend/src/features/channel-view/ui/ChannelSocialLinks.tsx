import telegramIcon from "@/shared/assets/social/telegram.svg"
import vkIcon from "@/shared/assets/social/vk.svg"
import websiteIcon from "@/shared/assets/social/website.svg"
import styles from "./ChannelSocialLinks.module.css"

type Props = {
    telegramUrl: string | null
    vkUrl: string | null
    websiteUrl: string | null
}

type SocialLink = {
    type: "telegram" | "vk" | "website"
    label: string
    href: string
    icon: string
}

export function ChannelSocialLinks({ telegramUrl, vkUrl, websiteUrl }: Props) {
    const links: SocialLink[] = [
        { type: "telegram", label: "Telegram", href: telegramUrl ?? "", icon: telegramIcon },
        { type: "vk", label: "VK", href: vkUrl ?? "", icon: vkIcon },
        { type: "website", label: "Website", href: websiteUrl ?? "", icon: websiteIcon },
    ].filter((item): item is SocialLink => Boolean(item.href))

    if (!links.length) return null

    return (
        <div className={styles.coverSocials}>
            {links.map((social) => (
                <a
                    key={social.type}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.socialBtn} ${styles[`socialBtn_${social.type}`]}`}
                    aria-label={social.label}
                    title={social.label}
                >
                    <img src={social.icon} alt="" className={styles.socialIcon} aria-hidden="true" />
                </a>
            ))}
        </div>
    )
}
