import { cn } from '@/lib/utils';

type LogoPlaceholderProps = {
  className?: string;
};

export function LogoPlaceholder({ className }: LogoPlaceholderProps) {
  return (
    <div className={cn('mb-8 flex items-center justify-center gap-2.5', className)} aria-label="Logo Sehatica">
      <div
        className="grid h-7 w-7 place-items-center rounded-md border border-teal-100 bg-teal-50 text-sm font-bold text-teal-700"
        aria-hidden="true"
      />
      <span className="text-[15px] font-semibold tracking-tight text-neutral-900">Sehatica</span>
    </div>
  );
}
