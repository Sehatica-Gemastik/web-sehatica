'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  ACCESS_COOKIE,
  BackendError,
  REFRESH_COOKIE,
  accessToken,
  backendRequest,
  sessionCookieOptions,
} from '@/lib/backend';
import {
  createDoctorAppointmentApi,
  createPatientRecordApi,
  deleteDoctorAppointmentApi,
  deletePatientRecordApi,
  revokePartnerPatientApi,
  updateDoctorAppointmentApi,
  updateDoctorProfileApi,
} from '@/lib/doctor-api';

type AuthPayload = {
  user: { id: number; name: string; role: 'user' | 'doctor' | 'admin' };
  accessToken: string;
  refreshToken: string;
};

async function saveTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, { ...sessionCookieOptions, maxAge: 15 * 60 });
  cookieStore.set(REFRESH_COOKIE, refreshToken, { ...sessionCookieOptions, maxAge: 30 * 24 * 60 * 60 });
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/login?error=Email+dan+password+wajib+diisi');

  try {
    const auth = await backendRequest<AuthPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (auth.user.role !== 'doctor') redirect('/login?error=Akun+ini+bukan+akun+dokter');
    await saveTokens(auth.accessToken, auth.refreshToken);
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Login tidak tersedia';
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
  redirect('/');
}

export async function registerDoctor(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const phoneCountry = String(formData.get('phoneCountry') ?? '+62').trim();
  const phoneLocal = String(formData.get('phone') ?? '').trim().replace(/\D/g, '');
  const specialty = String(formData.get('specialty') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const phone = phoneLocal ? `${phoneCountry}${phoneLocal}` : '';

  if (!name || !email || !password || !specialty) {
    redirect('/register?error=Nama,+email,+password,+dan+spesialisasi+wajib+diisi');
  }

  if (password !== confirmPassword) {
    redirect('/register?error=Konfirmasi+password+tidak+cocok');
  }

  try {
    const auth = await backendRequest<AuthPayload>('/auth/register-doctor', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, specialty, bio }),
    });
    await saveTokens(auth.accessToken, auth.refreshToken);
  } catch (error) {
    const message = error instanceof BackendError
      ? error.message
      : (error instanceof Error ? error.message : 'Pendaftaran dokter gagal');
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }
  redirect('/');
}

export async function updateDoctorProfile(formData: FormData) {
  const { token } = await accessToken('/profil');
  const name = String(formData.get('name') ?? '').trim();
  const phoneCountry = String(formData.get('phoneCountry') ?? '+62').trim();
  const phoneLocal = String(formData.get('phone') ?? '').trim().replace(/\D/g, '');
  const specialty = String(formData.get('specialty') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const phone = phoneLocal ? `${phoneCountry}${phoneLocal}` : '';

  if (!name || !specialty) {
    redirect('/profil?error=Nama+dan+spesialisasi+wajib+diisi');
  }

  try {
    await updateDoctorProfileApi(token, { name, phone, specialty, bio });
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Gagal menyimpan profil';
    redirect(`/profil?error=${encodeURIComponent(message)}`);
  }

  revalidatePath('/profil');
  redirect('/profil?updated=1');
}

export async function createAppointment(input: {
  patientId: number;
  title: string;
  notes: string;
  start: string;
  end: string;
}) {
  const { token } = await accessToken('/jadwal');

  try {
    await createDoctorAppointmentApi(token, {
      patientId: input.patientId,
      title: input.title,
      notes: input.notes,
      start: input.start,
      end: input.end,
    });
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Gagal menyimpan janji';
    throw new Error(message);
  }

  revalidatePath('/jadwal');
}

export async function updateAppointment(input: {
  id: string;
  patientId: number;
  title: string;
  notes: string;
  start: string;
  end: string;
}) {
  const { token } = await accessToken('/jadwal');

  try {
    await updateDoctorAppointmentApi(token, input.id, {
      patientId: input.patientId,
      title: input.title,
      notes: input.notes,
      start: input.start,
      end: input.end,
    });
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Gagal memperbarui janji';
    throw new Error(message);
  }

  revalidatePath('/jadwal');
}

export async function deleteAppointment(id: string) {
  const { token } = await accessToken('/jadwal');

  try {
    await deleteDoctorAppointmentApi(token, id);
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Gagal menghapus janji';
    throw new Error(message);
  }

  revalidatePath('/jadwal');
}

export async function createPatientRecord(input: {
  patientId: number;
  title: string;
  fileName: string;
  fileBase64: string;
}) {
  const { token } = await accessToken('/');

  try {
    await createPatientRecordApi(token, input.patientId, {
      title: input.title,
      fileName: input.fileName,
      fileBase64: input.fileBase64,
    });
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Gagal menyimpan rekam medis';
    throw new Error(message);
  }

  revalidatePath('/');
}

export async function deletePatientRecord(patientId: number, recordId: number) {
  const { token } = await accessToken('/');

  try {
    await deletePatientRecordApi(token, patientId, recordId);
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Gagal menghapus rekam medis';
    throw new Error(message);
  }

  revalidatePath('/');
}

export async function downloadPatientRecordFile(patientId: number, recordId: number) {
  const { token } = await accessToken('/');
  const { BACKEND_URL } = await import('@/lib/backend');

  const response = await fetch(
    `${BACKEND_URL}/portal/patients/${patientId}/records/${recordId}/file`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    const message = response.status === 404
      ? 'File rekam medis tidak ditemukan'
      : 'Gagal mengunduh file';
    throw new Error(message);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return {
    base64: buffer.toString('base64'),
    fileName: match?.[1] ?? `rekam-medis-${recordId}.pdf`,
    mimeType: response.headers.get('Content-Type') ?? 'application/pdf',
  };
}

export async function revokePatient(patientId: number) {
  const { token } = await accessToken('/pengaturan');

  try {
    await revokePartnerPatientApi(token, patientId);
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Gagal mencabut pasien';
    throw new Error(message);
  }

  revalidatePath('/pengaturan');
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (token) {
    await backendRequest('/auth/logout', { method: 'POST' }, token).catch(() => null);
  }
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  redirect('/login');
}
