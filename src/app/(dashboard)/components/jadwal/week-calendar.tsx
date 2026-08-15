'use client';

import { useEffect, useMemo, useRef } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DoctorAppointment } from '@/lib/backend';
import { slotFromCell, type AppointmentSlot } from '@/lib/appointment-utils';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const HOUR_START = 6;
const HOUR_END = 22;
const HOUR_HEIGHT = 52;

const EVENT_COLORS = [
  'bg-violet-100 text-violet-900',
  'bg-sky-100 text-sky-900',
  'bg-amber-100 text-amber-900',
  'bg-emerald-100 text-emerald-900',
  'bg-rose-100 text-rose-900',
  'bg-teal-100 text-teal-900',
];

type WeekCalendarProps = {
  weekStart: Dayjs;
  appointments: DoctorAppointment[];
  onWeekChange: (next: Dayjs) => void;
  onSlotClick: (slot: AppointmentSlot) => void;
  onEventClick: (appointment: DoctorAppointment) => void;
};

function eventColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % EVENT_COLORS.length;
  return EVENT_COLORS[hash];
}

function formatHourLabel(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function formatEventTime(start: Dayjs, end: Dayjs) {
  return `${start.format('HH:mm')} - ${end.format('HH:mm')}`;
}

function getEventStyle(start: Dayjs, end: Dayjs) {
  const startMinutes = start.hour() * 60 + start.minute();
  const endMinutes = end.hour() * 60 + end.minute();
  const gridStart = HOUR_START * 60;
  const top = ((startMinutes - gridStart) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT - 4, 28);
  return { top, height };
}

export function WeekCalendar({
  weekStart,
  appointments,
  onWeekChange,
  onSlotClick,
  onEventClick,
}: WeekCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = dayjs();

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day')),
    [weekStart],
  );

  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START }, (_, index) => HOUR_START + index),
    [],
  );

  const weekLabel = `${days[0].format('D')}-${days[6].format('D MMM YYYY')}`;

  const eventsByDay = useMemo(() => {
    return days.map((day) =>
      appointments
        .filter((apt) => dayjs(apt.start).isSame(day, 'day'))
        .map((apt) => ({
          ...apt,
          startAt: dayjs(apt.start),
          endAt: dayjs(apt.end),
        })),
    );
  }, [appointments, days]);

  const todayIndex = days.findIndex((day) => day.isSame(now, 'day'));
  const showNowLine = todayIndex >= 0;
  const nowTop =
    showNowLine && now.hour() >= HOUR_START && now.hour() < HOUR_END
      ? ((now.hour() * 60 + now.minute() - HOUR_START * 60) / 60) * HOUR_HEIGHT
      : null;

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const scrollTarget = nowTop !== null ? Math.max(nowTop - 120, 0) : (8 - HOUR_START) * HOUR_HEIGHT;
    node.scrollTop = scrollTarget;
  }, [weekStart, nowTop]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-3 border-b border-neutral-100 px-6 py-3 max-md:px-4">
        <button
          type="button"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Minggu sebelumnya"
          onClick={() => onWeekChange(weekStart.subtract(1, 'week'))}
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="min-w-[180px] text-lg font-semibold tracking-tight text-neutral-900">{weekLabel}</h2>
        <button
          type="button"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Minggu berikutnya"
          onClick={() => onWeekChange(weekStart.add(1, 'week'))}
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          className="ml-1 cursor-pointer rounded-full border-0 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
          onClick={() => onWeekChange(dayjs().startOf('isoWeek'))}
        >
          Hari ini
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-neutral-100 bg-white">
        <div />
        {days.map((day) => {
          const isToday = day.isSame(now, 'day');
          return (
            <div key={day.format('YYYY-MM-DD')} className="px-1 py-2.5 text-center">
              <div
                className={cn(
                  'inline-flex min-w-13 flex-col items-center px-2 py-1',
                  isToday ? 'border-t-2 border-black bg-black/10' : 'text-neutral-700',
                )}
              >
                <span className="text-[11px] font-medium leading-none">{day.format('ddd')}</span>
                <span className="mt-0.5 text-sm font-semibold leading-none">{day.format('D')}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className="relative grid grid-cols-[52px_repeat(7,minmax(0,1fr))]"
          style={{ height: hours.length * HOUR_HEIGHT }}
        >
          <div className="relative border-r border-neutral-100">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-neutral-400"
                style={{ top: (hour - HOUR_START) * HOUR_HEIGHT }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
            {nowTop !== null ? (
              <div
                className="absolute right-0 z-20 -translate-y-1/2 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium text-white"
                style={{ top: nowTop }}
              >
                {now.format('H:mm')}
              </div>
            ) : null}
          </div>

          {days.map((day, dayIndex) => (
            <div
              key={day.format('YYYY-MM-DD')}
              className={cn(
                'relative border-r border-neutral-100 last:border-r-0',
                day.isSame(now, 'day') && 'bg-neutral-50/60',
              )}
            >
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className="absolute inset-x-0 cursor-pointer border-0 border-t border-neutral-100 bg-transparent p-0 hover:bg-neutral-900/[0.03]"
                  style={{
                    top: (hour - HOUR_START) * HOUR_HEIGHT,
                    height: HOUR_HEIGHT,
                  }}
                  onClick={() =>
                    onSlotClick(
                      slotFromCell(day.hour(hour).minute(0), day.hour(hour + 1).minute(0)),
                    )
                  }
                  aria-label={`Buat jadwal ${day.format('D MMM')} ${formatHourLabel(hour)}`}
                />
              ))}

              {eventsByDay[dayIndex].map((event) => {
                const { top, height } = getEventStyle(event.startAt, event.endAt);
                return (
                  <button
                    key={event.id}
                    type="button"
                    className={cn(
                      'absolute inset-x-1 z-10 cursor-pointer overflow-hidden rounded-md border-0 px-2 py-1.5 text-left shadow-none',
                      eventColor(event.id),
                    )}
                    style={{ top: top + 2, height }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <p className="truncate text-xs font-semibold leading-tight">{event.title}</p>
                    <p className="mt-0.5 truncate text-[10px] opacity-70">
                      {formatEventTime(event.startAt, event.endAt)}
                    </p>
                  </button>
                );
              })}

              {showNowLine && dayIndex === todayIndex && nowTop !== null ? (
                <div
                  className="pointer-events-none absolute inset-x-0 z-[15] border-t-2 border-neutral-900"
                  style={{ top: nowTop }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
