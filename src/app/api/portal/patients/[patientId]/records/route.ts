import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/backend';

type Envelope = { success: boolean; data?: unknown; error?: string };

export async function POST(
  request: Request,
  context: { params: Promise<{ patientId: string }> },
) {
  const { patientId } = await context.params;
  const id = Number(patientId);
  if (!Number.isFinite(id)) {
    return Response.json({ error: 'ID pasien tidak valid' }, { status: 400 });
  }

  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    return Response.json({ error: 'Sesi berakhir. Silakan login ulang.' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: 'Payload upload tidak valid' }, { status: 400 });
  }

  const title = String(form.get('title') ?? '').trim();
  const file = form.get('file');

  if (!title) {
    return Response.json({ error: 'Judul wajib diisi' }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'File PDF wajib diunggah' }, { status: 400 });
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return Response.json({ error: 'Hanya file PDF yang didukung' }, { status: 400 });
  }

  // keep under ~12mb decoded to avoid oversized backend payloads
  if (file.size > 12 * 1024 * 1024) {
    return Response.json({ error: 'Ukuran PDF maksimal 12 MB' }, { status: 413 });
  }

  const fileBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');

  const response = await fetch(`${BACKEND_URL}/portal/patients/${id}/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'image',
      title,
      fileName: file.name || 'document.pdf',
      fileBase64,
    }),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as Envelope | null;
  if (!response.ok || !payload?.success) {
    return Response.json(
      { error: payload?.error ?? 'Gagal mengunggah rekam medis' },
      { status: response.status || 500 },
    );
  }

  return Response.json({ success: true, data: payload.data }, { status: 201 });
}
