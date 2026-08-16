import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
  ALCOHOL_FREQUENCY_LABELS,
  BINGE_FREQUENCY_LABELS,
  formatDateTimeId,
  optionLabel,
  yesNoLabel,
} from '@/lib/questionnaire-labels';
import type { DailyQuestionnaireLog } from '@/lib/backend';

type DailyQuestionnaireDetailProps = {
  log: DailyQuestionnaireLog;
  patientName: string;
  backHref: string;
};

type LogRow = { label: string; value: string };

function LogSection({ title, rows }: { title: string; rows: LogRow[] }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">{title}</h3>
      <dl className="grid gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
            <dt className="text-neutral-500">{row.label}</dt>
            <dd className="text-right font-medium text-neutral-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function activityRows(
  label: string,
  flag: number,
  days: number,
  minutes: number,
): LogRow[] {
  if (flag === 0) return [{ label, value: 'Tidak' }];
  return [
    { label, value: 'Ya' },
    { label: `${label} · hari/minggu`, value: `${days} hari` },
    { label: `${label} · menit/hari`, value: `${minutes} menit` },
  ];
}

export function DailyQuestionnaireDetail({ log, patientName, backHref }: DailyQuestionnaireDetailProps) {
  const activitySection: LogRow[] = [
    ...activityRows('Aktivitas berat saat kerja', log.vigorousWork, log.vigorousWorkDays, log.vigorousWorkMinutes),
    ...activityRows('Aktivitas sedang saat kerja', log.moderateWork, log.moderateWorkDays, log.moderateWorkMinutes),
    ...activityRows('Jalan kaki / bersepeda', log.transportWalkingBiking, log.transportDays, log.transportMinutes),
    ...activityRows('Olahraga berat', log.vigorousRecreation, log.vigorousRecreationDays, log.vigorousRecreationMinutes),
    ...activityRows('Olahraga sedang', log.moderateRecreation, log.moderateRecreationDays, log.moderateRecreationMinutes),
    { label: 'Waktu duduk', value: `${Math.round(log.sedentaryMinutes / 60)} jam` },
    { label: 'Total aktivitas', value: `${log.totalActivityMinutes} menit/hari` },
  ];

  const nutritionSection: LogRow[] = [
    { label: 'Kalori', value: `${log.caloriesDay1} kkal` },
    { label: 'Protein', value: `${log.proteinGDay1} g` },
    { label: 'Karbohidrat', value: `${log.carbohydrateGDay1} g` },
    { label: 'Gula', value: `${log.sugarGDay1} g` },
    { label: 'Lemak total', value: `${log.totalFatGDay1} g` },
    { label: 'Lemak jenuh', value: `${log.saturatedFatGDay1} g` },
    { label: 'Natrium', value: `${log.sodiumMgDay1} mg` },
    { label: 'Serat', value: `${log.fiberGDay1} g` },
    { label: 'Kolesterol', value: `${log.cholesterolMgDay1} mg` },
    { label: 'Jumlah makanan tercatat', value: `${log.mealsCount} item` },
  ];

  const alcoholSection: LogRow[] = [
    { label: 'Pernah minum alkohol', value: yesNoLabel(log.alcoholEver) },
  ];

  if (log.alcoholEver === 1) {
    alcoholSection.push(
      {
        label: 'Frekuensi minum',
        value: optionLabel(ALCOHOL_FREQUENCY_LABELS, log.alcoholFrequency),
      },
      {
        label: 'Gelas per hari',
        value: log.alcoholDrinksPerDay != null ? String(log.alcoholDrinksPerDay) : '-',
      },
      {
        label: 'Frekuensi binge',
        value: optionLabel(BINGE_FREQUENCY_LABELS, log.alcoholBingeFrequency),
      },
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 px-1 py-2">
      <div className="grid gap-8">
        <Link
          href={backHref}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-neutral-500 no-underline py-2 hover:px-2 transition-all hover:bg-neutral-100"
        >
          <ChevronLeft size={16} />
          Kembali ke monitor
        </Link>

        <div>
          {/* <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            {formatDateId(log.date)}
          </h1> */}
          <h1 className='text-2xl font-semibold text-neutral-800'>
            {patientName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Diselesaikan pada {formatDateTimeId(log.completedAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <LogSection title="Aktivitas fisik" rows={activitySection} />
        <LogSection title="Nutrisi harian" rows={nutritionSection} />
        <LogSection title="Alkohol" rows={alcoholSection} />
      </div>
    </div>
  );
}
