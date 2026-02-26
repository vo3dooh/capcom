import { useEffect, useMemo, useState } from 'react';
import type { OverviewPeriod } from '@/features/analytics/ui/ChannelOverviewCard/ChannelOverviewCard';
import { fetchChannelOverview, type ChannelOverviewResponse } from '@/features/analytics/api/channelOverviewApi';

type State = {
  isLoading: boolean;
  error: string | null;
  data: ChannelOverviewResponse | null;
};

export function useChannelOverview(params: { slug: string; period: OverviewPeriod }) {
  const { slug, period } = params;

  const [state, setState] = useState<State>({
    isLoading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let alive = true;

    setState((s) => ({
      ...s,
      isLoading: true,
      error: null,
    }));

    fetchChannelOverview({ slug, period })
      .then((data) => {
        if (!alive) return;
        setState({
          isLoading: false,
          error: null,
          data,
        });
      })
      .catch((e: unknown) => {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : 'Failed to load overview';
        setState({
          isLoading: false,
          error: msg,
          data: null,
        });
      });

    return () => {
      alive = false;
    };
  }, [slug, period]);

  const view = useMemo(() => {
    return {
      isLoading: state.isLoading,
      error: state.error,
      overview: state.data,
    };
  }, [state.data, state.error, state.isLoading]);

  return view;
}