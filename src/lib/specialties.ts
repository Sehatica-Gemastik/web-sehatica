export const MEDICAL_SPECIALTIES = [
  'Dokter Umum',
  'Penyakit Dalam',
  'Anak',
  'Kandungan & Kebidanan',
  'Bedah',
  'Jantung & Pembuluh Darah',
  'Paru',
  'Kulit & Kelamin',
  'Saraf',
  'Psikiatri',
  'Mata',
  'THT',
  'Orthopedi',
  'Urologi',
  'Gigi & Mulut',
  'Radiologi',
  'Anestesi',
  'Patologi Klinik',
  'Rehabilitasi Medik',
  'Lainnya',
] as const;

export type MedicalSpecialty = (typeof MEDICAL_SPECIALTIES)[number];

export const PHONE_COUNTRY_CODES = [
  { code: '+62', label: 'Indonesia', flag: '🇮🇩' },
  { code: '+65', label: 'Singapura', flag: '🇸🇬' },
  { code: '+60', label: 'Malaysia', flag: '🇲🇾' },
  { code: '+1', label: 'Amerika Serikat', flag: '🇺🇸' },
  { code: '+44', label: 'Inggris', flag: '🇬🇧' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
] as const;
