'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Upload, FileArchive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadRecordModal } from '@/app/(dashboard)/components/monitor/upload-record-modal';
import { ConfirmDeleteRecordModal } from '@/app/(dashboard)/components/monitor/confirm-delete-record-modal';
import { deletePatientRecord, downloadPatientRecordFile } from '@/app/actions';
import type { MonitorRecordItem } from '@/lib/backend';

type RecordsListProps = {
  records: MonitorRecordItem[];
  patientId: number;
};

function formatRecordDate(value: string | null) {
  if (!value) return 'Tanggal tidak tersedia';
  return new Date(`${value.length === 10 ? `${value}T00:00:00` : value}`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function triggerBrowserDownload(base64: string, fileName: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function RecordsList({ records, patientId }: RecordsListProps) {
  const router = useRouter();
  const visibleRecords = records.filter((record) => Boolean(record.fileUrl) || record.source === 'record');

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MonitorRecordItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setFile(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Judul wajib diisi');
      return;
    }
    if (!file) {
      setError('File PDF wajib dipilih');
      return;
    }
    if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Hanya file PDF yang didukung');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('Ukuran PDF maksimal 12 MB');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set('title', title.trim());
      form.set('file', file);

      const response = await fetch(`/api/portal/patients/${patientId}/records`, {
        method: 'POST',
        body: form,
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Gagal menyimpan rekam medis');
      }

      setModalOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan rekam medis');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (record: MonitorRecordItem) => {
    setDownloadingId(record.id);
    startTransition(async () => {
      try {
        const downloaded = await downloadPatientRecordFile(patientId, record.id);
        triggerBrowserDownload(downloaded.base64, downloaded.fileName, downloaded.mimeType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengunduh file');
      } finally {
        setDownloadingId(null);
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    startTransition(async () => {
      try {
        await deletePatientRecord(patientId, deleteTarget.id);
        setDeleteTarget(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus rekam medis');
      } finally {
        setDeleting(false);
      }
    });
  };

  const busy = uploading || pending || deleting;

  return (
    <section className="grid gap-4 pt-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 text-base font-semibold">Rekam medis</h2>
          <p className="text-sm text-neutral-500">
            Dokumen dari Bluetooth pasien atau upload dokter
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Upload size={12} />
          Upload PDF
        </Button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {visibleRecords.length === 0 ? (
        <div className="flex flex-col gap-2 py-32 rounded-lg items-center justify-center">
          <FileArchive size={42} className="text-neutral-200" />
          <h3 className="text-sm text-neutral-400">
            Belum ada dokumen. Terima via Bluetooth dari pasien lalu upload di sini.
          </h3>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {visibleRecords.map((record) => (
            <article
              key={`${record.source}-${record.id}`}
              className="flex items-start gap-3 rounded-lg border border-neutral-100 px-3.5 py-3"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-neutral-100 text-neutral-600" aria-hidden="true">
                <FileText size={14} />
              </div>

              <div className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-neutral-900">{record.title}</strong>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                  {record.summary ?? 'Dokumen PDF'}
                </p>
                <span className="mt-2 inline-block text-[11px] text-neutral-500">
                  {formatRecordDate(record.recordDate ?? record.createdAt.slice(0, 10))}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {record.fileUrl ? (
                  <Button
                    size="sm"
                    aria-label={`Unduh ${record.title}`}
                    onClick={() => handleDownload(record)}
                    disabled={downloadingId === record.id || busy}
                  >
                    <Download size={12} />
                    {downloadingId === record.id ? 'Mengunduh...' : 'Unduh'}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Hapus ${record.title}`}
                  onClick={() => setDeleteTarget(record)}
                  disabled={busy}
                >
                  <Trash2 size={12} />
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <UploadRecordModal
        open={modalOpen}
        title={title}
        fileName={file?.name ?? null}
        onTitleChange={setTitle}
        onFileChange={setFile}
        onClose={() => { setModalOpen(false); resetForm(); }}
        onSubmit={() => void handleSubmit()}
        submitting={uploading}
        error={error}
      />

      <ConfirmDeleteRecordModal
        open={deleteTarget != null}
        title={deleteTarget?.title ?? ''}
        submitting={deleting || pending}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
