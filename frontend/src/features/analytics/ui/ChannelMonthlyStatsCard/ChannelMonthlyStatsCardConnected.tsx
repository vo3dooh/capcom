import { useMemo, useState } from 'react';
import { useChannelMonthlyStats } from '@/features/analytics/model/useChannelMonthlyStats';
import styles from './ChannelMonthlyStatsCard.module.css';

const DEFAULT_MONTHS = 6;

function formatMonth(isoDate: string): string {
  const d = new Date(isoDate);
  const month = d.toLocaleString('ru-RU', { month: 'long' });
  const normalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const year = d.toLocaleString('ru-RU', { year: '2-digit' });
  return `${normalizedMonth} '${year}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function getValueTone(value: number): string {
  if (value > 0) return styles.valuePositive;
  if (value < 0) return styles.valueNegative;
  return styles.valueNeutral;
}

export function ChannelMonthlyStatsCardConnected({ slug }: { slug: string }) {
  const { isLoading, error, monthlyStats } = useChannelMonthlyStats(slug);
  const [showYear, setShowYear] = useState(false);

  const sortedRows = useMemo(() => {
    if (!monthlyStats?.items?.length) return [];
    return [...monthlyStats.items].reverse();
  }, [monthlyStats?.items]);

  const baseRows = sortedRows.slice(0, DEFAULT_MONTHS);
  const extraRows = sortedRows.slice(DEFAULT_MONTHS);

  return (
    <section className={styles.card}>
      <h3 className={styles.title}>Статистика по месяцам</h3>

      {sortedRows.length > 0 ? <div className={styles.headerRow}>Месяц · Кол-во · Просадка · ROI · Прибыль</div> : null}

      {isLoading && !monthlyStats ? <div className={styles.state}>Загрузка…</div> : null}
      {error ? <div className={styles.error}>{error}</div> : null}

      {sortedRows.length > 0 ? (
        <div className={styles.list}>
          {baseRows.map((row) => (
            <div className={styles.row} key={row.monthStart}>
              <div className={styles.month}>{formatMonth(row.monthStart)}</div>
              <div className={styles.metric}>{row.predictionsCount}</div>
              <div className={`${styles.metric} ${styles.valueNeutral}`}>{formatPercent(-row.drawdownPercent)}</div>
              <div className={`${styles.metric} ${getValueTone(row.roiPercent)}`}>{formatPercent(row.roiPercent)}</div>
              <div className={`${styles.metric} ${getValueTone(row.profitPercent)}`}>{formatPercent(row.profitPercent)}</div>
            </div>
          ))}

          {extraRows.length > 0 ? (
            <div className={`${styles.extraRows} ${showYear ? styles.extraRowsExpanded : ''}`}>
              <div className={styles.extraRowsInner}>
                {extraRows.map((row) => (
                  <div className={styles.row} key={row.monthStart}>
                    <div className={styles.month}>{formatMonth(row.monthStart)}</div>
                    <div className={styles.metric}>{row.predictionsCount}</div>
                    <div className={`${styles.metric} ${styles.valueNeutral}`}>{formatPercent(-row.drawdownPercent)}</div>
                    <div className={`${styles.metric} ${getValueTone(row.roiPercent)}`}>{formatPercent(row.roiPercent)}</div>
                    <div className={`${styles.metric} ${getValueTone(row.profitPercent)}`}>{formatPercent(row.profitPercent)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!isLoading && sortedRows.length === 0 ? (
        <div className={styles.state}>Данные за месяцы пока отсутствуют</div>
      ) : null}

      {monthlyStats && monthlyStats.items.length > DEFAULT_MONTHS ? (
        <button
          className={styles.toggleBtn}
          onClick={() => setShowYear((v) => !v)}
          type="button"
          aria-expanded={showYear}
        >
          {showYear ? 'Скрыть' : 'Показать за год'}
        </button>
      ) : null}
    </section>
  );
}
