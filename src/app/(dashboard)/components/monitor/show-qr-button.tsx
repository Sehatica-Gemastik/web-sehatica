'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ShowQrButtonProps = {
  doctorId: number;
  doctorName: string;
};

export function ShowQrButton({ doctorId, doctorName }: ShowQrButtonProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const payload = `sehatica:doctor:${doctorId}`;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <QrCode size={12} />
        Show QR
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/30 p-5"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-[360px] rounded-[10px] border border-neutral-200 bg-white p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-qr-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 id="doctor-qr-title" className="mb-1 text-base font-semibold">QR Dokter</h3>
                <p className="text-sm text-neutral-500">Pasien dapat scan untuk menambahkan Anda sebagai partner.</p>
              </div>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded border-0 bg-transparent text-neutral-500 cursor-pointer hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Tutup"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid place-items-center rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <QRCode value={payload} size={168} bgColor="#FFFFFF" fgColor="#171717" />
            </div>

            <div className="mt-4 grid justify-items-center gap-2 text-center">
              <strong className="text-sm font-semibold">{doctorName}</strong>
              <Badge variant="outline">DOC-{doctorId}</Badge>
              <code className="rounded bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">{payload}</code>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
