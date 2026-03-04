import type { OverviewPeriod, OverviewPoint } from '@/features/analytics/ui/ChannelOverviewCard/ChannelOverviewCard';
import { http } from '@/shared/api/http';

export type ChannelOverviewResponse = {
  period: OverviewPeriod;
  header: {
    leftHintValue: string;
    rightHintValue: string;
  };
  bottom: {
    valueText: string;
    valueSuffix: string;
  };
  lastUpdatedText: string;
  series: OverviewPoint[];
};

export async function fetchChannelOverview(params: {
  slug: string;
  period: OverviewPeriod;
}): Promise<ChannelOverviewResponse> {
  const { slug, period } = params;

  const safeSlug = encodeURIComponent(slug);
  const safePeriod = encodeURIComponent(period);

  // ВАЖНО: без "/api" — backend маппит "/channels/..."
  return http<ChannelOverviewResponse>(
    `/channels/${safeSlug}/analytics/overview?period=${safePeriod}`,
    { method: 'GET', token: null }
  );
}