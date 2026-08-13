import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[88px] resize-none w-full rounded border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm leading-relaxed text-neutral-900 shadow-none placeholder:text-neutral-400 focus:border-neutral-200 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-neutral-500',
        className,
      )}
      {...props}
    />
  );
}
