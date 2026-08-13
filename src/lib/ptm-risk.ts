export type PtmRiskLevel = 'normal' | 'moderate' | 'high';

export function getPtmRiskLevel(score: number): PtmRiskLevel {
  const percent = score <= 1 ? score * 100 : score;
  if (percent >= 70) return 'high';
  if (percent >= 55) return 'moderate';
  return 'normal';
}

export function formatPtmRiskScore(score: number): string {
  const percent = score <= 1 ? Math.round(score * 100) : Math.round(score);
  return `${percent}%`;
}

export function getPtmRiskBadgeClass(percent: number): string {
  if (percent >= 70) return 'bg-red-100 text-red-700';
  if (percent >= 55) return 'bg-orange-100 text-orange-700';
  return 'bg-teal-100 text-teal-700';
}

export function getPtmRiskLabel(level: PtmRiskLevel): string {
  switch (level) {
    case 'high':
      return 'Tinggi';
    case 'moderate':
      return 'Lumayan';
    default:
      return 'Normal';
  }
}
