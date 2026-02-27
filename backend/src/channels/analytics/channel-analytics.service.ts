// backend/src/channels/analytics/channel-analytics.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PredictionStatus } from '@prisma/client'

type Period = 'month' | 'all'

type OverviewPoint = {
  ts: string
  value: number
}

type ChannelOverviewResponse = {
  period: Period
  header: {
    leftHintValue: string
    rightHintValue: string
  }
  bottom: {
    valueText: string
    valueSuffix: string
  }
  lastUpdatedText: string
  series: OverviewPoint[]
}

type ChannelMonthlyStatsItem = {
  monthStart: string
  predictionsCount: number
  profitPercent: number
  drawdownPercent: number
}

type ChannelMonthlyStatsResponse = {
  updatedAt: string
  items: ChannelMonthlyStatsItem[]
}

function round2(x: number): number {
  return Math.round(x * 100) / 100
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0))
}

function addDaysUtc(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000)
}

function isoDayKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatUpdated(d: Date): string {
  const date = d.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
  return `${date}, ${time} UTC`
}

function calcProfit(result: PredictionStatus, stake: number, odds: number): number {
  if (result === PredictionStatus.win) return round2(stake * (odds - 1))
  if (result === PredictionStatus.loss) return round2(-stake)
  return 0
}

@Injectable()
export class ChannelAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private async profitInRange(params: { channelId: string; from: Date; toExclusive: Date }): Promise<number> {
    const rows = await this.prisma.prediction.findMany({
      where: {
        channelId: params.channelId,
        createdAt: { gte: params.from, lt: params.toExclusive },
        result: { in: [PredictionStatus.win, PredictionStatus.loss, PredictionStatus.void] }
      },
      select: { result: true, stake: true, odds: true }
    })

    let sum = 0
    for (const r of rows) sum += calcProfit(r.result, r.stake, r.odds)
    return round2(sum)
  }

  async getOverview(params: { slug: string; period: Period }): Promise<ChannelOverviewResponse> {
    const { slug, period } = params

    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      select: {
        id: true,
        startingBankroll: true,
        stats: { select: { updatedAt: true } }
      }
    })

    if (!channel) throw new NotFoundException('Channel not found')

    const base = channel.startingBankroll ?? 1000
    const now = new Date()
    const lastUpdated = channel.stats?.updatedAt ?? now

    const minMax = await this.prisma.prediction.aggregate({
      where: {
        channelId: channel.id,
        result: { in: [PredictionStatus.win, PredictionStatus.loss, PredictionStatus.void] }
      },
      _min: { createdAt: true },
      _max: { createdAt: true }
    })

    const minCreatedAt = minMax._min.createdAt
    const maxCreatedAt = minMax._max.createdAt

    if (!minCreatedAt || !maxCreatedAt) {
      return {
        period,
        header: { leftHintValue: '', rightHintValue: '' },
        bottom: { valueText: '+0.00', valueSuffix: '%' },
        lastUpdatedText: formatUpdated(lastUpdated),
        series: []
      }
    }

    const minDay = startOfUtcDay(minCreatedAt)
    const maxDay = startOfUtcDay(maxCreatedAt)
    const today = startOfUtcDay(now)

    let fromDay: Date
    let toDay: Date

    if (period === 'all') {
      fromDay = minDay
      toDay = maxDay
    } else {
      toDay = today
      fromDay = addDaysUtc(toDay, -29)
    }

    const toExclusive = addDaysUtc(toDay, 1)

    const preds = await this.prisma.prediction.findMany({
      where: {
        channelId: channel.id,
        createdAt: { gte: fromDay, lt: toExclusive },
        result: { in: [PredictionStatus.win, PredictionStatus.loss, PredictionStatus.void] }
      },
      select: { createdAt: true, result: true, stake: true, odds: true },
      orderBy: { createdAt: 'asc' }
    })

    const dayProfit = new Map<string, number>()
    for (const p of preds) {
      const key = isoDayKey(startOfUtcDay(p.createdAt))
      const profit = calcProfit(p.result, p.stake, p.odds)
      dayProfit.set(key, round2((dayProfit.get(key) ?? 0) + profit))
    }

    const daysCount = Math.max(
      1,
      Math.floor((toDay.getTime() - fromDay.getTime()) / (24 * 60 * 60 * 1000)) + 1
    )

    // ВАЖНО:
    // 1) ts теперь ISO YYYY-MM-DD (уникальный, без схлопывания на оси)
    // 2) первая точка — стартовая (base) и помечена суффиксом "-s", чтобы не совпадала с реальным днём
    const series: OverviewPoint[] = []
    let cumulative = 0

    const startKey = isoDayKey(fromDay)
    series.push({ ts: `${startKey}-s`, value: round2(base) })

    for (let i = 0; i < daysCount; i += 1) {
      const d = addDaysUtc(fromDay, i)
      const key = isoDayKey(d)
      cumulative = round2(cumulative + (dayProfit.get(key) ?? 0))
      series.push({ ts: key, value: round2(base + cumulative) })
    }

    const first = series[0]?.value ?? base
    const last = series[series.length - 1]?.value ?? base
    const trend = first !== 0 ? round2(((last - first) / Math.abs(first)) * 100) : 0

    let compareText = ''
    if (period === 'month') {
      const curFrom = fromDay
      const curTo = toExclusive
      const prevTo = curFrom
      const prevFrom = addDaysUtc(prevTo, -30)

      const curProfit = await this.profitInRange({ channelId: channel.id, from: curFrom, toExclusive: curTo })
      const prevProfit = await this.profitInRange({ channelId: channel.id, from: prevFrom, toExclusive: prevTo })

      const delta = round2(curProfit - prevProfit)
      const pct = base !== 0 ? round2((delta / Math.abs(base)) * 100) : 0
      compareText = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
    }

    return {
      period,
      header: { leftHintValue: '', rightHintValue: compareText },
      bottom: { valueText: `${trend >= 0 ? '+' : ''}${trend.toFixed(2)}`, valueSuffix: '%' },
      lastUpdatedText: formatUpdated(lastUpdated),
      series
    }
  }

  async getMonthlyStats(params: { slug: string }): Promise<ChannelMonthlyStatsResponse> {
    const { slug } = params

    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      select: {
        id: true,
        startingBankroll: true,
        stats: { select: { updatedAt: true } }
      }
    })

    if (!channel) throw new NotFoundException('Channel not found')

    const base = channel.startingBankroll ?? 1000
    const now = new Date()

    const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1, 0, 0, 0, 0))

    const predictions = await this.prisma.prediction.findMany({
      where: {
        channelId: channel.id,
        createdAt: { gte: fromDate },
        result: { in: [PredictionStatus.win, PredictionStatus.loss, PredictionStatus.void] }
      },
      select: {
        createdAt: true,
        result: true,
        stake: true,
        odds: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const perMonth = new Map<string, { profits: number[] }>()

    for (const p of predictions) {
      const key = `${p.createdAt.getUTCFullYear()}-${String(p.createdAt.getUTCMonth() + 1).padStart(2, '0')}`
      const monthData = perMonth.get(key) ?? { profits: [] }
      monthData.profits.push(calcProfit(p.result, p.stake, p.odds))
      perMonth.set(key, monthData)
    }

    const items: ChannelMonthlyStatsItem[] = []

    for (let i = 11; i >= 0; i -= 1) {
      const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1, 0, 0, 0, 0))
      const key = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}`
      const monthData = perMonth.get(key)
      const profits = monthData?.profits ?? []

      const totalProfit = round2(profits.reduce((acc, v) => acc + v, 0))
      const profitPercent = base !== 0 ? round2((totalProfit / Math.abs(base)) * 100) : 0

      let running = 0
      let peak = 0
      let maxDrawdown = 0

      for (const profit of profits) {
        running = round2(running + profit)
        peak = Math.max(peak, running)
        maxDrawdown = Math.max(maxDrawdown, peak - running)
      }

      const drawdownPercent = base !== 0 ? round2((maxDrawdown / Math.abs(base)) * 100) : 0

      items.push({
        monthStart: current.toISOString(),
        predictionsCount: profits.length,
        profitPercent,
        drawdownPercent
      })
    }

    return {
      updatedAt: (channel.stats?.updatedAt ?? now).toISOString(),
      items
    }
  }
}
