import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export type AppointmentSlot = {
  start: Dayjs;
  end: Dayjs;
};

function getDayPeriod(hour: number): 'Pagi' | 'Siang' | 'Malam' {
  if (hour >= 5 && hour < 12) return 'Pagi';
  if (hour >= 12 && hour < 18) return 'Siang';
  return 'Malam';
}

export function formatAppointmentTitle({ start, end }: AppointmentSlot): string {
  const dayName = start.format('dddd');
  const dateLabel = start.format('D MMM');
  const startHour = start.hour();
  const endHour = end.hour();
  const period = getDayPeriod(startHour);

  return `${dayName}, ${dateLabel}, ${startHour}-${endHour} ${period}`;
}

export function getDefaultAppointmentSlot(base = dayjs()): AppointmentSlot {
  const start = base.add(1, 'hour').startOf('hour');
  const end = start.add(2, 'hour');
  return { start, end };
}

export function slotFromCell(start: Dayjs, end: Dayjs): AppointmentSlot {
  if (end.diff(start, 'hour') >= 1) {
    return { start, end };
  }

  const normalizedStart = start.startOf('hour');
  return {
    start: normalizedStart,
    end: normalizedStart.add(2, 'hour'),
  };
}
