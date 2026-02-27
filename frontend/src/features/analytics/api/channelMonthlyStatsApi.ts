import { http } from '@/shared/api/http';

export type ChannelMonthlyStatsItem = {
  monthStart: string;
  predictionsCount: number;
  profitPercent: number;
  roiPercent: number;
  drawdownPercent: number;
};

export type ChannelMonthlyStatsResponse = {
  updatedAt: string;
  items: ChannelMonthlyStatsItem[];
};

export async function fetchChannelMonthlyStats(slug: string): Promise<ChannelMonthlyStatsResponse> {
  const safeSlug = encodeURIComponent(slug);
  return http<ChannelMonthlyStatsResponse>(`/channels/${safeSlug}/analytics/monthly-stats`, {
    method: 'GET',
  });
}
