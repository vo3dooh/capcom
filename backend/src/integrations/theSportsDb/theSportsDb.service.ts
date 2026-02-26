import { Injectable, Logger } from '@nestjs/common';
import { LogoCacheService } from '../../shared/files/logo-cache.service';

type TsdbSearchTeamsResponse = {
  teams: null | Array<{
    strTeam?: string | null;
    strBadge?: string | null;
    strTeamBadge?: string | null;
    strLogo?: string | null;
  }>;
};

type TsdbAllLeaguesResponse = {
  leagues: null | Array<{
    idLeague?: string | null;
    strLeague?: string | null;
    strSport?: string | null;
    strLeagueAlternate?: string | null;
  }>;
};

type TsdbLookupLeagueResponse = {
  leagues: null | Array<{
    idLeague?: string | null;
    strLeague?: string | null;
    strBadge?: string | null;
    strLogo?: string | null;
    strPoster?: string | null;
  }>;
};

function norm(input: string) {
  return (input || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function cleanLeagueName(input: string) {
  let s = (input || '').trim();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/\bpreseason\b/gi, ' ');
  s = s.replace(/\bqualifiers?\b/gi, ' ');
  s = s.replace(/\bqualification\b/gi, ' ');
  s = s.replace(/\bqualifying\b/gi, ' ');
  s = s.replace(/\bplayoffs?\b/gi, ' ');
  s = s.replace(/\bwomen'?s\b/gi, ' ');
  s = s.replace(/\bwomen\b/gi, ' ');
  s = s.replace(/\bmen'?s\b/gi, ' ');
  s = s.replace(/\bmen\b/gi, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

@Injectable()
export class TheSportsDbService {
  private readonly logger = new Logger(TheSportsDbService.name);
  private readonly baseUrl = 'https://www.thesportsdb.com/api/v1/json';
  private readonly apiKey = process.env.TSDB_API_KEY || '1';

  private leaguesCache: {
    at: number;
    leagues: Array<{
      idLeague: string;
      strLeague: string;
      strSport: string;
      strLeagueAlternate: string;
    }>;
  } | null = null;

  private readonly leagueAliases = new Map<string, string>([
    ['nba', 'nba'],
    ['mlb', 'major league baseball'],
    ['nfl', 'national football league'],
    ['nhl', 'national hockey league'],
    ['epl', 'english premier league'],
    ['premier league', 'english premier league'],
  ]);

  constructor(private logoCacheService: LogoCacheService) {}

  async searchTeamBadge(teamName: string): Promise<string | null> {
    const q = (teamName || '').trim();
    if (!q) return null;

    const url = `${this.baseUrl}/${this.apiKey}/searchteams.php?t=${encodeURIComponent(q)}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    const data = (await res.json()) as TsdbSearchTeamsResponse;
    const team = data.teams?.[0];
    if (!team) return null;

    const badge = team.strBadge || team.strTeamBadge || team.strLogo || null;
    const value = typeof badge === 'string' ? badge.trim() : '';
    return value ? value : null;
  }

  async resolveLeagueIdByName(
    leagueName: string,
    sportName?: string | null,
  ): Promise<{ idLeague: string; strSport: string } | null> {
    this.logger.log(`Ищем лигу по имени: ${leagueName}`);

    const rawName = (leagueName || '').trim();
    if (!rawName) return null;

    const cleaned = cleanLeagueName(rawName);
    this.logger.log(`Очистили имя лиги: ${cleaned}`);

    const leagues = await this.getAllLeagues();
    this.logger.log(`Найдено ${leagues.length} лиг.`);

    const sportFilter = sportName ? norm(sportName) : '';

    const eq = (a: string, b: string) => {
      const x = norm(a);
      const y = norm(b);
      return Boolean(x && y && x === y);
    };

    const c1 = rawName;
    const c2 = cleaned;
    const a1 = this.leagueAliases.get(norm(c1)) || '';
    const a2 = this.leagueAliases.get(norm(c2)) || '';

    const candidates = [c1, c2, a1, a2]
      .map((x) => (x || '').trim())
      .filter(Boolean);

    const findStrict = (nameToFind: string, sport: string) => {
      const w = norm(nameToFind);
      if (!w) return null;

      const found = leagues.find((l) => {
        const sportOk = sport ? norm(l.strSport) === sport : true;
        if (!sportOk) return false;

        const primary = norm(l.strLeague);
        const alt = norm(l.strLeagueAlternate);

        return primary === w || alt === w;
      });

      return found
        ? { idLeague: found.idLeague, strSport: found.strSport }
        : null;
    };

    const findLoose = (nameToFind: string, sport: string) => {
      const w = norm(nameToFind);
      if (!w) return null;

      const found = leagues.find((l) => {
        const sportOk = sport ? norm(l.strSport) === sport : true;
        if (!sportOk) return false;

        const primary = l.strLeague || '';
        const alt = l.strLeagueAlternate || '';

        return eq(primary, w) || eq(alt, w);
      });

      return found
        ? { idLeague: found.idLeague, strSport: found.strSport }
        : null;
    };

    for (const nameToFind of candidates) {
      const id1 = sportFilter ? findStrict(nameToFind, sportFilter) : null;
      if (id1) return id1;

      const id2 = sportFilter ? findLoose(nameToFind, sportFilter) : null;
      if (id2) return id2;
    }

    for (const nameToFind of candidates) {
      const id1 = findStrict(nameToFind, '');
      if (id1) return id1;

      const id2 = findLoose(nameToFind, '');
      if (id2) return id2;
    }

    return null;
  }

  async getLeagueBadgeByName(
    leagueName: string,
    sportName?: string | null,
  ): Promise<string | null> {
    this.logger.log(`Запрос на логотип лиги: ${leagueName}`);

    const resolved = await this.resolveLeagueIdByName(leagueName, sportName);
    if (!resolved?.idLeague) {
      this.logger.warn(`Лига не найдена: ${leagueName}`);
      return null;
    }

    const badge = await this.lookupLeagueBadgeById(resolved.idLeague);

    if (!badge) {
      this.logger.warn(`Логотип для лиги ${leagueName} не найден`);
      return null;
    }

    this.logger.log(`Логотип для лиги ${leagueName} найден: ${badge}`);

    // Скачиваем логотип, используя сервис кэширования
    const savedLogo = await this.logoCacheService.getOrDownload(
      badge,
      resolved.idLeague,
    );

    if (!savedLogo) {
      this.logger.warn(`Не удалось скачать логотип для лиги ${leagueName}`);
      return null;
    }

    this.logger.log(
      `Логотип лиги ${leagueName} успешно сохранен: ${savedLogo}`,
    );
    return savedLogo;
  }

  private async getAllLeagues(): Promise<
    Array<{
      idLeague: string;
      strLeague: string;
      strSport: string;
      strLeagueAlternate: string;
    }>
  > {
    const now = Date.now();
    const ttl = 6 * 60 * 60 * 1000;

    if (this.leaguesCache && now - this.leaguesCache.at < ttl) {
      return this.leaguesCache.leagues;
    }

    const url = `${this.baseUrl}/${this.apiKey}/all_leagues.php`;
    const res = await fetch(url);

    if (!res.ok) {
      this.leaguesCache = { at: now, leagues: [] };
      return [];
    }

    const data = (await res.json()) as TsdbAllLeaguesResponse;
    const raw = Array.isArray(data.leagues) ? data.leagues : [];

    const mapped = raw
      .map((x) => {
        const idLeague =
          typeof x.idLeague === 'string' ? x.idLeague.trim() : '';
        const strLeague =
          typeof x.strLeague === 'string' ? x.strLeague.trim() : '';
        const strSport =
          typeof x.strSport === 'string' ? x.strSport.trim() : '';
        const strLeagueAlternate =
          typeof x.strLeagueAlternate === 'string'
            ? x.strLeagueAlternate.trim()
            : '';
        return { idLeague, strLeague, strSport, strLeagueAlternate };
      })
      .filter((x) => x.idLeague && x.strLeague && x.strSport);

    this.leaguesCache = { at: now, leagues: mapped };
    return mapped;
  }

  async lookupLeagueBadgeById(idLeague: string): Promise<string | null> {
    const id = (idLeague || '').trim();
    if (!id) return null;

    const url = `${this.baseUrl}/${this.apiKey}/lookupleague.php?id=${encodeURIComponent(id)}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    const data = (await res.json()) as TsdbLookupLeagueResponse;
    const league = data.leagues?.[0];
    if (!league) return null;

    const badge = league.strBadge || league.strLogo || league.strPoster || null;
    const value = typeof badge === 'string' ? badge.trim() : '';
    return value ? value : null;
  }
}
