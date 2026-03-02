import { http } from '@/shared/api/http';

export type ChannelStatsResponse = {
  startingBankroll: number;
  totalPredictions: number;
  turnoverPercent: number;
  activeDays30d: number;
  deltaPredictions30d: number;
  deltaTurnoverPercent30d: number;
  totalStake: number;
  outcomes: {
    wins: number;
    losses: number;
    voids: number;
  };
  hitRatePercent: number;
  averageStakePercent: number;
  totalProfit: number;
  roiPercent: number;
  maxDrawdown: number;
  currentStreak: {
    type: 'win' | 'loss' | 'none';
    count: number;
  };
  averageOdds: number;
  averageStakePercentLast50: number;
  averageOddsLast50: number;
  averageStakePercentBeforeLast50: number;
  averageOddsBeforeLast50: number;
  volatility: number;
  winRateBeforeLast100: number;
};

export async function fetchChannelStats(slug: string): Promise<ChannelStatsResponse> {
  const safeSlug = encodeURIComponent(slug);
  return http<ChannelStatsResponse>(`/channels/${safeSlug}/analytics/stats`, { method: 'GET' });
}
