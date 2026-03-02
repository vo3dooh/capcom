import type { ChannelStatsResponse } from '../api/channelStatsApi';

export type PlannedProfitStats = {
  plannedProfitPercent: number;
  modifier: number;
  kMonths: number;
  kEvents: number;
  kRisk: number;
};

function resolveMonthsModifier(closedMonthsCount: number): number {
  if (closedMonthsCount <= 0) return 0;
  if (closedMonthsCount === 1) return 0.05;
  if (closedMonthsCount === 2) return 0.1;
  if (closedMonthsCount === 3) return 0.15;
  if (closedMonthsCount === 4) return 0.3;
  if (closedMonthsCount === 5) return 0.45;
  if (closedMonthsCount === 6) return 0.6;
  if (closedMonthsCount === 7) return 0.75;
  if (closedMonthsCount === 8) return 0.9;
  if (closedMonthsCount === 9) return 1;
  return 1.1;
}

function resolveEventsModifier(eventsCount: number): number {
  if (eventsCount < 100) return 0.1;
  if (eventsCount < 200) return 0.2;
  if (eventsCount < 300) return 0.3;
  if (eventsCount < 400) return 0.4;
  if (eventsCount < 500) return 0.5;
  if (eventsCount < 600) return 0.6;
  if (eventsCount < 700) return 0.7;
  if (eventsCount < 800) return 0.8;
  if (eventsCount < 900) return 0.9;
  if (eventsCount < 1000) return 1;
  if (eventsCount < 2000) return 1.1;
  if (eventsCount < 3000) return 1.2;
  if (eventsCount < 4000) return 1.3;
  if (eventsCount < 5000) return 1.4;
  return 1.5;
}

function resolveRiskModifier(drawdownPercent: number): number {
  if (drawdownPercent <= 15) return 1.2;
  if (drawdownPercent <= 25) return 1.1;
  if (drawdownPercent <= 40) return 1;
  if (drawdownPercent <= 55) return 0.9;
  if (drawdownPercent <= 70) return 0.8;
  if (drawdownPercent <= 85) return 0.65;
  return 0.5;
}

export function calculatePlannedProfitStats(stats: ChannelStatsResponse): PlannedProfitStats {
  const kMonths = resolveMonthsModifier(stats.closedMonthsCount);
  const kEvents = resolveEventsModifier(stats.totalPredictions12Closed);
  const kRisk = resolveRiskModifier(stats.maxDrawdownPercent12Closed);
  const modifier = kMonths * kEvents * kRisk;
  const baseProfit = stats.closedMonthsCount > 0 ? stats.profit12ClosedPercent / stats.closedMonthsCount : 0;
  const plannedProfitPercent = baseProfit * modifier;

  return {
    plannedProfitPercent,
    modifier,
    kMonths,
    kEvents,
    kRisk,
  };
}
