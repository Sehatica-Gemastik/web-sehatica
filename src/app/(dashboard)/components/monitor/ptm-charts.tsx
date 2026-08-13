'use client';

import { useMemo, useState } from 'react';
import {
  ChartArea,
  ChartAreaChart,
  ChartCartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from '@/components/ui/chart';
import { DropdownSelect } from '@/components/ui/dropdown-menu';
import type { MonitorPatientDetail, PtmTrendPoint } from '@/lib/backend';

type Period = 'week' | 'month' | 'year';
type Metric = 'all' | 'overall' | 'diabetes' | 'hypertension' | 'heart_disease' | 'stroke';

const METRIC_OPTIONS: Array<{ id: Metric; label: string }> = [
  { id: 'all', label: 'Semua' },
  { id: 'overall', label: 'Overall' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'Hipertensi' },
  { id: 'heart_disease', label: 'Jantung' },
  { id: 'stroke', label: 'Stroke' },
];

const SERIES = {
  overall: { label: 'Overall', color: '#00A7B1', key: 'overallPct' as const },
  diabetes: { label: 'Diabetes', color: '#2563EB', key: 'diabetesPct' as const },
  hypertension: { label: 'Hipertensi', color: '#D97706', key: 'hypertensionPct' as const },
  heart_disease: { label: 'Jantung', color: '#DC2626', key: 'heartPct' as const },
  stroke: { label: 'Stroke', color: '#7C3AED', key: 'strokePct' as const },
};

const PERIODS: Array<{ id: Period; label: string; days: number }> = [
  { id: 'week', label: 'Minggu', days: 7 },
  { id: 'month', label: 'Bulan', days: 30 },
  { id: 'year', label: 'Tahun', days: 365 },
];

function formatAxisLabel(date: string, period: Period) {
  const d = new Date(`${date}T00:00:00`);
  if (period === 'year') {
    return d.toLocaleDateString('id-ID', { month: 'short' });
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatTooltipLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function downsample(points: PtmTrendPoint[], period: Period): PtmTrendPoint[] {
  if (period === 'year') {
    const buckets = new Map<string, PtmTrendPoint[]>();
    for (const point of points) {
      const key = point.date.slice(0, 7);
      const list = buckets.get(key) ?? [];
      list.push(point);
      buckets.set(key, list);
    }
    return Array.from(buckets.values()).map((bucket) => {
      const mid = bucket[Math.floor(bucket.length / 2)];
      const avg = (field: keyof PtmTrendPoint) =>
        Math.round((bucket.reduce((sum, item) => sum + Number(item[field]), 0) / bucket.length) * 100);
      return {
        date: mid.date,
        overall: avg('overall') / 100,
        diabetes: avg('diabetes') / 100,
        hypertension: avg('hypertension') / 100,
        heart_disease: avg('heart_disease') / 100,
        stroke: avg('stroke') / 100,
      };
    });
  }
  return points;
}

type ChartRow = {
  date: string;
  label: string;
  overallPct: number;
  diabetesPct: number;
  hypertensionPct: number;
  heartPct: number;
  strokePct: number;
};

type SingleMetric = Exclude<Metric, 'all'>;

function metricDataKey(metric: SingleMetric): keyof ChartRow {
  if (metric === 'heart_disease') return 'heartPct';
  if (metric === 'overall') return 'overallPct';
  return `${metric}Pct` as keyof ChartRow;
}

type PtmChartsProps = {
  detail: MonitorPatientDetail;
};

export function PtmCharts({ detail }: PtmChartsProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [metric, setMetric] = useState<Metric>('all');

  const chartData = useMemo(() => {
    const days = PERIODS.find((item) => item.id === period)?.days ?? 30;
    const sliced = detail.ptmTrend.slice(-days);
    const sampled = downsample(sliced, period);

    return sampled.map((point) => ({
      date: point.date,
      label: formatAxisLabel(point.date, period),
      overallPct: Math.round(point.overall * 100),
      diabetesPct: Math.round(point.diabetes * 100),
      hypertensionPct: Math.round(point.hypertension * 100),
      heartPct: Math.round(point.heart_disease * 100),
      strokePct: Math.round(point.stroke * 100),
    }));
  }, [detail.ptmTrend, period]);

  const badgeLabel = metric === 'all'
    ? 'Overall'
    : (METRIC_OPTIONS.find((item) => item.id === metric)?.label ?? 'Overall');

  const lastRow = chartData.at(-1);
  const badgeValue = metric === 'all'
    ? lastRow?.overallPct ?? Math.round(detail.latestOverallScore * 100)
    : lastRow?.[metricDataKey(metric)] ?? 0;

  const singleColor = metric === 'all' ? SERIES.overall.color : SERIES[metric].color;

  const chartConfig = metric === 'all'
    ? Object.fromEntries(
        Object.entries(SERIES).map(([key, item]) => [key, { label: item.label, color: item.color }]),
      )
    : {
        value: {
          label: badgeLabel,
          color: singleColor ?? SERIES.overall.color,
        },
      };

  return (
    <section className="grid w-full gap-4 pt-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-semibold">Risiko PTM</h2>
          <p className="text-sm text-neutral-500">Tren skor risiko per penyakit dengan filter waktu.</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <DropdownSelect
            value={period}
            options={PERIODS.map((item) => ({ value: item.id, label: item.label }))}
            onValueChange={setPeriod}
            aria-label="Filter periode"
            size="md"
          />

          <DropdownSelect
            value={metric}
            options={METRIC_OPTIONS.map((item) => ({ value: item.id, label: item.label }))}
            onValueChange={setMetric}
            aria-label="Filter metrik"
            size="md"
          />

          <div className="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-semibold leading-none whitespace-nowrap text-teal-700">
            {badgeLabel} {badgeValue}%
          </div>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <ChartAreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {metric === 'all' ? (
            Object.entries(SERIES).map(([key, item]) => (
              <defs key={`gradient-${key}`}>
                <linearGradient id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
            ))
          ) : (
            <defs>
              <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={singleColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={singleColor} stopOpacity={0.03} />
              </linearGradient>
            </defs>
          )}

          <ChartCartesianGrid vertical={false} stroke="#F0F0F0" />
          <ChartXAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={period === 'year' ? 24 : 12}
            tick={{ fontSize: 11, fill: '#737373' }}
          />
          <ChartYAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#737373' }}
            width={32}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const row = payload[0].payload as ChartRow;

              if (metric === 'all') {
                return (
                  <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs">
                    <p className="font-medium text-neutral-900">{formatTooltipLabel(row.date)}</p>
                    <div className="mt-1.5 grid gap-1">
                      {Object.entries(SERIES).map(([key, item]) => (
                        <p key={key} className="text-neutral-600">
                          {item.label}:{' '}
                          <span className="font-semibold text-neutral-900">{row[item.key]}%</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              }

              const value = row[metricDataKey(metric)];

              return (
                <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs">
                  <p className="font-medium text-neutral-900">{formatTooltipLabel(row.date)}</p>
                  <p className="mt-1 text-neutral-600">
                    {badgeLabel}: <span className="font-semibold text-neutral-900">{value}%</span>
                  </p>
                </div>
              );
            }}
          />

          {metric === 'all' ? (
            Object.entries(SERIES).map(([key, item]) => (
              <ChartArea
                key={key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={1.75}
                fill={`url(#fill-${key})`}
                dot={false}
                activeDot={{ r: 3, fill: item.color, stroke: '#fff', strokeWidth: 2 }}
              />
            ))
          ) : (
            <ChartArea
              type="monotone"
              dataKey={metricDataKey(metric)}
              stroke={singleColor}
              strokeWidth={2}
              fill={`url(#fill-${metric})`}
              dot={false}
              activeDot={{ r: 4, fill: singleColor, stroke: '#fff', strokeWidth: 2 }}
            />
          )}
        </ChartAreaChart>
      </ChartContainer>

      {metric === 'all' ? (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(SERIES).map(([key, item]) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
              <i className="inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
