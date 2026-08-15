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
  deleteDoctorAppointmentApi,
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
