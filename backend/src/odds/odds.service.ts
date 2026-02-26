import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  OddsEventOdds,
  OddsSport,
  UiEvent,
  UiEventOdds,
  UiMappedSport,
  UiSport,
} from './odds.types';

type CacheEntry = { at: number; value: any };

@Injectable()
export class OddsService {
  private cache = new Map<string, CacheEntry>();

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private baseUrl(): string {
    return (
      this.config.get<string>('ODDS_API_BASE') || 'https://api.the-odds-api.com'
    );
  }

  private apiKey(): string {
    const key = this.config.get<string>('ODDS_API_KEY');
    if (!key)
      throw new HttpException(
        'ODDS_API_KEY is not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return key;
  }

  private cacheGet<T>(key: string, ttlMs: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.at > ttlMs) return null;
    return entry.value as T;
  }

  private cacheSet(key: string, value: any) {
    this.cache.set(key, { at: Date.now(), value });
  }

  private async getJson<T>(
    url: string,
    cacheKey: string,
    ttlMs: number,
  ): Promise<T> {
    const cached = this.cacheGet<T>(cacheKey, ttlMs);
    if (cached) return cached;

    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      throw new HttpException(
        'Failed to reach Odds API',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

    if (!res.ok) {
      const msg =
        data && typeof data === 'object' && (data.message || data.error)
          ? String(data.message || data.error)
          : `Odds API HTTP ${res.status}`;
      throw new HttpException(msg, HttpStatus.BAD_GATEWAY);
    }

    this.cacheSet(cacheKey, data);
    return data as T;
  }

  async listSports(): Promise<UiSport[]> {
    const url = new URL('/v4/sports/', this.baseUrl());
    url.searchParams.set('apiKey', this.apiKey());

    const raw = await this.getJson<OddsSport[]>(
      url.toString(),
      `sports`,
      60_000,
    );
    return raw.map((s) => ({
      key: s.key,
      group: s.group,
      title: s.title,
      active: !!s.active,
    }));
  }

  async listSportsMapped(): Promise<UiMappedSport[]> {
    const sports = await this.listSports();

    const dbSports = await this.prisma.sport.findMany({
      select: { id: true, slug: true },
    });

    const map: Record<string, string> = {
      Soccer: 'football',
      Basketball: 'basketball',
      Tennis: 'tennis',
      'Ice Hockey': 'hockey',
      Baseball: 'baseball',
      'Mixed Martial Arts': 'mma',
      Boxing: 'boxing',
      Esports: 'esports',
    };

    function resolveSportId(group: string): string | null {
      const targetSlug = map[group];
      if (!targetSlug) return null;
      const found = dbSports.find((s) => s.slug === targetSlug);
      return found ? found.id : null;
    }

    return sports.map((s) => ({
      ...s,
      sportId: resolveSportId(s.group),
    }));
  }

  async listEvents(params: {
    sportKey: string;
    regions?: string;
    markets?: string;
    bookmakers?: string;
    oddsFormat?: string;
    dateFormat?: string;
  }): Promise<UiEvent[]> {
    const regions = params.regions || 'eu';
    const markets = params.markets || 'h2h';
    const oddsFormat = params.oddsFormat || 'decimal';
    const dateFormat = params.dateFormat || 'iso';

    const url = new URL(`/v4/sports/${params.sportKey}/odds`, this.baseUrl());
    url.searchParams.set('apiKey', this.apiKey());
    url.searchParams.set('regions', regions);
    url.searchParams.set('markets', markets);
    url.searchParams.set('oddsFormat', oddsFormat);
    url.searchParams.set('dateFormat', dateFormat);

    if (params.bookmakers)
      url.searchParams.set('bookmakers', params.bookmakers);

    const cacheKey = `events:${params.sportKey}:${regions}:${markets}:${params.bookmakers || ''}:${oddsFormat}:${dateFormat}`;
    const raw = await this.getJson<OddsEventOdds[]>(
      url.toString(),
      cacheKey,
      20_000,
    );

    return raw.map((e) => ({
      id: e.id,
      sportKey: e.sport_key,
      sportTitle: e.sport_title || e.sport_key,
      commenceTime: e.commence_time,
      home: e.home_team,
      away: e.away_team,
    }));
  }

  async getEventOdds(
    eventId: string,
    params: {
      sportKey: string;
      regions?: string;
      markets?: string;
      bookmakers?: string;
      oddsFormat?: string;
      dateFormat?: string;
    },
  ): Promise<UiEventOdds> {
    const regions = params.regions || 'eu';
    const markets = params.markets || 'h2h,spreads,totals';
    const oddsFormat = params.oddsFormat || 'decimal';
    const dateFormat = params.dateFormat || 'iso';

    const url = new URL(
      `/v4/sports/${params.sportKey}/events/${eventId}/odds`,
      this.baseUrl(),
    );
    url.searchParams.set('apiKey', this.apiKey());
    url.searchParams.set('regions', regions);
    url.searchParams.set('markets', markets);
    url.searchParams.set('oddsFormat', oddsFormat);
    url.searchParams.set('dateFormat', dateFormat);

    if (params.bookmakers)
      url.searchParams.set('bookmakers', params.bookmakers);

    const cacheKey = `eventOdds:${params.sportKey}:${eventId}:${regions}:${markets}:${params.bookmakers || ''}:${oddsFormat}:${dateFormat}`;
    const raw = await this.getJson<OddsEventOdds>(
      url.toString(),
      cacheKey,
      10_000,
    );

    return {
      id: raw.id,
      sportKey: raw.sport_key,
      sportTitle: raw.sport_title || raw.sport_key,
      commenceTime: raw.commence_time,
      home: raw.home_team,
      away: raw.away_team,
      bookmakers: (raw.bookmakers || []).map((b) => ({
        key: b.key,
        title: b.title,
        lastUpdate: b.last_update,
        markets: (b.markets || []).map((m) => ({
          key: m.key,
          outcomes: (m.outcomes || []).map((o) => ({
            name: o.name,
            price: o.price,
            point: typeof o.point === 'number' ? o.point : null,
          })),
        })),
      })),
    };
  }
}
