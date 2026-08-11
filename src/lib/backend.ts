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

export type DoctorProfile = {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  specialty: string;
  feePerQna: string;
  rating: number;
  reviewCount: number;
  verifiedCount: number;
  isAvailable: boolean;
  bio: string | null;
  avatarInitials: string;
};

export type ReviewItem = {
  id: number;
  reviewId: number;
  clientMessageId: number;
  patientQuestion: string;
  aiResponse: string;
  safetyLevel: 'general' | 'review' | 'urgent';
  doctorItemNote: string | null;
  itemStatus: 'pending' | 'approved' | 'revised';
};

export type ReviewCase = {
  id: number;
  userId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string | null;
  patientQuestion: string;
  aiResponse: string;
  safetyLevel: 'general' | 'review' | 'urgent';
  patientNote: string | null;
  reviewScope: 'bubble' | 'session' | 'history';
  reviewType: 'paid' | 'voluntary';
  requestStatus: 'open_pool' | 'permission_requested' | 'accepted' | 'declined';
  isPaid: boolean;
  qnaCount: number;
  fee: string;
  status: 'pending' | 'approved' | 'revised';
  doctorNote: string | null;
  doctorSummaryNote: string | null;
  consentedAt: string;
  decidedAt: string | null;
  expiresAt: string;
  items: ReviewItem[];
};

export type VoluntaryPoolItem = {
  id: number;
  patientInitials: string;
  reviewScope: 'bubble' | 'session' | 'history';
  qnaCount: number;
  safetyLevel: 'general' | 'review' | 'urgent';
  requestStatus: 'open_pool';
  createdAt: string;
  expiresAt: string;
};

export type PatientUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatarInitials: string;
};

export async function backendRequest<T>(path: string, init: RequestInit = {}, token?: string) {
  try {
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
  } catch (err) {
    if (err instanceof BackendError) throw err;
    throw new BackendError(503, 'Gagal terhubung ke backend Sehatica (port 3000). Pastikan backend-sehatica sedang berjalan.');
  }
}

export async function accessToken(nextPath: string) {
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

export async function getDoctorProfile() {
  const { token } = await accessToken('/profile');
  try {
    return await backendRequest<DoctorProfile>('/doctors/me', {}, token);
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      redirect('/api/auth/refresh?next=%2Fprofile');
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

export async function getVoluntaryPool() {
  const { token } = await accessToken('/');
  try {
    return await backendRequest<VoluntaryPoolItem[]>('/reviews/voluntary-pool', {}, token);
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      redirect('/api/auth/refresh?next=%2F');
    }
    return [];
  }
}

export async function getPatientsList() {
  const { token } = await accessToken('/');
  try {
    return await backendRequest<PatientUser[]>('/doctors/patients', {}, token);
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      redirect('/api/auth/refresh?next=%2F');
    }
    return [];
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
