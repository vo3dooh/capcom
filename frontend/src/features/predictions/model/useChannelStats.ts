import { useEffect, useState } from 'react';
import { HttpError } from '@/shared/api/http';
import { fetchChannelStats, type ChannelStatsResponse } from '../api/channelStatsApi';
import { calculatePlannedProfitStats } from './plannedProfit';

export function useChannelStats(slug: string) {
  const [stats, setStats] = useState<ChannelStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchChannelStats(slug)
      .then((res) => {
        if (cancelled) return;
        setStats(res);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof HttpError) setError(e.message);
        else setError('Не удалось загрузить статистику канала');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const plannedProfitStats = stats ? calculatePlannedProfitStats(stats) : null;

  return { stats, plannedProfitStats, loading, error };
}
