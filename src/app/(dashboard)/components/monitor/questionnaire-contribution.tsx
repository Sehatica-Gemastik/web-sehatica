'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { QuestionnaireDay } from '@/lib/backend';

type QuestionnaireContributionProps = {
  days: QuestionnaireDay[];
};

type WeekColumn = Array<QuestionnaireDay | null>;

function formatDayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatMonthLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { month: 'short' });
}

function buildWeekColumns(days: QuestionnaireDay[]): WeekColumn[] {
  if (days.length === 0) return [];

  const first = new Date(`${days[0].date}T00:00:00`);
  const lead = first.getDay();
  const weeks: WeekColumn[] = [];
  let current: WeekColumn = Array.from({ length: lead }, () => null);

  for (const day of days) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  return weeks;
}

function buildMonthLabels(weeks: WeekColumn[]) {
  const labels: Array<{ label: string; weekIndex: number }> = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((day) => day !== null);
    if (!firstDay) return;

    const month = new Date(`${firstDay.date}T00:00:00`).getMonth();
    if (month !== lastMonth) {
      labels.push({ label: formatMonthLabel(firstDay.date), weekIndex });
      lastMonth = month;
    }
  });

  return labels;
}

function ContributionCell({ day }: { day: QuestionnaireDay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative min-h-0 min-w-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={cn(
          'block aspect-square w-full min-h-[10px] rounded-[3px]',
          day.filled ? 'bg-teal-500' : 'bg-neutral-200',
        )}
        aria-label={`${formatDayLabel(day.date)} — ${day.filled ? 'Sudah isi kuisioner' : 'Belum isi kuisioner'}`}
      />
      {hovered ? (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-[11px] text-white">
          <span className="font-medium">{formatDayLabel(day.date)}</span>
          <span className="text-neutral-300"> · {day.filled ? 'Sudah isi' : 'Belum isi'}</span>
        </div>
      ) : null}
    </div>
  );
}

export function QuestionnaireContribution({ days }: QuestionnaireContributionProps) {
  const weeks = useMemo(() => buildWeekColumns(days), [days]);
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);

  return (
    <section className="grid w-full gap-4 pt-1">
      <div>
        <h2 className="mb-1 text-base font-semibold">Kuisioner harian</h2>
        <p className="text-sm text-neutral-500">Kebiasaan pengisian kuisioner pasien per hari</p>
      </div>

      <div className="w-full">
        <div className="relative mb-2 ml-8 h-4 w-[calc(100%-2rem)]">
          {monthLabels.map(({ label, weekIndex }) => (
            <span
              key={`${label}-${weekIndex}`}
              className="absolute top-0 text-[11px] text-neutral-500"
              style={{ left: `${(weekIndex / Math.max(weeks.length - 1, 1)) * 100}%` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex w-full gap-2">
          <div className="grid w-7 shrink-0 grid-rows-7 gap-1 pt-0.5 text-[10px] leading-none text-neutral-400">
            <span />
            <span className="flex items-center">Sen</span>
            <span />
            <span className="flex items-center">Rab</span>
            <span />
            <span className="flex items-center">Jum</span>
            <span />
          </div>

          <div className="flex min-w-0 flex-1 gap-1" aria-label="Kalender kuisioner harian">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid min-w-0 flex-1 grid-rows-7 gap-1">
                {week.map((day, dayIndex) =>
                  day ? (
                    <ContributionCell key={day.date} day={day} />
                  ) : (
                    <span key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square w-full min-h-[10px]" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
        <span>Belum isi</span>
        <span className="h-3 w-3 rounded-[3px] bg-neutral-200" />
        <span>Sudah isi</span>
        <span className="h-3 w-3 rounded-[3px] bg-teal-500" />
      </div>
    </section>
  );
}
