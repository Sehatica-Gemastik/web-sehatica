'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserRoundX, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { revokePatient } from '@/app/actions';
import type { MonitorPatientSummary } from '@/lib/backend';

type PengaturanViewProps = {
  patients: MonitorPatientSummary[];
};

export function PengaturanView({ patients }: PengaturanViewProps) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleRevoke = (patientId: number) => {
    startTransition(async () => {
      setError(null);
      try {
        await revokePatient(patientId);
        setConfirmingId(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mencabut pasien');
      }
    });
  };

  return (
    <div className="grid w-full gap-6">
      <header>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Kelola pasien yang terhubung sebagai partner Anda.
        </p>
      </header>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Pasien partner</h2>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        {patients.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg py-24">
            <Users size={42} className="text-neutral-200" />
            <h3 className="text-sm text-neutral-400">Belum ada pasien partner.</h3>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {patients.map((patient) => (
              <article
                key={patient.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3.5 py-3"
              >
                <Avatar initials={patient.avatarInitials} size="sm" />
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm font-semibold text-neutral-900">
                    {patient.name}
                  </strong>
                  <span className="text-[13px] text-neutral-500">
                    {patient.age ? `${patient.age} tahun` : 'Usia tidak tersedia'}
                  </span>
                </div>

                {confirmingId === patient.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600">Cabut pasien ini?</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmingId(null)}
                      disabled={pending}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
                      onClick={() => handleRevoke(patient.id)}
                      disabled={pending}
                    >
                      {pending ? 'Mencabut...' : 'Ya, cabut'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setConfirmingId(patient.id)}
                  >
                    <UserRoundX size={12} />
                    Cabut
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
