import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type {
  DoctorAppointment,
  DoctorProfile,
  MonitorPatientDetail,
  MonitorPatientSummary,
  MonitorQuestionnaireItem,
  PtmTrendPoint,
  QuestionnaireDay,
} from './backend';

dayjs.extend(isoWeek);

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function clamp(value: number, min = 0.08, max = 0.95) {
  return Math.min(max, Math.max(min, value));
}

type DiseaseProfile = {
  overall: number;
  diabetes: number;
  hypertension: number;
  heart_disease: number;
  stroke: number;
  seed: number;
};

function buildDailyTrend(profile: DiseaseProfile): PtmTrendPoint[] {
  return Array.from({ length: 365 }, (_, index) => {
    const offset = 364 - index;
    const date = daysAgo(offset);
    const seasonal = Math.sin((offset + profile.seed) / 18) * 0.1;
    const weekly = Math.cos((offset + profile.seed) / 5) * 0.06;
    const noise = (((offset + profile.seed) * 13) % 9 - 4) / 100;

    return {
      date,
      overall: clamp(profile.overall + seasonal * 0.5 + weekly + noise),
      diabetes: clamp(profile.diabetes + seasonal + weekly * 0.8 + noise * 1.2),
      hypertension: clamp(profile.hypertension + seasonal * 0.7 + weekly * 0.5 + noise),
      heart_disease: clamp(profile.heart_disease + seasonal * 0.9 + weekly + noise * 0.8),
      stroke: clamp(profile.stroke + seasonal * 1.1 + weekly * 0.6 + noise),
    };
  });
}

function buildQuestionnaireDays(
  seed: number,
  entries: MonitorQuestionnaireItem[],
): QuestionnaireDay[] {
  const known = new Map(entries.map((entry) => [entry.date, entry]));

  return Array.from({ length: 365 }, (_, index) => {
    const offset = 364 - index;
    const date = daysAgo(offset);
    const entry = known.get(date);

    if (entry) {
      const intensity = entry.screeningDone
        ? (Math.min(4, Math.max(1, entry.dailyLogCount)) as 1 | 2 | 3 | 4)
        : 0;
      return {
        date,
        filled: entry.screeningDone,
        intensity,
      };
    }

    const filled = (seed + offset) % 4 !== 0;
    const intensity = filled
      ? (((seed + offset) % 4) + 1) as 1 | 2 | 3 | 4
      : 0;

    return { date, filled, intensity };
  });
}

const PATIENT_PROFILES: Record<number, DiseaseProfile> = {
  1: {
    overall: 0.64,
    diabetes: 0.86,
    hypertension: 0.58,
    heart_disease: 0.34,
    stroke: 0.21,
    seed: 2,
  },
  2: {
    overall: 0.49,
    diabetes: 0.27,
    hypertension: 0.41,
    heart_disease: 0.82,
    stroke: 0.29,
    seed: 5,
  },
  3: {
    overall: 0.73,
    diabetes: 0.52,
    hypertension: 0.61,
    heart_disease: 0.44,
    stroke: 0.91,
    seed: 9,
  },
};

const MOCK_PATIENTS: MonitorPatientSummary[] = [
  {
    id: 1,
    name: 'Demo User',
    avatarInitials: 'DU',
    age: 58,
    lastSyncAt: new Date().toISOString(),
    overallRiskScore: PATIENT_PROFILES[1].overall,
  },
  {
    id: 2,
    name: 'Sehatica',
    avatarInitials: 'SE',
    age: 45,
    lastSyncAt: daysAgo(1),
    overallRiskScore: PATIENT_PROFILES[2].overall,
  },
  {
    id: 3,
    name: 'Muhammad Rizain Firdaus',
    avatarInitials: 'MR',
    age: 60,
    lastSyncAt: daysAgo(0),
    overallRiskScore: PATIENT_PROFILES[3].overall,
  },
];

const MOCK_DETAILS: Record<number, Omit<MonitorPatientDetail, keyof MonitorPatientSummary>> = {
  1: {
    ptmTrend: buildDailyTrend(PATIENT_PROFILES[1]),
    latestOverallScore: PATIENT_PROFILES[1].overall,
    records: [
      {
        id: 1,
        title: 'Hasil Lab Glukosa',
        type: 'transfer',
        recordDate: daysAgo(2),
        summary: 'Transfer offline dari perangkat pasien via Bluetooth.',
        source: 'transfer',
        createdAt: `${daysAgo(2)}T08:30:00.000Z`,
      },
      {
        id: 2,
        title: 'Rekam Konsultasi DM',
        type: 'consultation',
        recordDate: daysAgo(9),
        summary: 'Kontrol gula darah puasa dan HbA1c.',
        source: 'record',
        createdAt: `${daysAgo(9)}T11:00:00.000Z`,
      },
    ],
    questionnaireDays: buildQuestionnaireDays(2, [
      {
        date: daysAgo(0),
        screeningDone: true,
        dailyLogCount: 3,
        factors: ['diabetes:0.86', 'hypertension:0.58'],
        syncedAt: new Date().toISOString(),
      },
      {
        date: daysAgo(1),
        screeningDone: true,
        dailyLogCount: 2,
        factors: ['sedentary tinggi', 'asupan gula'],
        syncedAt: `${daysAgo(1)}T07:15:00.000Z`,
      },
    ]),
  },
  2: {
    ptmTrend: buildDailyTrend(PATIENT_PROFILES[2]),
    latestOverallScore: PATIENT_PROFILES[2].overall,
    records: [
      {
        id: 3,
        title: 'EKG Resting',
        type: 'image',
        recordDate: daysAgo(4),
        summary: 'Dokumen hasil pemeriksaan jantung.',
        source: 'record',
        createdAt: `${daysAgo(4)}T14:20:00.000Z`,
      },
    ],
    questionnaireDays: buildQuestionnaireDays(5, [
      {
        date: daysAgo(0),
        screeningDone: false,
        dailyLogCount: 1,
        factors: ['heart_disease:0.82'],
        syncedAt: `${daysAgo(0)}T06:40:00.000Z`,
      },
    ]),
  },
  3: {
    ptmTrend: buildDailyTrend(PATIENT_PROFILES[3]),
    latestOverallScore: PATIENT_PROFILES[3].overall,
    records: [
      {
        id: 4,
        title: 'Resume Rawat Jalan',
        type: 'note',
        recordDate: daysAgo(1),
        summary: 'Resume kontrol PTM dan rekomendasi gaya hidup.',
        source: 'transfer',
        createdAt: `${daysAgo(1)}T16:05:00.000Z`,
      },
    ],
    questionnaireDays: buildQuestionnaireDays(9, [
      {
        date: daysAgo(0),
        screeningDone: true,
        dailyLogCount: 4,
        factors: ['stroke:0.91', 'hypertension:0.61', 'diabetes:0.52'],
        syncedAt: new Date().toISOString(),
      },
      {
        date: daysAgo(2),
        screeningDone: true,
        dailyLogCount: 3,
        factors: ['tekanan darah tinggi', 'aktivitas rendah'],
        syncedAt: `${daysAgo(2)}T09:00:00.000Z`,
      },
    ]),
  },
};

function appointmentDate(dayOffsetInWeek: number, startHour: number, endHour: number): { start: string; end: string } {
  const start = dayjs().startOf('isoWeek').add(dayOffsetInWeek, 'day').hour(startHour).minute(0).second(0).millisecond(0);
  const end = start.hour(endHour).minute(0).second(0).millisecond(0);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

const MOCK_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: 'apt-1',
    patientId: 1,
    title: 'Kontrol gula darah',
    notes: 'Bawa hasil lab terbaru.',
    ...appointmentDate(1, 9, 11),
  },
  {
    id: 'apt-2',
    patientId: 1,
    title: 'Follow-up diet',
    notes: 'Review catatan makan 7 hari terakhir.',
    ...appointmentDate(3, 14, 16),
  },
  {
    id: 'apt-3',
    patientId: 2,
    title: 'Konsultasi jantung',
    notes: 'Evaluasi gejala sesak ringan.',
    ...appointmentDate(2, 10, 12),
  },
  {
    id: 'apt-4',
    patientId: 3,
    title: 'Kontrol stroke risk',
    notes: 'Cek tekanan darah dan aktivitas fisik.',
    ...appointmentDate(4, 19, 21),
  },
];

export function getMockMonitorPatients(): MonitorPatientSummary[] {
  return MOCK_PATIENTS;
}

export function getMockMonitorPatientDetail(patientId: number): MonitorPatientDetail | null {
  const summary = MOCK_PATIENTS.find((p) => p.id === patientId);
  const detail = MOCK_DETAILS[patientId];
  if (!summary || !detail) return null;
  return { ...summary, ...detail };
}

export function getMockAppointments(patientId: number): DoctorAppointment[] {
  return MOCK_APPOINTMENTS.filter((appointment) => appointment.patientId === patientId);
}

export function getMockDoctorProfile(session: {
  id: number;
  name: string;
  avatarInitials: string | null;
}): DoctorProfile {
  return {
    id: 1,
    userId: session.id,
    name: session.name,
    email: 'dokter@sehatica.test',
    phone: '+6281234567890',
    specialty: 'Dokter Umum',
    feePerQna: '25000',
    rating: 4.8,
    reviewCount: 12,
    verifiedCount: 10,
    isAvailable: true,
    bio: 'Praktik di klinik Sehatica, fokus PTM dan edukasi gaya hidup.',
    avatarInitials: session.avatarInitials ?? 'DR',
  };
}
