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

export type QuestionnaireDay = {
  date: string;
  filled: boolean;
  intensity?: 0 | 1 | 2 | 3 | 4;
};

export type MonitorPatientSummary = {
  id: number;
  name: string;
  avatarInitials: string;
  age: number | null;
  lastSyncAt: string | null;
  overallRiskScore: number;
};

export type DoctorAppointment = {
  id: string;
  patientId: number;
  title: string;
  notes: string;
  start: string;
  end: string;
};

export type ChatMessageRole = 'user' | 'doctor';

export type ChatMessage = {
  id: number;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
};

export type ChatConversation = {
  patientId: number;
  unreadCount: number;
  messages: ChatMessage[];
};

export type PtmTrendPoint = {
  date: string;
  overall: number;
  diabetes: number;
  hypertension: number;
  heart_disease: number;
  stroke: number;
};

export type MonitorRecordItem = {
  id: number;
  title: string;
  type: string;
  recordDate: string | null;
  summary: string | null;
  source: 'transfer' | 'record';
  createdAt: string;
};

export type MonitorQuestionnaireItem = {
  date: string;
  screeningDone: boolean;
  dailyLogCount: number;
  factors: string[];
  syncedAt: string;
};

export type MonitorPatientDetail = MonitorPatientSummary & {
  ptmTrend: PtmTrendPoint[];
  latestOverallScore: number;
  records: MonitorRecordItem[];
  questionnaireDays: QuestionnaireDay[];
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

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
