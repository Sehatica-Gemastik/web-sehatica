import { cn } from '@/lib/utils';
import {
  formatPtmRiskScore,
  getPtmRiskBadgeClass,
} from '@/lib/ptm-risk';

type PtmRiskBadgeProps = {
  score: number;
  className?: string;
  compact?: boolean;
};

export function PtmRiskBadge({ score, className, compact = false }: PtmRiskBadgeProps) {
  const percent = score <= 1 ? score * 100 : score;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[11px] font-medium',
        getPtmRiskBadgeClass(percent),
        className,
      )}
    >
      {compact ? formatPtmRiskScore(score) : `PTM ${formatPtmRiskScore(score)}`}
    </span>
  );
}
