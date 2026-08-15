'use client';

import { Badge } from '@/components/ui/badge';
import {
  EDUCATION_LABELS,
  INCOME_LABELS,
  RACE_LABELS,
  SEX_LABELS,
  formatDateId,
  optionLabel,
} from '@/lib/questionnaire-labels';
import type { MonitorPatientDetail } from '@/lib/backend';

type PatientProfilePanelProps = {
  detail: MonitorPatientDetail;
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-neutral-500">{label}</dt>
      <dd className="truncate text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

export function PatientProfilePanel({ detail }: PatientProfilePanelProps) {
  const { identity, weekly } = detail;

  return (
    <section className="grid gap-4 rounded-xl border border-neutral-100 bg-neutral-50/60 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Profil pasien</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Data diri dan cek mingguan terakhir dari aplikasi mobile
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Diperbarui {formatDateId(weekly?.completedAt ?? identity.completedAt)}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Data diri
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <StatItem label="Usia" value={`${identity.age} tahun`} />
            <StatItem label="Jenis kelamin" value={optionLabel(SEX_LABELS, identity.sex)} />
            <StatItem label="Latar belakang" value={optionLabel(RACE_LABELS, identity.raceEthnicity)} />
            <StatItem label="Pendidikan" value={optionLabel(EDUCATION_LABELS, identity.education)} />
            <StatItem
              label="Kondisi ekonomi"
              value={optionLabel(INCOME_LABELS, identity.incomePovertyRatio)}
            />
          </dl>
        </div>

        <div className="rounded-lg bg-white p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Cek mingguan
          </h3>
          {weekly ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <StatItem label="Berat badan" value={`${weekly.weightKg} kg`} />
              <StatItem label="Tinggi badan" value={`${weekly.heightCm} cm`} />
              <StatItem label="BMI" value={weekly.bmi.toFixed(1)} />
              <StatItem label="Lingkar pinggang" value={`${weekly.waistCm} cm`} />
              <StatItem label="Tekanan darah" value={`${weekly.systolicBp}/${weekly.diastolicBp} mmHg`} />
              <StatItem label="Terakhir diisi" value={formatDateId(weekly.completedAt)} />
            </dl>
          ) : (
            <p className="text-sm text-neutral-500">Belum ada data cek mingguan.</p>
          )}
        </div>
      </div>
    </section>
  );
}
