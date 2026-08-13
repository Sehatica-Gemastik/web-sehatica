import { cn } from '@/lib/utils';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'secondary' | 'outline';
  className?: string;
};

export function Badge({ children, variant = 'secondary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-snug',
        variant === 'outline'
          ? 'border border-neutral-200 bg-white text-neutral-600'
          : 'bg-neutral-100 text-neutral-600',
        className,
      )}
    >
      {children}
    </span>
  );
}
