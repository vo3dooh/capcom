import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { PredictionResultDto } from './dto/settle-prediction.dto';
import { TheSportsDbService } from '../integrations/theSportsDb/theSportsDb.service';
import { LogoCacheService } from '../shared/files/logo-cache.service';

type CompetitorLite = {
  id: string;
  name: string;
  logoUrl: string | null;
  sportId: string;
  leagueName: string | null;
};

type LeagueLite = {
  id: string;
  name: string;
  logoUrl: string | null;
  sportId: string;
};

function normalizeTeamName(name: string) {
  let s = (name || '').trim();

  s = s.replace(/\s+/g, ' ');
  s = s
    .replace(/\((.*?)\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/\bFC\b/gi, ' ');
  s = s.replace(/\bCF\b/gi, ' ');
  s = s.replace(/\bSC\b/gi, ' ');
  s = s.replace(/\bFK\b/gi, ' ');
  s = s.replace(/\bAC\b/gi, ' ');
  s = s.replace(/\bBC\b/gi, ' ');
  s = s.replace(/\bU\d+\b/gi, ' ');
  s = s.replace(/\bII\b/gi, ' ');
  s = s.replace(/\bIII\b/gi, ' ');
  s = s.replace(/\bIV\b/gi, ' ');
  s = s.replace(/\bWomen\b/gi, ' ');
  s = s.replace(/\bW\b/gi, ' ');
  s = s.replace(/\bReserves\b/gi, ' ');
  s = s.replace(/\bReserve\b/gi, ' ');
  s = s.replace(/\bB\b/gi, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

function toSlug(input: string) {
  const s = (input || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return s.length ? s : 'item';
}

function isLocalLogo(url: string) {
  const u = (url || '').trim();
  return u.startsWith('/static/logos/');
}

function isHttpUrl(url: string) {
  const u = (url || '').trim().toLowerCase();
  return u.startsWith('http://') || u.startsWith('https://');
}

@Injectable()
export class PredictionsService {
  private inFlightLogo = new Set<string>();
  private missUntil = new Map<string, number>();
  private sportSlugCache = new Map<string, string>();
  private sportNameCache = new Map<string, string>();

  private inFlightLeagueLogo = new Set<string>();
  private leagueMissUntil = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tsdb: TheSportsDbService,
    private readonly logoCache: LogoCacheService,
  ) {}

  private async requireChannel(slug: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      select: {
        id: true,
        deletedAt: true,
        visibility: true,
        ownerId: true,
      },
    });

    if (!channel || channel.deletedAt)
      throw new NotFoundException('Channel not found');
    return channel;
  }

  private async requireMember(channelId: string, userId: string) {
    const member = await this.prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        status: 'active',
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!member) throw new ForbiddenException('Not a member');
    return member;
  }

  private async requireEditor(member: { role: string }) {
    if (
      member.role === 'owner' ||
      member.role === 'editor' ||
      member.role === 'moderator'
    )
      return;
    throw new ForbiddenException('No permission');
  }

  private async getOrCreateLeague(
    tx: any,
    sportId: string,
    leagueName?: string,
  ) {
    if (!leagueName || !leagueName.trim()) return null;

    const name = leagueName.trim();

    const existing = await tx.league.findFirst({
      where: { sportId, name },
    });

    if (existing) return existing;

    return tx.league.create({
      data: {
        sportId,
        name,
        logoUrl: null,
      },
    });
  }

  private async getOrCreateCompetitor(
    tx: any,
    sportId: string,
    nameRaw: string,
    typeRaw?: string,
    logoUrl?: string,
  ) {
    const name = nameRaw.trim();
    const type = (typeRaw === 'player' ? 'player' : 'team') as any;

    const existing = await tx.competitor.findFirst({
      where: {
        sportId,
        name,
        type,
      },
    });

    if (existing) {
      if (logoUrl && !existing.logoUrl) {
        return tx.competitor.update({
          where: { id: existing.id },
          data: { logoUrl },
        });
      }
      return existing;
    }

    return tx.competitor.create({
      data: {
        sportId,
        name,
        type,
        logoUrl: logoUrl ?? null,
      },
    });
  }

  private shouldSkipLogoFetch(competitorId: string) {
    const until = this.missUntil.get(competitorId);
    if (!until) return false;
    return Date.now() < until;
  }

  private markLogoMiss(competitorId: string) {
    this.missUntil.set(competitorId, Date.now() + 24 * 60 * 60 * 1000);
  }

  private shouldSkipLeagueLogoFetch(leagueId: string) {
    const until = this.leagueMissUntil.get(leagueId);
    if (!until) return false;
    return Date.now() < until;
  }

  private markLeagueLogoMiss(leagueId: string) {
    this.leagueMissUntil.set(leagueId, Date.now() + 24 * 60 * 60 * 1000);
  }

  private async getSportSlug(sportId: string): Promise<string> {
    const cached = this.sportSlugCache.get(sportId);
    if (cached) return cached;

    const sport = await this.prisma.sport.findUnique({
      where: { id: sportId },
      select: { slug: true },
    });

    const slug = sport?.slug?.trim() ? sport.slug.trim() : 'sport';
    this.sportSlugCache.set(sportId, slug);
    return slug;
  }

  private async getSportName(sportId: string): Promise<string> {
    const cached = this.sportNameCache.get(sportId);
    if (cached) return cached;

    const sport = await this.prisma.sport.findUnique({
      where: { id: sportId },
      select: { name: true },
    });

    const name = sport?.name?.trim() ? sport.name.trim() : '';
    this.sportNameCache.set(sportId, name);
    return name;
  }

  private async ensureCompetitorLogo(c: CompetitorLite) {
    if (!c) return;
    if (this.inFlightLogo.has(c.id)) return;
    if (this.shouldSkipLogoFetch(c.id)) return;

    this.inFlightLogo.add(c.id);

    try {
      const fresh = await this.prisma.competitor.findUnique({
        where: { id: c.id },
        select: { id: true, name: true, logoUrl: true, sportId: true },
      });

      if (!fresh) return;

      const sportSlug = await this.getSportSlug(fresh.sportId);
      const leagueSlug = c.leagueName ? toSlug(c.leagueName) : 'unknown';
      const teamSlug = toSlug(fresh.name);
      const subdir = `${sportSlug}/${leagueSlug}`;

      const current = (fresh.logoUrl || '').trim();
      if (current && isLocalLogo(current)) return;

      if (current && isHttpUrl(current)) {
        const localized = await this.logoCache.getOrDownload(
          current,
          teamSlug,
          subdir,
        );
        if (localized && localized !== current && isLocalLogo(localized)) {
          await this.prisma.competitor.update({
            where: { id: fresh.id },
            data: { logoUrl: localized },
          });
        }
        return;
      }

      const name1 = (fresh.name || '').trim();
      const name2 = normalizeTeamName(name1);

      let badge: string | null = null;

      if (name1) badge = await this.tsdb.searchTeamBadge(name1);
      if (!badge && name2 && name2 !== name1)
        badge = await this.tsdb.searchTeamBadge(name2);

      if (!badge) {
        this.markLogoMiss(fresh.id);
        return;
      }

      const localized = await this.logoCache.getOrDownload(
        badge,
        teamSlug,
        subdir,
      );
      const nextLogo = localized && isLocalLogo(localized) ? localized : badge;

      await this.prisma.competitor.update({
        where: { id: fresh.id },
        data: { logoUrl: nextLogo },
      });
    } catch {
      return;
    } finally {
      this.inFlightLogo.delete(c.id);
    }
  }

  private async ensureLeagueLogo(l: LeagueLite) {
    if (!l) return;
    if (this.inFlightLeagueLogo.has(l.id)) return;
    if (this.shouldSkipLeagueLogoFetch(l.id)) return;

    this.inFlightLeagueLogo.add(l.id);

    try {
      const fresh = await this.prisma.league.findUnique({
        where: { id: l.id },
        select: { id: true, name: true, logoUrl: true, sportId: true },
      });

      if (!fresh) return;

      const current = (fresh.logoUrl || '').trim();
      if (current && isLocalLogo(current)) return;

      const sportSlug = await this.getSportSlug(fresh.sportId);
      const leagueSlug = toSlug(fresh.name);
      const subdir = `${sportSlug}/leagues`;

      if (current && isHttpUrl(current)) {
        const localized = await this.logoCache.getOrDownload(
          current,
          leagueSlug,
          subdir,
        );
        if (localized && localized !== current && isLocalLogo(localized)) {
          await this.prisma.league.update({
            where: { id: fresh.id },
            data: { logoUrl: localized },
          });
        }
        return;
      }

      const sportName = await this.getSportName(fresh.sportId);
      const badge = await this.tsdb.getLeagueBadgeByName(fresh.name, sportName);
      if (!badge) {
        this.markLeagueLogoMiss(fresh.id);
        return;
      }

      const localized = await this.logoCache.getOrDownload(
        badge,
        leagueSlug,
        subdir,
      );
      const nextLogo = localized && isLocalLogo(localized) ? localized : badge;

      await this.prisma.league.update({
        where: { id: fresh.id },
        data: { logoUrl: nextLogo },
      });
    } catch {
      return;
    } finally {
      this.inFlightLeagueLogo.delete(l.id);
    }
  }

  async create(slug: string, userId: string, dto: CreatePredictionDto) {
    const channel = await this.requireChannel(slug);
    const member = await this.requireMember(channel.id, userId);
    await this.requireEditor(member);

    const created = await this.prisma.$transaction(async (tx) => {
      const league = await this.getOrCreateLeague(
        tx,
        dto.sportId,
        dto.leagueName,
      );

      const competitorType = dto.competitorType ?? 'team';

      const home = await this.getOrCreateCompetitor(
        tx,
        dto.sportId,
        dto.homeName,
        competitorType,
        dto.homeLogoUrl,
      );

      const away = await this.getOrCreateCompetitor(
        tx,
        dto.sportId,
        dto.awayName,
        competitorType,
        dto.awayLogoUrl,
      );

      const event = await tx.event.create({
        data: {
          sportId: dto.sportId,
          leagueId: league ? league.id : null,
          homeCompetitorId: home.id,
          awayCompetitorId: away.id,
          startTime: new Date(dto.startTime),
        },
      });

      const prediction = await tx.prediction.create({
        data: {
          channelId: channel.id,
          authorId: userId,
          eventId: event.id,
          odds: dto.odds,
          stake: dto.stake,
          market: dto.market,
          selection: dto.selection,
          result: 'pending',
        },
      });

      await tx.channelStats.upsert({
        where: { channelId: channel.id },
        update: {
          totalPredictions: { increment: 1 },
        },
        create: {
          channelId: channel.id,
          totalPredictions: 1,
          wins: 0,
          losses: 0,
          voids: 0,
          totalStake: 0,
          totalProfit: 0,
          roi: 0,
          winRate: 0,
        },
      });

      const leagueName = dto.leagueName ? dto.leagueName : null;

      return {
        predictionId: prediction.id,
        league: league
          ? ({
            id: league.id,
            name: league.name,
            logoUrl: league.logoUrl ?? null,
            sportId: league.sportId,
          } as LeagueLite)
          : null,
        home: {
          id: home.id,
          name: home.name,
          logoUrl: home.logoUrl ?? null,
          sportId: dto.sportId,
          leagueName,
        } as CompetitorLite,
        away: {
          id: away.id,
          name: away.name,
          logoUrl: away.logoUrl ?? null,
          sportId: dto.sportId,
          leagueName,
        } as CompetitorLite,
      };
    });

    void this.ensureCompetitorLogo(created.home);
    void this.ensureCompetitorLogo(created.away);
    if (created.league) void this.ensureLeagueLogo(created.league);

    return this.prisma.prediction.findUnique({
      where: { id: created.predictionId },
      include: {
        event: {
          include: {
            league: true,
            sport: true,
            homeCompetitor: true,
            awayCompetitor: true,
          },
        },
        author: {
          select: { id: true, username: true, handle: true, avatarUrl: true },
        },
      },
    });
  }

  async list(slug: string, userId?: string, takeRaw?: number, skipRaw?: number) {
    const channel = await this.requireChannel(slug);

    if (channel.visibility === 'private') {
      if (!userId) throw new ForbiddenException('Private channel')
      await this.requireMember(channel.id, userId);
    }


    const take = Math.max(
      1,
      Math.min(
        Number.isFinite(takeRaw as number) ? (takeRaw as number) : 10,
        50,
      ),
    );
    const skip = Math.max(
      0,
      Number.isFinite(skipRaw as number) ? (skipRaw as number) : 0,
    );

    const [items, total] = await this.prisma.$transaction([
      this.prisma.prediction.findMany({
        where: { channelId: channel.id },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          event: {
            include: {
              league: true,
              sport: true,
              homeCompetitor: true,
              awayCompetitor: true,
            },
          },
          author: {
            select: { id: true, username: true, handle: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.prediction.count({ where: { channelId: channel.id } }),
    ]);

    const currentPage = Math.floor(skip / take) + 1;
    const totalPages = Math.max(1, Math.ceil(total / take));

    const normalizedCurrentPage = Math.min(currentPage, totalPages);

    const leagueSeen = new Set<string>();
    const competitorSeen = new Set<string>();

    for (const p of items as any[]) {
      const ev = p?.event;
      const league = ev?.league;

      const leagueName = league?.name ? String(league.name) : null;

      const home = ev?.homeCompetitor;
      const away = ev?.awayCompetitor;

      if (home?.id && !competitorSeen.has(home.id)) {
        competitorSeen.add(home.id);
        void this.ensureCompetitorLogo({
          id: home.id,
          name: home.name,
          logoUrl: home.logoUrl ?? null,
          sportId: home.sportId,
          leagueName,
        } as CompetitorLite);
      }

      if (away?.id && !competitorSeen.has(away.id)) {
        competitorSeen.add(away.id);
        void this.ensureCompetitorLogo({
          id: away.id,
          name: away.name,
          logoUrl: away.logoUrl ?? null,
          sportId: away.sportId,
          leagueName,
        } as CompetitorLite);
      }

      if (league?.id && !leagueSeen.has(league.id)) {
        leagueSeen.add(league.id);
        void this.ensureLeagueLogo({
          id: league.id,
          name: league.name,
          logoUrl: league.logoUrl ?? null,
          sportId: league.sportId,
        } as LeagueLite);
      }
    }

    return {
      items,
      pagination: {
        take,
        skip,
        total,
        totalPages,
        currentPage: normalizedCurrentPage,
      },
    };
  }

  async settle(
    predictionId: string,
    userId: string,
    result: PredictionResultDto,
  ) {
    const prediction = await this.prisma.prediction.findUnique({
      where: { id: predictionId },
      include: {
        channel: { select: { id: true, slug: true } },
      },
    });

    if (!prediction) throw new NotFoundException('Prediction not found');
    if (prediction.result !== 'pending')
      throw new ForbiddenException('Already settled');

    const member = await this.requireMember(prediction.channelId, userId);
    await this.requireEditor(member);

    const odds = prediction.odds;
    const stake = prediction.stake;

    let profit = 0;
    let bankrollDelta = 0;
    let logType: any = null;

    if (result === 'win') {
      profit = stake * (odds - 1);
      bankrollDelta = profit;
      logType = 'bet_win';
    } else if (result === 'loss') {
      profit = -stake;
      bankrollDelta = -stake;
      logType = 'bet_loss';
    } else {
      profit = 0;
      bankrollDelta = 0;
      logType = 'correction';
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPrediction = await tx.prediction.update({
        where: { id: predictionId },
        data: {
          result: result as any,
          settledAt: new Date(),
        },
      });

      if (bankrollDelta !== 0) {
        await tx.channel.update({
          where: { id: prediction.channelId },
          data: {
            currentBankroll: { increment: bankrollDelta },
          },
        });
      }

      await tx.channelBankrollLog.create({
        data: {
          channelId: prediction.channelId,
          amount: bankrollDelta,
          type: logType,
          note: `prediction:${predictionId}`,
        },
      });

      const stats = await tx.channelStats.upsert({
        where: { channelId: prediction.channelId },
        update: {},
        create: {
          channelId: prediction.channelId,
          totalPredictions: 0,
          wins: 0,
          losses: 0,
          voids: 0,
          totalStake: 0,
          totalProfit: 0,
          roi: 0,
          winRate: 0,
        },
      });

      const winsInc = result === 'win' ? 1 : 0;
      const lossesInc = result === 'loss' ? 1 : 0;
      const voidsInc = result === 'void' ? 1 : 0;

      const nextWins = stats.wins + winsInc;
      const nextLosses = stats.losses + lossesInc;
      const nextVoids = stats.voids + voidsInc;

      const nextStake = stats.totalStake + stake;
      const nextProfit = stats.totalProfit + profit;

      const denom = nextStake > 0 ? nextStake : 0;
      const nextRoi = denom > 0 ? (nextProfit / denom) * 100 : 0;

      const wl = nextWins + nextLosses;
      const nextWinRate = wl > 0 ? (nextWins / wl) * 100 : 0;

      await tx.channelStats.update({
        where: { channelId: prediction.channelId },
        data: {
          wins: nextWins,
          losses: nextLosses,
          voids: nextVoids,
          totalStake: nextStake,
          totalProfit: nextProfit,
          roi: nextRoi,
          winRate: nextWinRate,
        },
      });

      return updatedPrediction;
    });

    return updated;
  }

  async recalcChannelStats(slug: string, userId: string) {
    const channel = await this.requireChannel(slug);
    const member = await this.requireMember(channel.id, userId);
    await this.requireEditor(member);

    const preds = await this.prisma.prediction.findMany({
      where: { channelId: channel.id },
      select: {
        odds: true,
        stake: true,
        result: true,
      },
    });

    let totalPredictions = 0;
    let wins = 0;
    let losses = 0;
    let voids = 0;
    let totalStake = 0;
    let totalProfit = 0;
    let totalWinnings = 0;

    for (const p of preds) {
      totalPredictions += 1;

      if (p.result === 'win') {
        wins += 1;
        totalStake += p.stake;
        totalWinnings += p.stake * p.odds;
        totalProfit += p.stake * (p.odds - 1);
      } else if (p.result === 'loss') {
        losses += 1;
        totalStake += p.stake;
        totalProfit += -p.stake;
      } else if (p.result === 'void') {
        voids += 1;
        totalStake += p.stake;
        totalWinnings += p.stake;
      }
    }

    const roi = totalStake > 0 ? ((totalWinnings - totalStake) / totalStake) * 100 : 0;
    const wl = wins + losses;
    const winRate = wl > 0 ? (wins / wl) * 100 : 0;

    const updated = await this.prisma.channelStats.upsert({
      where: { channelId: channel.id },
      update: {
        totalPredictions,
        wins,
        losses,
        voids,
        totalStake,
        totalProfit,
        roi,
        winRate,
      },
      create: {
        channelId: channel.id,
        totalPredictions,
        wins,
        losses,
        voids,
        totalStake,
        totalProfit,
        roi,
        winRate,
      },
    });

    return updated;
  }
}
