'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Upload, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadRecordModal } from '@/app/(dashboard)/components/monitor/upload-record-modal';
import { createPatientRecord } from '@/app/actions';
import type { MonitorRecordItem } from '@/lib/backend';

type RecordsListProps = {
  records: MonitorRecordItem[];
  patientId: number;
};

type RecordType = 'consultation' | 'image' | 'voice' | 'note';

function formatRecordDate(value: string | null) {
  if (!value) return 'Tanggal tidak tersedia';
  return new Date(`${value.length === 10 ? `${value}T00:00:00` : value}`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RecordsList({ records, patientId }: RecordsListProps) {
  const router = useRouter();
  const visibleRecords = records.filter((record) => record.type !== 'consultation');

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<RecordType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const resetForm = () => {
    setType('note');
    setTitle('');
    setContent('');
    setDoctorName('');
    setRecordDate('');
    setError(null);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Judul rekam medis wajib diisi');
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        await createPatientRecord({
          patientId,
          type,
          title: title.trim(),
          content,
          doctorName,
          recordDate,
        });
        setModalOpen(false);
        resetForm();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan rekam medis');
      }
    });
  };

  return (
    <section className="grid gap-4 pt-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 text-base font-semibold">Rekam medis</h2>
          <p className="text-sm text-neutral-500">Dokumen yang dikirim pasien</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Upload size={12} />
          Upload Rekam Medis
        </Button>
      </div>

      {visibleRecords.length === 0 ? (
        <div className="flex flex-col gap-2 py-32 rounded-lg items-center justify-center">
          <FileArchive size={42} className='text-neutral-200'/>
          <h3 className='text-sm text-neutral-400'>
            Belum ada rekam medis yang diterima.
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
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{record.summary ?? 'Tidak ada ringkasan.'}</p>
                <span className="mt-2 inline-block text-[11px] text-neutral-500">
                  {formatRecordDate(record.recordDate ?? record.createdAt.slice(0, 10))}
                </span>
              </div>

              <Button size="sm" aria-label={`Unduh ${record.title}`}>
                <Download size={12} />
                Unduh
              </Button>
            </article>
          ))}
        </div>
      )}

      <UploadRecordModal
        open={modalOpen}
        type={type}
        title={title}
        content={content}
        doctorName={doctorName}
        recordDate={recordDate}
        onTypeChange={setType}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onDoctorNameChange={setDoctorName}
        onRecordDateChange={setRecordDate}
        onClose={() => { setModalOpen(false); resetForm(); }}
        onSubmit={handleSubmit}
        submitting={pending}
        error={error}
      />
    </section>
  );
}
