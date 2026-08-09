import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000/api/v1';
export const ACCESS_COOKIE = 'sehatica_doctor_access';
export const REFRESH_COOKIE = 'sehatica_doctor_refresh';

type Envelope<T> = { success: boolean; data?: T; error?: string };

export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type DoctorSession = {
  id: number;
  name: string;
  role: 'user' | 'doctor' | 'admin';
  avatarInitials: string | null;
};

export type ReviewCase = {
  id: number;
  patientName: string;
  patientQuestion: string;
  aiResponse: string;
  safetyLevel: 'review' | 'urgent';
  patientNote: string | null;
  status: 'pending' | 'approved' | 'revised';
  doctorNote: string | null;
  consentedAt: string;
  decidedAt: string | null;
  expiresAt: string;
};

export async function backendRequest<T>(path: string, init: RequestInit = {}, token?: string) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null) as Envelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new BackendError(response.status, payload?.error ?? 'Layanan dokter tidak tersedia');
  }
  return payload.data as T;
}

async function accessToken(nextPath: string) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect('/login');
  return { token, nextPath };
}

export async function getDoctorSession(nextPath = '/') {
  const { token } = await accessToken(nextPath);
  try {
    const user = await backendRequest<DoctorSession>('/auth/me', {}, token);
    if (user.role !== 'doctor') redirect('/login?error=Akun+ini+bukan+akun+dokter');
    return user;
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      redirect(`/api/auth/refresh?next=${encodeURIComponent(nextPath)}`);
    }
    throw error;
  }
}

export async function getAssignedReviews() {
  const { token } = await accessToken('/');
  try {
    return await backendRequest<ReviewCase[]>('/reviews/assigned', {}, token);
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      redirect('/api/auth/refresh?next=%2F');
    }
    throw error;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
