import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { TheSportsDbService } from "../integrations/theSportsDb/theSportsDb.service"

function normalizeTeamName(name: string) {
  let s = (name || "").trim()

  s = s.replace(/\s+/g, " ")
  s = s.replace(/\((.*?)\)/g, " ").replace(/\s+/g, " ").trim()
  s = s.replace(/\bFC\b/gi, " ")
  s = s.replace(/\bCF\b/gi, " ")
  s = s.replace(/\bSC\b/gi, " ")
  s = s.replace(/\bFK\b/gi, " ")
  s = s.replace(/\bAC\b/gi, " ")
  s = s.replace(/\bBC\b/gi, " ")
  s = s.replace(/\bU\d+\b/gi, " ")
  s = s.replace(/\bII\b/gi, " ")
  s = s.replace(/\bIII\b/gi, " ")
  s = s.replace(/\bIV\b/gi, " ")
  s = s.replace(/\bWomen\b/gi, " ")
  s = s.replace(/\bReserves\b/gi, " ")
  s = s.replace(/\bReserve\b/gi, " ")
  s = s.replace(/\s+/g, " ").trim()

  return s
}

@Injectable()
export class CompetitorLogoService {
  private readonly inFlight = new Set<string>()
  private readonly missUntil = new Map<string, number>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly tsdb: TheSportsDbService,
  ) {}

  private shouldSkip(competitorId: string) {
    const until = this.missUntil.get(competitorId)
    if (!until) return false
    return Date.now() < until
  }

  private markMiss(competitorId: string) {
    this.missUntil.set(competitorId, Date.now() + 24 * 60 * 60 * 1000)
  }

  async ensureLogo(competitorId: string): Promise<void> {
    if (!competitorId) return
    if (this.inFlight.has(competitorId)) return
    if (this.shouldSkip(competitorId)) return

    this.inFlight.add(competitorId)

    try {
      const competitor = await this.prisma.competitor.findUnique({
        where: { id: competitorId },
        select: { id: true, name: true, logoUrl: true },
      })

      if (!competitor) return
      if (competitor.logoUrl && competitor.logoUrl.trim()) return

      const name1 = (competitor.name || "").trim()
      const name2 = normalizeTeamName(name1)

      let badge: string | null = null

      if (name1) badge = await this.tsdb.searchTeamBadge(name1)
      if (!badge && name2 && name2 !== name1) badge = await this.tsdb.searchTeamBadge(name2)

      if (!badge) {
        this.markMiss(competitor.id)
        return
      }

      await this.prisma.competitor.update({
        where: { id: competitor.id },
        data: { logoUrl: badge },
      })
    } catch {
      return
    } finally {
      this.inFlight.delete(competitorId)
    }
  }
}