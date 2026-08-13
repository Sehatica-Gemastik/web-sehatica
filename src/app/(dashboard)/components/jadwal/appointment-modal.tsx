'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

type AppointmentModalProps = {
  open: boolean;
  title: string;
  notes: string;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function AppointmentModal({
  open,
  title,
  notes,
  onNotesChange,
  onClose,
  onSubmit,
}: AppointmentModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/30 p-5"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-[420px] rounded-[10px] border border-neutral-200 bg-white p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id="appointment-modal-title" className="text-sm font-semibold">
              Tambah appointment?
            </h3>
            <p className="mt-1 text-xs text-neutral-500">Appointment yang dikirim tidak dapat dibatalkan</p>
          </div>
          <button
            type="button"
            className="grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Tutup"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-4">
          <Field>
            {/* <FieldLabel>Judul appointment</FieldLabel>
            <div className="rounded border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-900">
              {title}
            </div> */}
          </Field>
          <h1 className="text-2xl font-bold text-neutral-700">
            {title}
          </h1>

          <Field>
            <FieldLabel htmlFor="appointment-notes">Catatan</FieldLabel>
            <Textarea
              id="appointment-notes"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Tulis catatan untuk pasien..."
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batalkan
          </Button>
          <Button
            size="sm"
            className="bg-neutral-900 text-white hover:bg-neutral-600 hover:text-white"
            onClick={onSubmit}
          >
            Kirim
          </Button>
        </div>
      </div>
    </div>
  );
}
