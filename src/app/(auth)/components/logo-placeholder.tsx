import { SehaticaLogo } from '@/components/brand/sehatica-logo';
import { cn } from '@/lib/utils';

type LogoPlaceholderProps = {
  className?: string;
};

export function LogoPlaceholder({ className }: LogoPlaceholderProps) {
  return (
    <div className={cn('mb-8 flex justify-center', className)}>
      <SehaticaLogo variant="on-light" height={36} />
    </div>
  );
}
