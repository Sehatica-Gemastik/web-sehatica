'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

type ConfirmDeleteRecordModalProps = {
  open: boolean;
  title: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteRecordModal({
  open,
  title,
  submitting = false,
  onClose,
  onConfirm,
}: ConfirmDeleteRecordModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, submitting]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/30 p-5"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="w-full max-w-[400px] rounded-[10px] border border-neutral-200 bg-white p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-record-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="confirm-delete-record-title" className="text-sm font-semibold text-neutral-900">
          Hapus rekam medis?
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-neutral-500">
          <span className="font-medium text-neutral-700">&ldquo;{title}&rdquo;</span>
          {' '}akan dihapus permanen dari portal. Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? 'Menghapus...' : 'Ya, hapus'}
          </Button>
        </div>
      </div>
    </div>
  );
}
