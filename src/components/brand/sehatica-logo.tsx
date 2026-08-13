import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type SehaticaLogoVariant = 'on-light' | 'on-dark';

type SehaticaLogoProps = {
  variant?: SehaticaLogoVariant;
  className?: string;
  height?: number;
  href?: string;
  crop?: boolean;
};

const LOGO_ASPECT = 529 / 135;

export function SehaticaLogo({
  variant = 'on-light',
  className,
  height = 32,
  href,
  crop = false,
}: SehaticaLogoProps) {
  const src = variant === 'on-dark' ? '/sehatica-w.svg' : '/sehatica-g.svg';
  const width = Math.round(height * LOGO_ASPECT);

  const image = (
    <Image
      src={src}
      alt="Sehatica"
      width={width}
      height={height}
      className={cn('block h-auto max-w-none', className)}
      priority
    />
  );

  const content = crop ? (
    <div className="overflow-hidden" style={{ width: height * 1.05, height }}>
      {image}
    </div>
  ) : (
    image
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
