import React, { useMemo, useState } from 'react';
import type { OverviewPeriod } from './ChannelOverviewCard';
import { ChannelOverviewCard } from './ChannelOverviewCard';
import { useChannelOverview } from '@/features/analytics/model/useChannelOverview';
import './ChannelOverviewCard.css';

type Props = {
    slug: string;
};

export function ChannelOverviewCardConnected(props: Props) {
    const { slug } = props;

    const [period, setPeriod] = useState<OverviewPeriod>('month');
    const { isLoading, overview } = useChannelOverview({ slug, period });

    const safe = useMemo(() => {
        if (!overview) {
            return {
                leftHintValue: '',
                rightHintValue: '',
                bottomValueText: '—',
                bottomValueSuffix: '',
                lastUpdatedText: '—',
                data: [],
            };
        }

        return {
            leftHintValue: overview.header.leftHintValue,
            rightHintValue: overview.header.rightHintValue,
            bottomValueText: overview.bottom.valueText,
            bottomValueSuffix: overview.bottom.valueSuffix,
            lastUpdatedText: overview.lastUpdatedText,
            data: overview.series,
        };
    }, [overview]);

    return (
        <ChannelOverviewCard
            title="Overview"
            leftHintLabel="Max records"
            leftHintValue={safe.leftHintValue}
            rightHintLabel="Comparative rates"
            rightHintValue={safe.rightHintValue}
            period={period}
            onPeriodChange={setPeriod}
            data={safe.data}
            bottomValueText={safe.bottomValueText}
            bottomValueSuffix={safe.bottomValueSuffix}
            lastUpdatedText={safe.lastUpdatedText}
            isLoading={isLoading}
        />
    );
}