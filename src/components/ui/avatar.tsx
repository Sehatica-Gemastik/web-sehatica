import { cn } from '@/lib/utils';

const sizeClass = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
} as const;

type AvatarProps = {
  initials: string;
  size?: keyof typeof sizeClass;
  className?: string;
};

export function Avatar({ initials, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-neutral-100 font-bold text-neutral-700',
        sizeClass[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
