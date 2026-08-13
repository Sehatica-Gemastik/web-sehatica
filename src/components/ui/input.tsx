import { cn } from '@/lib/utils';

export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 shadow-none placeholder:text-neutral-400 focus:border-neutral-200 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-neutral-500',
        className,
      )}
      {...props}
    />
  );
}
