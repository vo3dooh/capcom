import "dotenv/config";
import { PrismaClient, PredictionStatus, BankrollChangeType, CompetitorType } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./dev.db";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url }),
});

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

function addDaysUtc(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMonthsUtc(d: Date, months: number): Date {
  const x = new Date(d.getTime());
  x.setUTCMonth(x.getUTCMonth() + months);
  return x;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

function calcProfit(result: PredictionStatus, stake: number, odds: number): number {
  if (result === PredictionStatus.win) return round2(stake * (odds - 1));
  if (result === PredictionStatus.loss) return round2(-stake);
  return 0;
}

function parseArg(name: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : "";
}

async function recomputeChannelStatsAndBankroll(channelId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { startingBankroll: true },
  });

  if (!channel) return;

  const preds = await prisma.prediction.findMany({
    where: {
      channelId,
      result: { in: [PredictionStatus.win, PredictionStatus.loss, PredictionStatus.void] },
    },
    select: {
      result: true,
      stake: true,
      odds: true,
    },
  });

  let wins = 0;
  let losses = 0;
  let voids = 0;
  let totalStake = 0;
  let totalProfit = 0;

  for (const p of preds) {
    totalStake += p.stake;

    if (p.result === PredictionStatus.win) wins += 1;
    if (p.result === PredictionStatus.loss) losses += 1;
    if (p.result === PredictionStatus.void) voids += 1;

    totalProfit += calcProfit(p.result, p.stake, p.odds);
  }

  totalStake = round2(totalStake);
  totalProfit = round2(totalProfit);

  const roi = totalStake > 0 ? round2((totalProfit / totalStake) * 100) : 0;
  const winRate = wins + losses > 0 ? round2((wins / (wins + losses)) * 100) : 0;

  await prisma.channelStats.upsert({
    where: { channelId },
    update: {
      totalPredictions: preds.length,
      wins,
      losses,
      voids,
      totalStake,
      totalProfit,
      roi,
      winRate,
    },
    create: {
      channelId,
      totalPredictions: preds.length,
      wins,
      losses,
      voids,
      totalStake,
      totalProfit,
      roi,
      winRate,
    },
  });

  const base = channel.startingBankroll ?? 1000;
  const nextBankroll = round2(base + totalProfit);

  await prisma.channel.update({
    where: { id: channelId },
    data: { currentBankroll: nextBankroll },
  });
}

function buildEvenlySpacedDatesUtc(params: { start: Date; end: Date; count: number }): Date[] {
  const { start, end, count } = params;
  const out: Date[] = [];
  if (count <= 0) return out;
  if (count === 1) return [start];

  const spanMs = Math.max(1, end.getTime() - start.getTime());
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    out.push(new Date(start.getTime() + Math.floor(spanMs * t)));
  }
  return out;
}

async function ensureBaseEntities() {
  const sports = [
    { slug: "football", name: "Football" },
    { slug: "basketball", name: "Basketball" },
    { slug: "tennis", name: "Tennis" },
    { slug: "hockey", name: "Hockey" },
    { slug: "baseball", name: "Baseball" },
    { slug: "mma", name: "MMA" },
    { slug: "boxing", name: "Boxing" },
    { slug: "esports", name: "Esports" },
  ];

  for (const s of sports) {
    await prisma.sport.upsert({
      where: { slug: s.slug },
      update: { name: s.name },
      create: { slug: s.slug, name: s.name },
    });
  }

  const sport = await prisma.sport.findUnique({
    where: { slug: "football" },
    select: { id: true },
  });
  if (!sport) throw new Error('Sport "football" not found after seed');

  const league = await prisma.league.create({
    data: { name: "Seed League", sportId: sport.id },
    select: { id: true },
  });

  const home = await prisma.competitor.create({
    data: { name: "Home Team", type: CompetitorType.team, logoUrl: "", sportId: sport.id },
    select: { id: true },
  });

  const away = await prisma.competitor.create({
    data: { name: "Away Team", type: CompetitorType.team, logoUrl: "", sportId: sport.id },
    select: { id: true },
  });

  return { sportId: sport.id, leagueId: league.id, homeId: home.id, awayId: away.id };
}

async function seedChannelPredictions(params: { slug: string; count: number }) {
  const { slug, count } = params;

  const channel = await prisma.channel.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });

  if (!channel) throw new Error(`Channel not found: ${slug}`);

  const author = await prisma.user.findUnique({
    where: { id: channel.ownerId },
    select: { id: true },
  });

  if (!author) throw new Error("Channel owner user not found");

  const { sportId, leagueId, homeId, awayId } = await ensureBaseEntities();

  const start = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
  const today = startOfUtcDay(new Date());
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12, 0, 0));

  const daysSpan = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));

  const markets = ["h2h", "spreads", "totals"];
  const selections = ["Home", "Away", "Draw", "Over", "Under"];

  const outcomes: PredictionStatus[] = [
    PredictionStatus.win,
    PredictionStatus.win,
    PredictionStatus.win,
    PredictionStatus.loss,
    PredictionStatus.loss,
    PredictionStatus.void,
  ];

  const highOutcomes: PredictionStatus[] = [
    PredictionStatus.win,
    PredictionStatus.win,
    PredictionStatus.loss,
    PredictionStatus.void,
  ];

  const highStart = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
  const highEnd = new Date(Date.UTC(2026, 1, 28, 12, 0, 0));
  const highDates = buildEvenlySpacedDatesUtc({ start: highStart, end: highEnd, count: 26 });

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < count; i += 1) {
      const dayOffset = Math.floor((i / Math.max(1, count - 1)) * daysSpan);
      const createdAt = addDaysUtc(start, dayOffset);
      const settledAt = createdAt;

      const stake = round2(rand(5, 50));
      const odds = round2(rand(1.4, 3.2));
      const result = pick(outcomes);

      const event = await tx.event.create({
        data: {
          sportId,
          leagueId,
          homeCompetitorId: homeId,
          awayCompetitorId: awayId,
          startTime: createdAt,
        },
        select: { id: true },
      });

      await tx.prediction.create({
        data: {
          channelId: channel.id,
          authorId: author.id,
          eventId: event.id,
          odds,
          stake,
          market: pick(markets),
          selection: pick(selections),
          result,
          createdAt,
          settledAt,
        },
      });

      const profit = calcProfit(result, stake, odds);

      if (result === PredictionStatus.win || result === PredictionStatus.loss) {
        await tx.channelBankrollLog.create({
          data: {
            channelId: channel.id,
            amount: profit,
            type: result === PredictionStatus.win ? BankrollChangeType.bet_win : BankrollChangeType.bet_loss,
            note: "seed",
            createdAt: settledAt,
          },
        });
      }
    }

    for (let i = 0; i < highDates.length; i += 1) {
      const createdAt = highDates[i];
      const settledAt = createdAt;

      const stake = round2(rand(60, 150));
      const odds = round2(rand(3, 5));
      const result = pick(highOutcomes);

      const event = await tx.event.create({
        data: {
          sportId,
          leagueId,
          homeCompetitorId: homeId,
          awayCompetitorId: awayId,
          startTime: createdAt,
        },
        select: { id: true },
      });

      await tx.prediction.create({
        data: {
          channelId: channel.id,
          authorId: author.id,
          eventId: event.id,
          odds,
          stake,
          market: pick(markets),
          selection: pick(selections),
          result,
          createdAt,
          settledAt,
        },
      });

      const profit = calcProfit(result, stake, odds);

      if (result === PredictionStatus.win || result === PredictionStatus.loss) {
        await tx.channelBankrollLog.create({
          data: {
            channelId: channel.id,
            amount: profit,
            type: result === PredictionStatus.win ? BankrollChangeType.bet_win : BankrollChangeType.bet_loss,
            note: "seed",
            createdAt: settledAt,
          },
        });
      }
    }
  });

  await recomputeChannelStatsAndBankroll(channel.id);

  process.stdout.write(`Seeded ${count} predictions + 26 high-odds predictions (Jan-Feb 2026) for channel "${slug}".\n`);
}

async function seedChannelPredictionsCapcomUnprof(params: { slug: string; count: number }) {
  const { slug, count } = params;

  const channel = await prisma.channel.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });

  if (!channel) throw new Error(`Channel not found: ${slug}`);

  const author = await prisma.user.findUnique({
    where: { id: channel.ownerId },
    select: { id: true },
  });

  if (!author) throw new Error("Channel owner user not found");

  const { sportId, leagueId, homeId, awayId } = await ensureBaseEntities();

  const markets = ["h2h", "spreads", "totals"];
  const selections = ["Home", "Away", "Draw", "Over", "Under"];

  const nowDay = startOfUtcDay(new Date());
  const end = new Date(Date.UTC(nowDay.getUTCFullYear(), nowDay.getUTCMonth(), nowDay.getUTCDate(), 12, 0, 0));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 12, 0, 0));
  const start6m = addMonthsUtc(start, -6);

  const dates = buildEvenlySpacedDatesUtc({ start: start6m, end, count });

  const baseBankroll = 1000;
  const minBankrollAllowed = 120;
  const hardGuardBankroll = 180;

  let bankroll = baseBankroll;
  let peak = baseBankroll;

  const pickBiasedOutcome = (): PredictionStatus => {
    const r = Math.random();
    if (r < 0.72) return PredictionStatus.loss;
    if (r < 0.95) return PredictionStatus.win;
    return PredictionStatus.void;
  };

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < dates.length; i += 1) {
      const createdAt = dates[i];
      const settledAt = createdAt;

      const isNearEnd = i > Math.floor(dates.length * 0.75);

      let stake = round2(rand(12, isNearEnd ? 28 : 35));
      let odds = round2(rand(1.55, 2.25));
      let result = pickBiasedOutcome();

      if (bankroll <= hardGuardBankroll) {
        result = PredictionStatus.win;
        odds = round2(rand(1.7, 2.4));
        stake = round2(Math.min(35, Math.max(12, rand(18, 32))));
      }

      const projected = round2(bankroll + calcProfit(result, stake, odds));
      if (projected < minBankrollAllowed) {
        result = PredictionStatus.win;
        odds = round2(rand(1.8, 2.6));
        stake = round2(Math.min(30, Math.max(10, rand(16, 26))));
      }

      const event = await tx.event.create({
        data: {
          sportId,
          leagueId,
          homeCompetitorId: homeId,
          awayCompetitorId: awayId,
          startTime: createdAt,
        },
        select: { id: true },
      });

      await tx.prediction.create({
        data: {
          channelId: channel.id,
          authorId: author.id,
          eventId: event.id,
          odds,
          stake,
          market: pick(markets),
          selection: pick(selections),
          result,
          createdAt,
          settledAt,
        },
      });

      const profit = calcProfit(result, stake, odds);

      if (result === PredictionStatus.win || result === PredictionStatus.loss) {
        await tx.channelBankrollLog.create({
          data: {
            channelId: channel.id,
            amount: profit,
            type: result === PredictionStatus.win ? BankrollChangeType.bet_win : BankrollChangeType.bet_loss,
            note: "seed_unprof_6m",
            createdAt: settledAt,
          },
        });
      }

      bankroll = round2(bankroll + profit);
      if (bankroll > peak) peak = bankroll;
    }
  });

  await recomputeChannelStatsAndBankroll(channel.id);

  process.stdout.write(
    `Seeded ${count} predictions for last 6 months (unprofitable, DD < 100%) for channel "${slug}".\n`,
  );
}

async function main() {
  const slug = parseArg("slug") || "capcom";
  const countStr = parseArg("count");
  const count = countStr ? Math.max(1, Math.min(2000, Number(countStr))) : 180;

  if (slug === "capcomunprof") {
    await seedChannelPredictionsCapcomUnprof({ slug, count });
    return;
  }

  await seedChannelPredictions({ slug, count });
}

main()
  .catch((e) => {
    process.stderr.write(String(e?.message || e));
    process.stderr.write("\n");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });