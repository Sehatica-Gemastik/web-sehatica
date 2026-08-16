'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type UploadRecordModalProps = {
  open: boolean;
  title: string;
  fileName: string | null;
  onTitleChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  error?: string | null;
};

export function UploadRecordModal({
  open,
  title,
  fileName,
  onTitleChange,
  onFileChange,
  onClose,
  onSubmit,
  submitting = false,
  error = null,
}: UploadRecordModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

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
        className="w-full max-w-[420px] rounded-[10px] border border-neutral-200 bg-white p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-record-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id="upload-record-modal-title" className="text-sm font-semibold">
              Upload rekam medis
            </h3>
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
            <FieldLabel htmlFor="record-title">Judul</FieldLabel>
            <Input
              id="record-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Mis. Hasil lab kolesterol"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="record-file">Dokumen PDF</FieldLabel>
            <input
              ref={fileRef}
              id="record-file"
              type="file"
              accept="application/pdf,.pdf"
              className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-200"
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                onFileChange(next);
              }}
            />
            {fileName ? (
              <p className="mt-1.5 text-xs text-neutral-500">{fileName}</p>
            ) : (
              <p className="mt-1.5 text-xs text-neutral-400">Pilih file PDF (maks. wajar untuk browser).</p>
            )}
          </Field>
        </div>

        <div className="mt-5 flex flex-col items-end gap-2">
          {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Batalkan
            </Button>
            <Button
              size="sm"
              className="bg-neutral-900 text-white hover:bg-neutral-600 hover:text-white"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? 'Mengunggah...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
