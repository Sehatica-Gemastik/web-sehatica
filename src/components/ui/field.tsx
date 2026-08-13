import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Field = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function Field({ className, ...props }, ref) {
    return <div ref={ref} className={cn('grid gap-1.5', className)} {...props} />;
  },
);

export function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('inline-flex items-center gap-0.5 text-xs font-medium text-neutral-900', className)}
      {...props}
    />
  );
}

export function FieldHint({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('ml-auto text-[11px] font-normal text-neutral-500', className)} {...props} />;
}

export function FieldHelp({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('m-0 text-[11px] text-neutral-500', className)} {...props} />;
}

export function FieldRequired({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('text-neutral-500', className)} {...props} />;
}
