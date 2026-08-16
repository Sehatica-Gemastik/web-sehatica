import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type {
  DailyQuestionnaireLog,
  DoctorAppointment,
  DoctorProfile,
  MonitorPatientDetail,
  MonitorPatientSummary,
  MonitorQuestionnaireItem,
  PatientIdentity,
  PatientWeeklyCheckin,
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

function buildDailyLog(
  date: string,
  profile: {
    sedentaryMinutes: number;
    totalActivityMinutes: number;
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
    satFat: number;
    sodium: number;
    fiber: number;
    cholesterol: number;
    alcoholEver: number;
    alcoholFrequency?: number;
    alcoholDrinks?: number;
    alcoholBinge?: number;
    mealsCount: number;
    aiSummary: string;
  },
): DailyQuestionnaireLog {
  const completedAt = `${date}T07:30:00.000Z`;
  return {
    date,
    completedAt,
    vigorousWork: 0,
    vigorousWorkDays: 0,
    vigorousWorkMinutes: 0,
    moderateWork: 1,
    moderateWorkDays: 3,
    moderateWorkMinutes: 45,
    transportWalkingBiking: 1,
    transportDays: 2,
    transportMinutes: 30,
    vigorousRecreation: profile.totalActivityMinutes > 60 ? 1 : 0,
    vigorousRecreationDays: profile.totalActivityMinutes > 60 ? 2 : 0,
    vigorousRecreationMinutes: profile.totalActivityMinutes > 60 ? 40 : 0,
    moderateRecreation: 1,
    moderateRecreationDays: 2,
    moderateRecreationMinutes: 30,
    sedentaryMinutes: profile.sedentaryMinutes,
    totalActivityMinutes: profile.totalActivityMinutes,
    caloriesDay1: profile.calories,
    proteinGDay1: profile.protein,
    carbohydrateGDay1: profile.carbs,
    sugarGDay1: profile.sugar,
    totalFatGDay1: profile.fat,
    saturatedFatGDay1: profile.satFat,
    sodiumMgDay1: profile.sodium,
    fiberGDay1: profile.fiber,
    cholesterolMgDay1: profile.cholesterol,
    alcoholEver: profile.alcoholEver,
    alcoholFrequency: profile.alcoholFrequency ?? null,
    alcoholDrinksPerDay: profile.alcoholDrinks ?? null,
    alcoholBingeFrequency: profile.alcoholBinge ?? null,
    mealsCount: profile.mealsCount,
    aiSummary: profile.aiSummary,
  };
}

const PATIENT_IDENTITIES: Record<number, PatientIdentity> = {
  1: {
    age: 58,
    sex: 1,
    raceEthnicity: 6,
    education: 3,
    incomePovertyRatio: 2,
    completedAt: `${daysAgo(120)}T10:00:00.000Z`,
  },
  2: {
    age: 45,
    sex: 2,
    raceEthnicity: 6,
    education: 5,
    incomePovertyRatio: 3,
    completedAt: `${daysAgo(90)}T09:00:00.000Z`,
  },
  3: {
    age: 60,
    sex: 1,
    raceEthnicity: 6,
    education: 4,
    incomePovertyRatio: 2,
    completedAt: `${daysAgo(60)}T08:00:00.000Z`,
  },
};

const PATIENT_WEEKLY: Record<number, PatientWeeklyCheckin> = {
  1: {
    weightKg: 78,
    heightCm: 168,
    bmi: 27.6,
    waistCm: 92,
    systolicBp: 138,
    diastolicBp: 86,
    completedAt: `${daysAgo(3)}T06:00:00.000Z`,
  },
  2: {
    weightKg: 65,
    heightCm: 162,
    bmi: 24.8,
    waistCm: 78,
    systolicBp: 122,
    diastolicBp: 78,
    completedAt: `${daysAgo(5)}T07:00:00.000Z`,
  },
  3: {
    weightKg: 82,
    heightCm: 170,
    bmi: 28.4,
    waistCm: 96,
    systolicBp: 148,
    diastolicBp: 92,
    completedAt: `${daysAgo(1)}T06:30:00.000Z`,
  },
};

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
    identity: PATIENT_IDENTITIES[1],
    weekly: PATIENT_WEEKLY[1],
    dailyLogs: {
      [daysAgo(0)]: buildDailyLog(daysAgo(0), {
        sedentaryMinutes: 420,
        totalActivityMinutes: 75,
        calories: 1850,
        protein: 72,
        carbs: 210,
        sugar: 48,
        fat: 62,
        satFat: 18,
        sodium: 2100,
        fiber: 22,
        cholesterol: 180,
        alcoholEver: 0,
        mealsCount: 3,
        aiSummary:
          'Pasien melaporkan aktivitas sedang rutin dan asupan kalori moderat. Gula dan natrium masih di atas target harian — pertimbangkan edukasi pola makan rendah garam dan kurangi minuman manis.',
      }),
      [daysAgo(1)]: buildDailyLog(daysAgo(1), {
        sedentaryMinutes: 480,
        totalActivityMinutes: 45,
        calories: 1920,
        protein: 68,
        carbs: 225,
        sugar: 55,
        fat: 65,
        satFat: 20,
        sodium: 2300,
        fiber: 18,
        cholesterol: 195,
        alcoholEver: 0,
        mealsCount: 2,
        aiSummary:
          'Hari ini waktu duduk lebih lama dan aktivitas fisik menurun. Asupan gula dan natrium sedikit meningkat dibanding rata-rata — pantau konsistensi pengisian kuisioner besok.',
      }),
    },
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
        fileUrl: null,
        createdAt: `${daysAgo(2)}T08:30:00.000Z`,
      },
      {
        id: 2,
        title: 'Rekam Konsultasi DM',
        type: 'consultation',
        recordDate: daysAgo(9),
        summary: 'Kontrol gula darah puasa dan HbA1c.',
        source: 'record',
        fileUrl: null,
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
    identity: PATIENT_IDENTITIES[2],
    weekly: PATIENT_WEEKLY[2],
    dailyLogs: {},
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
        fileUrl: null,
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
    identity: PATIENT_IDENTITIES[3],
    weekly: PATIENT_WEEKLY[3],
    dailyLogs: {
      [daysAgo(0)]: buildDailyLog(daysAgo(0), {
        sedentaryMinutes: 360,
        totalActivityMinutes: 90,
        calories: 1750,
        protein: 80,
        carbs: 190,
        sugar: 35,
        fat: 58,
        satFat: 15,
        sodium: 1900,
        fiber: 28,
        cholesterol: 165,
        alcoholEver: 1,
        alcoholFrequency: 6,
        alcoholDrinks: 2,
        alcoholBinge: 0,
        mealsCount: 4,
        aiSummary:
          'Aktivitas fisik cukup baik dengan waktu duduk terkendali. Asupan serat memadai, namun tekanan darah dari cek mingguan masih tinggi — lanjutkan pantau garam dan konsumsi alkohol sesekali.',
      }),
      [daysAgo(2)]: buildDailyLog(daysAgo(2), {
        sedentaryMinutes: 390,
        totalActivityMinutes: 60,
        calories: 1800,
        protein: 75,
        carbs: 200,
        sugar: 40,
        fat: 60,
        satFat: 16,
        sodium: 2000,
        fiber: 24,
        cholesterol: 170,
        alcoholEver: 0,
        mealsCount: 3,
        aiSummary:
          'Pola makan relatif seimbang dengan aktivitas sedang. Tidak ada konsumsi alkohol dilaporkan — pertahankan konsistensi pengisian harian.',
      }),
    },
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
        fileUrl: null,
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

export function getLatestDailyAiSummary(
  patientId: number,
): { date: string; summary: string } | null {
  const detail = MOCK_DETAILS[patientId];
  if (!detail) return null;

  for (let index = detail.questionnaireDays.length - 1; index >= 0; index -= 1) {
    const day = detail.questionnaireDays[index];
    if (!day.filled) continue;
    const log = getMockDailyQuestionnaireLog(patientId, day.date);
    if (log) return { date: day.date, summary: log.aiSummary };
  }

  return null;
}

export function getMockDailyQuestionnaireLog(
  patientId: number,
  date: string,
): DailyQuestionnaireLog | null {
  const detail = MOCK_DETAILS[patientId];
  if (!detail) return null;

  const explicit = detail.dailyLogs[date];
  if (explicit) return explicit;

  const day = detail.questionnaireDays.find((entry) => entry.date === date);
  if (!day?.filled) return null;

  return buildDailyLog(date, {
    sedentaryMinutes: 400 + (patientId * 10),
    totalActivityMinutes: 50 + (patientId * 5),
    calories: 1800,
    protein: 70,
    carbs: 200,
    sugar: 42,
    fat: 60,
    satFat: 17,
    sodium: 2050,
    fiber: 20,
    cholesterol: 175,
    alcoholEver: 0,
    mealsCount: 3,
    aiSummary:
      'Mock ai summary',
  });
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
