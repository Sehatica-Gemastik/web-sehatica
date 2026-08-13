import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center font-medium cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        outline: 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
        ghost: 'border-0 bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
        secondary: 'border border-neutral-200 bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
      },
      size: {
        xs: 'gap-1 rounded-md px-2 py-1 text-[11px] leading-none',
        sm: 'gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] leading-none',
        md: 'h-10 gap-2 rounded px-4 text-sm leading-none',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'xs',
    },
  },
);

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
