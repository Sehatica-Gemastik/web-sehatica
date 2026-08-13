import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('rounded px-3 py-2.5 text-[13px] leading-snug', {
  variants: {
    variant: {
      error: 'border border-red-200 bg-red-50 text-red-700',
      success: 'border border-teal-200 bg-teal-50 text-teal-700',
    },
  },
  defaultVariants: {
    variant: 'error',
  },
});

type AlertProps = React.ComponentProps<'div'> & VariantProps<typeof alertVariants>;

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
