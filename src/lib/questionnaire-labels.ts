export const SEX_LABELS: Record<number, string> = {
  1: 'Laki-laki',
  2: 'Perempuan',
};

export const RACE_LABELS: Record<number, string> = {
  1: 'Hispanik / Latino (Meksiko)',
  2: 'Hispanik / Latino (lainnya)',
  3: 'Kulit putih',
  4: 'Kulit hitam / Afrika',
  6: 'Asia',
  7: 'Lainnya / campuran',
};

export const EDUCATION_LABELS: Record<number, string> = {
  1: 'Tidak tamat SD',
  2: 'SMP / sederajat',
  3: 'SMA / sederajat',
  4: 'Diploma / kuliah sebagian',
  5: 'Sarjana atau lebih',
};

export const INCOME_LABELS: Record<number, string> = {
  0.5: 'Sangat rendah',
  1: 'Rendah',
  2: 'Cukup',
  3: 'Menengah',
  4: 'Di atas rata-rata',
  5: 'Tinggi',
};

export const ALCOHOL_FREQUENCY_LABELS: Record<number, string> = {
  0: 'Tidak dalam setahun terakhir',
  1: 'Setiap hari',
  3: '3-4 kali seminggu',
  4: '2 kali seminggu',
  5: 'Seminggu sekali',
  6: '2-3 kali sebulan',
  7: 'Sebulan sekali',
  10: 'Jarang / 1-2 kali setahun',
};

export const BINGE_FREQUENCY_LABELS: Record<number, string> = {
  0: 'Tidak pernah',
  1: 'Hampir setiap hari',
  3: 'Beberapa kali seminggu',
  5: 'Seminggu sekali',
  7: 'Sebulan sekali atau kurang',
};

export function yesNoLabel(value: number | null | undefined) {
  if (value == null) return '-';
  return value === 1 ? 'Ya' : 'Tidak';
}

export function optionLabel(map: Record<number, string>, value: number | null | undefined) {
  if (value == null) return '-';
  return map[value] ?? String(value);
}

export function formatDateId(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTimeId(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
