'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const RECORD_TYPES: { value: 'consultation' | 'image' | 'voice' | 'note'; label: string }[] = [
  { value: 'consultation', label: 'Konsultasi' },
  { value: 'note', label: 'Catatan' },
  { value: 'image', label: 'Hasil pemeriksaan' },
  { value: 'voice', label: 'Rekaman suara' },
];

type UploadRecordModalProps = {
  open: boolean;
  type: 'consultation' | 'image' | 'voice' | 'note';
  title: string;
  content: string;
  doctorName: string;
  recordDate: string;
  onTypeChange: (value: 'consultation' | 'image' | 'voice' | 'note') => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onDoctorNameChange: (value: string) => void;
  onRecordDateChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  error?: string | null;
};

export function UploadRecordModal({
  open,
  type,
  title,
  content,
  doctorName,
  recordDate,
  onTypeChange,
  onTitleChange,
  onContentChange,
  onDoctorNameChange,
  onRecordDateChange,
  onClose,
  onSubmit,
  submitting = false,
  error = null,
}: UploadRecordModalProps) {
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
            <p className="mt-1 text-xs text-neutral-500">
              Catatan ini akan tersimpan di rekam medis pasien.
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

        <div className="grid gap-4">
          <Field>
            <FieldLabel htmlFor="record-type">Jenis</FieldLabel>
            <select
              id="record-type"
              value={type}
              onChange={(event) => onTypeChange(event.target.value as typeof type)}
              className="h-10 rounded border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 focus:border-neutral-200 focus:outline-none"
            >
              {RECORD_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

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
            <FieldLabel htmlFor="record-content">Catatan</FieldLabel>
            <Textarea
              id="record-content"
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              placeholder="Tulis catatan atau ringkasan rekam medis..."
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="record-date">Tanggal</FieldLabel>
            <Input
              id="record-date"
              type="date"
              value={recordDate}
              onChange={(event) => onRecordDateChange(event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="record-doctor">Nama dokter</FieldLabel>
            <Input
              id="record-doctor"
              value={doctorName}
              onChange={(event) => onDoctorNameChange(event.target.value)}
              placeholder="Opsional"
            />
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
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
