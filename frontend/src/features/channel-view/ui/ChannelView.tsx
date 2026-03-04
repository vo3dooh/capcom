import { Link } from "react-router-dom"
import { Plus, Settings } from "lucide-react"
import { useChannelView } from "../model/useChannelView"
import { PredictionsFeed } from "@/features/predictions/ui/PredictionsFeed"
import { ChannelStatsBlock } from "@/features/predictions/ui/ChannelStatsBlock"
import { ChannelOverviewCardConnected } from "@/features/analytics/ui/ChannelOverviewCard"
import { ChannelMonthlyStatsCardConnected } from "@/features/analytics/ui/ChannelMonthlyStatsCard"
import styles from "./ChannelView.module.css"

export function ChannelView({ slug }: { slug: string }) {
    const { data, loading, error, join, leave, actionLoading } = useChannelView(slug)

    if (loading) return <div className={styles.state}>Загрузка…</div>
    if (error) return <div className={styles.stateError}>{error}</div>
    if (!data) return <div className={styles.state}>Канал не найден</div>

    const isOwner = data.myRole === "owner"
    const canSeeSettings = data.myRole === "owner" || data.myRole === "editor" || data.myRole === "moderator"
    const canCreatePrediction = canSeeSettings

    const showJoin = !data.isMember
    const showLeave = data.isMember && !isOwner

    const ownerText = data.owner.username
        ? data.owner.username
        : data.owner.handle
            ? `@${data.owner.handle}`
            : data.owner.id

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <div className={styles.left}>
                    <div className={styles.headerCard}>
                        <div className={styles.cover}>
                            {data.coverUrl ? (
                                <img className={styles.coverImg} src={data.coverUrl} alt="" />
                            ) : (
                                <div className={styles.coverFallback} />
                            )}
                            <div className={styles.coverShade} />
                            <div className={styles.coverActions}>
                                {canCreatePrediction ? (
                                    <Link
                                        to={`/channels/${data.slug}/predictions/new`}
                                        className={styles.iconBtn}
                                        aria-label="Создать прогноз"
                                        title="Создать прогноз"
                                    >
                                        <Plus className={styles.icon} aria-hidden="true" />
                                    </Link>
                                ) : null}

                                {canSeeSettings ? (
                                    <Link
                                        to={`/channels/${data.slug}/settings`}
                                        className={styles.iconBtn}
                                        aria-label="Настройки"
                                        title="Настройки"
                                    >
                                        <Settings className={styles.icon} aria-hidden="true" />
                                    </Link>
                                ) : null}
                            </div>
                        </div>

                        <div className={styles.headerBody}>
                            <div className={styles.headerContent}>
                                <div className={styles.avatarWrap}>
                                    {data.avatarUrl ? (
                                        <img className={styles.avatarImg} src={data.avatarUrl} alt="" />
                                    ) : (
                                        <div className={styles.avatarFallback} aria-hidden="true" />
                                    )}
                                </div>

                                <div className={styles.headerMain}>
                                    <div className={styles.headerTopRow}>
                                        <div className={styles.titleBlock}>
                                            <div className={styles.title}>{data.name}</div>
                                            <div className={styles.handle}>@{data.slug}</div>
                                        </div>

                                        <div className={styles.actions}>
                                            <div className={styles.actionsPrimary}>
                                                {showLeave ? (
                                                    <button
                                                        className={styles.btn}
                                                        onClick={leave}
                                                        disabled={actionLoading}
                                                        type="button"
                                                    >
                                                        Отписаться
                                                    </button>
                                                ) : null}

                                                {showJoin ? (
                                                    <button
                                                        className={styles.btnPrimary}
                                                        onClick={join}
                                                        disabled={actionLoading}
                                                        type="button"
                                                    >
                                                        Подписаться
                                                    </button>
                                                ) : null}
                                            </div>

                                        </div>
                                    </div>

                                    <div className={styles.hr} />

                                    <div className={styles.aboutBlock}>
                                        <div className={styles.aboutTitle}>Описание канала</div>
                                        <div className={styles.aboutText}>
                                            {data.description ? data.description : "Описание не задано"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.leftStack}>
                        <ChannelStatsBlock slug={data.slug} />

                        <div className={styles.card}>
                            <div className={styles.sectionTitle}>Прогнозы</div>
                            <PredictionsFeed slug={data.slug} />
                        </div>
                    </div>
                </div>

                <div className={styles.right}>
                    <div className={styles.sideStack}>
                        <ChannelOverviewCardConnected slug={data.slug} />
                        <ChannelMonthlyStatsCardConnected slug={data.slug} />

                        <div className={styles.card}>
                            <div className={styles.sectionTitle}>Владелец</div>
                            <div className={styles.ownerRow}>
                                <div className={styles.ownerAvatar}>
                                    {data.owner.avatarUrl ? (
                                        <img className={styles.ownerAvatarImg} src={data.owner.avatarUrl} alt="" />
                                    ) : (
                                        <div className={styles.ownerAvatarFallback} aria-hidden="true" />
                                    )}
                                </div>
                                <div className={styles.ownerText}>{ownerText}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
