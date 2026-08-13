'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { MonitorPatientSummary } from '@/lib/backend';
import { PtmRiskBadge } from '@/app/(dashboard)/components/monitor/ptm-risk-badge';

type PatientPickerProps = {
  patients: MonitorPatientSummary[];
  activeId: number | null;
  basePath?: string;
};

export function PatientPicker({ patients, activeId, basePath = '/' }: PatientPickerProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const active = patients.find((p) => p.id === activeId) ?? patients[0] ?? null;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  if (!active) {
    return (
      <div className="rounded-lg bg-neutral-50 px-6 py-6 text-sm text-neutral-500">
        <p>Belum ada pasien partner terhubung.</p>
      </div>
    );
  }

  return (
    <div className="relative w-72" ref={rootRef}>
      <button
        type="button"
        className="flex w-full items-center gap-2 border-0 bg-transparent text-left cursor-pointer hover:bg-black/2 p-2 rounded-lg transition-all duration-300"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Avatar initials={active.avatarInitials} size="md" />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-neutral-900">{active.name}</span>
          <span className="block truncate text-[11px] text-neutral-500">{active.age ? `${active.age} Tahun` : 'NaN'}</span>
        </div>
        <PtmRiskBadge score={active.overallRiskScore} compact />
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-neutral-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-40 grid w-72 gap-1 rounded-xl border border-black/4 bg-white p-1.5">
          {patients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left cursor-pointer border-0',
                patient.id === active.id ? 'bg-black/4' : 'bg-transparent hover:bg-black/2',
              )}
              onClick={() => {
                setOpen(false);
                router.push(`${basePath}?patient=${patient.id}`);
              }}
            >
              <Avatar initials={patient.avatarInitials} size="sm" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-neutral-900">{patient.name}</span>
                <span className="block truncate text-[11px] text-neutral-500">
                  {patient.age ? `${patient.age} Tahun` : 'NaN'}
                </span>
              </div>
              <PtmRiskBadge score={patient.overallRiskScore} compact />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
