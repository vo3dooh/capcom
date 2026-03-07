import styles from "./ChannelSocialLinks.module.css"
import TelegramIcon from "@/shared/assets/social/telegram.svg"
import VkIcon from "@/shared/assets/social/vk.svg"
import WebsiteIcon from "@/shared/assets/social/website.svg"

type Props = {
    telegramUrl: string | null
    vkUrl: string | null
    websiteUrl: string | null
}

type SocialType = "telegram" | "vk" | "website"

type SocialLink = {
    type: SocialType
    label: string
    href: string
}

const icons = {
    telegram: TelegramIcon,
    vk: VkIcon,
    website: WebsiteIcon,
}

export function ChannelSocialLinks({ telegramUrl, vkUrl, websiteUrl }: Props) {
    const links: SocialLink[] = [
        { type: "telegram", label: "Telegram", href: telegramUrl ?? "" },
        { type: "vk", label: "VK", href: vkUrl ?? "" },
        { type: "website", label: "Website", href: websiteUrl ?? "" },
    ].filter((item): item is SocialLink => Boolean(item.href))

    if (!links.length) return null

    return (
        <div className={styles.coverSocials}>
            {links.map((social) => {
                const Icon = icons[social.type]

                return (
                    <a
                        key={social.type}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.socialButton} ${styles[`socialButton_${social.type}`]}`}
                        aria-label={social.label}
                        title={social.label}
                    >
                        <Icon className={styles.socialIcon} aria-hidden="true" />
                    </a>
                )
            })}
        </div>
    )
}
