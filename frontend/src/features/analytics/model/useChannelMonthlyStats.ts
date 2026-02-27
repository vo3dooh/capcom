import { useEffect, useMemo, useState } from 'react';
import {
  fetchChannelMonthlyStats,
  type ChannelMonthlyStatsResponse,
} from '@/features/analytics/api/channelMonthlyStatsApi';

type State = {
  isLoading: boolean;
  error: string | null;
  data: ChannelMonthlyStatsResponse | null;
};

const REFRESH_INTERVAL_MS = 60_000;

export function useChannelMonthlyStats(slug: string) {
  const [state, setState] = useState<State>({
    isLoading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let alive = true;

    async function load(isInitial: boolean) {
      if (isInitial) {
        setState((s) => ({ ...s, isLoading: true, error: null }));
      }

      try {
        const data = await fetchChannelMonthlyStats(slug);
        if (!alive) return;
        setState({ isLoading: false, error: null, data });
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : 'Failed to load monthly stats';
        setState((prev) => ({
          isLoading: false,
          error: msg,
          data: prev.data,
        }));
      }
    }

    void load(true);
    const timer = window.setInterval(() => {
      void load(false);
    }, REFRESH_INTERVAL_MS);

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [slug]);

  return useMemo(
    () => ({
      isLoading: state.isLoading,
      error: state.error,
      monthlyStats: state.data,
    }),
    [state.data, state.error, state.isLoading]
  );
}
