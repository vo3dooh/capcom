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

export function ChannelMonthlyStatsCardConnected({ slug }: { slug: string }) {
  const { isLoading, error, monthlyStats } = useChannelMonthlyStats(slug);
  const [showYear, setShowYear] = useState(false);

  const rows = useMemo(() => {
    if (!monthlyStats?.items?.length) return [];
    const copy = [...monthlyStats.items].reverse();
    return showYear ? copy : copy.slice(0, DEFAULT_MONTHS);
  }, [monthlyStats?.items, showYear]);

  return (
    <section className={styles.card}>
      <h3 className={styles.title}>Статистика по месяцам</h3>

      {isLoading && !monthlyStats ? <div className={styles.state}>Загрузка…</div> : null}
      {error ? <div className={styles.error}>{error}</div> : null}

      {rows.length > 0 ? (
        <div className={styles.list}>
          {rows.map((row) => (
            <div className={styles.row} key={row.monthStart}>
              <div className={styles.month}>{formatMonth(row.monthStart)}</div>
              <div className={styles.metric}>Прогнозов: {row.predictionsCount}</div>
              <div className={styles.metric}>Прибыль: {formatPercent(row.profitPercent)}</div>
              <div className={styles.metric}>Просадка: {formatPercent(-row.drawdownPercent)}</div>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && rows.length === 0 ? <div className={styles.state}>Данные за месяцы пока отсутствуют</div> : null}

      {monthlyStats && monthlyStats.items.length > DEFAULT_MONTHS ? (
        <button className={styles.toggleBtn} onClick={() => setShowYear((v) => !v)} type="button">
          {showYear ? 'Скрыть' : 'Показать за год'}
        </button>
      ) : null}
    </section>
  );
}
