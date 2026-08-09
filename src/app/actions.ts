'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  ACCESS_COOKIE,
  BackendError,
  REFRESH_COOKIE,
  backendRequest,
  sessionCookieOptions,
} from '@/lib/backend';

type AuthPayload = {
  user: { id: number; name: string; role: 'user' | 'doctor' | 'admin' };
  accessToken: string;
  refreshToken: string;
};

type RefreshedTokens = { accessToken: string; refreshToken: string };

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

async function reviewRequest(path: string, body: unknown) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect('/login');

  try {
    return await backendRequest(path, { method: 'PATCH', body: JSON.stringify(body) }, accessToken);
  } catch (error) {
    if (!(error instanceof BackendError) || error.status !== 401) throw error;
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) redirect('/login?expired=1');
    const refreshed = await backendRequest<RefreshedTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    await saveTokens(refreshed.accessToken, refreshed.refreshToken);
    accessToken = refreshed.accessToken;
    return backendRequest(path, { method: 'PATCH', body: JSON.stringify(body) }, accessToken);
  }
}

export async function decideReview(formData: FormData) {
  const id = Number(formData.get('reviewId'));
  const status = String(formData.get('status') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!Number.isInteger(id) || (status !== 'approved' && status !== 'revised')) {
    redirect('/?error=Keputusan+tidak+valid');
  }

  try {
    await reviewRequest(`/reviews/${id}`, { status, note });
  } catch (error) {
    const message = error instanceof BackendError ? error.message : 'Keputusan tidak dapat disimpan';
    redirect(`/?case=${id}&error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/');
  redirect(`/?case=${id}&updated=1`);
}
