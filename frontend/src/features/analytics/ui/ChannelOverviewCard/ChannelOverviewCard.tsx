import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import './ChannelOverviewCard.css';

export type OverviewPeriod = 'month' | 'all';

export type OverviewPoint = {
    ts: string;
    value: number;
};

type Props = {
    title?: string;

    leftHintLabel?: string;
    leftHintValue?: string;

    rightHintLabel?: string;
    rightHintValue?: string;

    period: OverviewPeriod;
    onPeriodChange: (p: OverviewPeriod) => void;

    data: OverviewPoint[];

    tooltipDateFormatter?: (ts: string) => string;
    valueFormatter?: (value: number) => string;
    deltaFormatter?: (delta: number) => string;

    bottomValueText: string;
    bottomValueSuffix?: string;

    lastUpdatedText: string;

    isLoading?: boolean;
};

type TooltipPayloadItem = {
    value?: number;
    payload?: { ts?: string; value?: number; x?: number };
};

type ChartPoint = {
    x: number;
    ts: string;
    value: number;
};

const RU_MONTHS_SHORT_CAP = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
];

function ruMonthShortCapUtc(d: Date): string {
    const m = d.getUTCMonth();
    return RU_MONTHS_SHORT_CAP[m] ?? '';
}

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

function normalizeIsoTs(ts: string): string {
    if (!ts) return '';
    return ts.endsWith('-s') ? ts.slice(0, -2) : ts;
}

function toUtcTimestamp(ts: string): number {
    const iso = normalizeIsoTs(ts);
    if (!iso) return NaN;
    const t = Date.parse(`${iso}T00:00:00Z`);
    return Number.isFinite(t) ? t : NaN;
}

function parseIsoToUtcDate(ts: string): Date | null {
    const iso = normalizeIsoTs(ts);
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

function defaultTooltipDate(ts: string): string {
    const d = parseIsoToUtcDate(ts);
    if (!d) return ts || '';
    const m = ruMonthShortCapUtc(d);
    const day = d.getUTCDate();
    return `${m} ${day}`;
}

function formatMoneyCompact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}b`;
    if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}m`;
    if (abs >= 10_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPercent(delta: number): string {
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(2)}%`;
}

function computeProfit(data: OverviewPoint[]): number | null {
    if (!data || data.length < 2) return null;
    const first = data[0]?.value;
    const last = data[data.length - 1]?.value;
    if (typeof first !== 'number' || typeof last !== 'number') return null;
    const p = last - first;
    return Number.isFinite(p) ? p : null;
}

function computeYAxisDomain(data: ChartPoint[]): [number, number] {
    if (!data || data.length === 0) return [0, 1];

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const p of data) {
        if (typeof p.value !== 'number') continue;
        if (p.value < min) min = p.value;
        if (p.value > max) max = p.value;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
    if (min === max) return [min - 1, max + 1];

    const range = max - min;
    const padTop = range * 0.12;
    return [min, max + padTop];
}

function pickEvenlyByIndex<T>(items: T[], maxCount: number): T[] {
    if (!items || items.length === 0) return [];
    if (items.length <= maxCount) return items;

    const lastIdx = items.length - 1;
    const res: T[] = [items[0]];

    const middleSlots = maxCount - 2;
    if (middleSlots <= 0) return [items[0], items[lastIdx]];

    for (let i = 1; i <= middleSlots; i += 1) {
        const idx = Math.round((i / (middleSlots + 1)) * lastIdx);
        const v = items[idx];
        if (v !== undefined && res[res.length - 1] !== v) res.push(v);
    }

    if (res[res.length - 1] !== items[lastIdx]) res.push(items[lastIdx]);
    return res;
}

function clampInt(n: number, min: number, max: number): number {
    const v = Math.floor(n);
    if (!Number.isFinite(v)) return min;
    return Math.max(min, Math.min(max, v));
}

function buildMonthStartTimestamps(minX: number, maxX: number): number[] {
    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || minX >= maxX) return [];

    const start = new Date(minX);
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(maxX);
    end.setUTCHours(0, 0, 0, 0);

    const res: number[] = [];
    const cur = new Date(start.getTime());

    while (cur.getTime() <= end.getTime()) {
        res.push(cur.getTime());
        cur.setUTCMonth(cur.getUTCMonth() + 1);
    }

    return res;
}

function formatAllPeriodLabel(tsX: number): string {
    const d = new Date(tsX);
    if (Number.isNaN(d.getTime())) return '';
    const m = ruMonthShortCapUtc(d);
    const y2 = String(d.getUTCFullYear()).slice(-2);
    return `${m} ${y2}`;
}

function formatMonthPeriodLabel(ts: string): string {
    const d = parseIsoToUtcDate(ts);
    if (!d) return ts || '';
    const m = ruMonthShortCapUtc(d);
    const day = d.getUTCDate();
    return `${m} ${day}`;
}

function formatLastUpdatedRu(text: string): string {
    const raw = (text || '').trim();
    if (!raw) return raw;

    const ms = Date.parse(raw);
    if (!Number.isFinite(ms)) return raw;

    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return raw;

    const day = d.getUTCDate();
    const m = ruMonthShortCapUtc(d);
    const hh = pad2(d.getUTCHours());
    const mm = pad2(d.getUTCMinutes());

    return `${m} ${day}, ${hh}:${mm} UTC`;
}

function useElementWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
    const ref = useRef<T>(null);
    const [w, setW] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            const width = cr?.width ?? 0;
            setW(width);
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return [ref, w];
}

function isPercentString(s: string): boolean {
    const v = (s || '').trim();
    if (!v) return false;
    return v.includes('%');
}

function isNegativeNumericText(s: string): boolean {
    const value = (s || '').trim();
    if (!value) return false;
    if (value.startsWith('-')) return true;

    const parsed = Number(value.replace(/[%$\s,]/g, ''));
    if (!Number.isFinite(parsed)) return false;
    return parsed < 0;
}

function PeriodControl(props: {
    value: OverviewPeriod;
    onChange: (p: OverviewPeriod) => void;
}) {
    const { value, onChange } = props;

    return (
        <div className="overviewCard__seg overviewCard__segTwo">
            <button
                type="button"
                className={value === 'month' ? 'overviewCard__segBtn overviewCard__segBtnActive' : 'overviewCard__segBtn'}
                onClick={() => onChange('month')}
            >
                Последние 30 дней
            </button>
            <button
                type="button"
                className={value === 'all' ? 'overviewCard__segBtn overviewCard__segBtnActive' : 'overviewCard__segBtn'}
                onClick={() => onChange('all')}
            >
                За все время
            </button>
        </div>
    );
}

function CustomTooltip(props: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    dateFormatter: (ts: string) => string;
    valueFormatter: (v: number) => string;
    deltaFormatter: (d: number) => string;
    series: ChartPoint[];
}) {
    const { active, payload, dateFormatter, valueFormatter, deltaFormatter, series } = props;

    if (!active || !payload || payload.length === 0) return null;

    const v = typeof payload[0]?.value === 'number' ? (payload[0].value as number) : null;
    const ts = payload[0]?.payload?.ts ?? '';
    if (v === null) return null;

    const idx = series.findIndex((p) => p.ts === ts);
    let delta: number | null = null;

    if (idx > 0) {
        const prev = series[idx - 1]?.value;
        if (typeof prev === 'number' && prev !== 0) {
            delta = ((v - prev) / Math.abs(prev)) * 100;
        }
    }

    const deltaText = delta === null ? '—' : deltaFormatter(delta);
    const deltaClass =
        delta === null
            ? 'overviewCard__ttDelta'
            : delta >= 0
                ? 'overviewCard__ttDelta overviewCard__ttDeltaPos'
                : 'overviewCard__ttDelta overviewCard__ttDeltaNeg';

    return (
        <div className="overviewCard__tt">
            <div className="overviewCard__ttDate">{dateFormatter(ts)}</div>
            <div className="overviewCard__ttValue">{valueFormatter(v)}</div>
            <div className={deltaClass}>{deltaText}</div>
        </div>
    );
}

export function ChannelOverviewCard(props: Props) {
    const {
        title,
        rightHintValue = '',
        period,
        onPeriodChange,
        data,
        tooltipDateFormatter = defaultTooltipDate,
        valueFormatter = formatMoneyCompact,
        deltaFormatter = formatPercent,
        bottomValueText,
        bottomValueSuffix = '',
        lastUpdatedText,
        isLoading = false,
    } = props;

    const resolvedTitle = useMemo(() => {
        const t = (title || '').trim();
        if (!t) return 'Показатели банкролла';
        if (t.toLowerCase() === 'overview') return 'Показатели банкролла';
        return t;
    }, [title]);

    const resolvedLastUpdatedText = useMemo(() => formatLastUpdatedRu(lastUpdatedText), [lastUpdatedText]);

    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        if (period !== 'all') onPeriodChange('all');
    }, [period, onPeriodChange]);

    const chartData = useMemo<ChartPoint[]>(() => {
        if (!data || data.length === 0) return [];
        const mapped = data
            .map((p) => {
                const x = toUtcTimestamp(p.ts);
                return {
                    x,
                    ts: p.ts,
                    value: p.value,
                };
            })
            .filter((p) => Number.isFinite(p.x) && typeof p.value === 'number');

        mapped.sort((a, b) => a.x - b.x);

        const deduped: ChartPoint[] = [];
        for (const p of mapped) {
            const last = deduped[deduped.length - 1];
            if (last && last.x === p.x) {
                deduped[deduped.length - 1] = p;
            } else {
                deduped.push(p);
            }
        }

        return deduped;
    }, [data]);

    const yDomain = useMemo(() => computeYAxisDomain(chartData), [chartData]);

    const profit = useMemo(() => computeProfit(data), [data]);
    const profitText = profit === null ? '—' : formatMoneyCompact(profit);
    const isNegativeProfit = profit !== null && profit < 0;
    const isNegativeKpi = isNegativeNumericText(bottomValueText);
    const chartStroke = isNegativeProfit ? '#dc2626' : '#2563eb';

    const showChart = !isLoading && chartData && chartData.length > 1;
    const isEmptyState = !showChart && !isLoading;

    const [measureRef, measureWidth] = useElementWidth<HTMLDivElement>();
    const pxPerLabel = 70;

    const xLabels = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];

        const maxLabels = clampInt(measureWidth / pxPerLabel, 5, 10);

        if (period === 'all') {
            const minX = chartData[0]?.x ?? NaN;
            const maxX = chartData[chartData.length - 1]?.x ?? NaN;
            const monthStarts = buildMonthStartTimestamps(minX, maxX);
            const picked = monthStarts.length <= maxLabels ? monthStarts : pickEvenlyByIndex(monthStarts, maxLabels);
            return picked.map((x) => ({ key: String(x), text: formatAllPeriodLabel(x) }));
        }

        const points = chartData.length <= maxLabels ? chartData : pickEvenlyByIndex(chartData, maxLabels);
        return points.map((p) => ({ key: p.ts, text: formatMonthPeriodLabel(p.ts) }));
    }, [chartData, period, measureWidth]);

    const profitValue = useMemo(() => {
        const v = (rightHintValue || '').trim();
        if (!v) return profitText;
        if (isPercentString(v)) return profitText;
        return v;
    }, [rightHintValue, profitText]);

    const chartWrapClassName = isEmptyState
        ? 'overviewCard__chartWrap overviewCard__chartWrapGlow overviewCard__chartWrap--empty'
        : isNegativeProfit
            ? 'overviewCard__chartWrap overviewCard__chartWrapGlow overviewCard__chartWrapGlow--neg'
            : 'overviewCard__chartWrap overviewCard__chartWrapGlow';

    const kpiSuffixClassName = isEmptyState
        ? 'overviewCard__kpiSuffix overviewCard__kpiSuffix--empty'
        : isNegativeKpi
            ? 'overviewCard__kpiSuffix overviewCard__kpiSuffix--neg'
            : 'overviewCard__kpiSuffix';

    return (
        <div className={isNegativeProfit ? 'overviewCard overviewCard--negProfit' : 'overviewCard'}>
            <div className="overviewCard__top">
                <div className="overviewCard__titleRow">
                    <div className="overviewCard__title">{resolvedTitle}</div>
                    <div className="overviewCard__icon" aria-hidden="true">i</div>
                </div>

                <div className="overviewCard__hints">
                    <div className="overviewCard__hint">
                        <div className="overviewCard__hintLabel">Прибыль</div>
                        <div className="overviewCard__hintValue">{profitValue}</div>
                    </div>

                    <div className="overviewCard__hintSep" />

                    <div className="overviewCard__hint overviewCard__hintRight">
                        <PeriodControl value={period} onChange={onPeriodChange} />
                    </div>
                </div>
            </div>

            <div className={chartWrapClassName}>
                <div className="overviewCard__chartClip">
                    {showChart ? (
                        <div className="overviewCard__chartStack">
                            <div ref={measureRef} className="overviewCard__chartArea">
                                <ResponsiveContainer width="100%" height={190}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                        <CartesianGrid stroke="#e8edf6" strokeDasharray="3 6" vertical={false} />

                                        <XAxis
                                            dataKey="x"
                                            type="number"
                                            domain={['dataMin', 'dataMax']}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={false}
                                            height={0}
                                        />

                                        <YAxis domain={yDomain} hide={true} />

                                        <Tooltip
                                            cursor={{ stroke: '#cfd8eb', strokeDasharray: '3 6' }}
                                            content={
                                                <CustomTooltip
                                                    dateFormatter={tooltipDateFormatter}
                                                    valueFormatter={valueFormatter}
                                                    deltaFormatter={deltaFormatter}
                                                    series={chartData}
                                                />
                                            }
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={chartStroke}
                                            strokeWidth={2}
                                            fill="transparent"
                                            isAnimationActive={true}
                                            animationDuration={700}
                                            animationEasing="ease-out"
                                            dot={false}
                                            activeDot={{ r: 5, strokeWidth: 2, stroke: chartStroke, fill: '#ffffff' }}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="overviewCard__xLabels" aria-hidden="true">
                                {xLabels.map((l) => (
                                    <div key={l.key} className="overviewCard__xLabel">
                                        {l.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="overviewCard__empty">
                            {isLoading ? 'Загрузка…' : 'Нет данных'}
                        </div>
                    )}
                </div>
            </div>

            <div className="overviewCard__bottom">
                <div className="overviewCard__kpi">
                    <div className="overviewCard__kpiValue">
                        {bottomValueText}
                        {bottomValueSuffix ? <span className={kpiSuffixClassName}>{bottomValueSuffix}</span> : null}
                    </div>
                </div>

                <div className="overviewCard__updated">
                    <div className="overviewCard__updatedLabel">Последнее обновление</div>
                    <div className="overviewCard__updatedValue">{resolvedLastUpdatedText}</div>
                </div>
            </div>
        </div>
    );
}
