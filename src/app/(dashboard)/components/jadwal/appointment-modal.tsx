'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

type AppointmentModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  title: string;
  notes: string;
  startValue: string;
  endValue: string;
  onNotesChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  submitting?: boolean;
  deleting?: boolean;
  error?: string | null;
};

export function AppointmentModal({
  open,
  mode,
  title,
  notes,
  startValue,
  endValue,
  onNotesChange,
  onStartChange,
  onEndChange,
  onClose,
  onSubmit,
  onDelete,
  submitting = false,
  deleting = false,
  error = null,
}: AppointmentModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmDelete(false);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const busy = submitting || deleting;

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
              {mode === 'edit' ? 'Ubah appointment' : 'Tambah appointment'}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Atur waktu mulai dan selesai sebelum dikirim ke pasien.
            </p>
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

        {confirmDelete ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="mb-1 text-sm font-semibold text-red-700">Hapus appointment ini?</p>
            <p className="mb-4 text-xs text-red-600">
              Tindakan ini tidak dapat dibatalkan. Appointment akan dihapus permanen.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
                onClick={onDelete}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, hapus'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              <h1 className="text-2xl font-bold text-neutral-700">
                {title}
              </h1>

              <Field>
                <FieldLabel htmlFor="appointment-start">Mulai</FieldLabel>
                <input
                  id="appointment-start"
                  type="datetime-local"
                  value={startValue}
                  onChange={(event) => onStartChange(event.target.value)}
                  className="h-10 rounded border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-neutral-300 focus:outline-none"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="appointment-end">Selesai</FieldLabel>
                <input
                  id="appointment-end"
                  type="datetime-local"
                  value={endValue}
                  onChange={(event) => onEndChange(event.target.value)}
                  className="h-10 rounded border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-neutral-300 focus:outline-none"
                />
              </Field>

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

            <div className="mt-5 flex flex-col items-end gap-2">
              {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
              <div className="flex w-full items-center justify-between gap-2">
                {mode === 'edit' && onDelete ? (
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1.5 rounded border-0 bg-transparent px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy}
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
                    Batalkan
                  </Button>
                  <Button
                    size="sm"
                    className="bg-neutral-900 text-white hover:bg-neutral-600 hover:text-white"
                    onClick={onSubmit}
                    disabled={busy}
                  >
                    {submitting ? 'Menyimpan...' : mode === 'edit' ? 'Simpan perubahan' : 'Kirim'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
