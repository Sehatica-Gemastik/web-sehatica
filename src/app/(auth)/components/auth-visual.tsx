'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ColorBends = dynamic(() => import('@/components/three/color-blends'), { ssr: false });

type AuthVisualProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function AuthVisual({
  title,
  description,
  backHref,
  backLabel = 'Kembali',
}: AuthVisualProps) {
  return (
    <section className="relative h-full min-h-full overflow-hidden bg-sky-50 max-md:h-[280px] max-md:min-h-[280px]" aria-label="Sehatica untuk dokter">
      <div className="absolute inset-0" aria-hidden="true">
        <ColorBends
          colors={['#00A7B1', '#38BDF8', '#E0F7FA', '#FFFFFF']}
          rotation={90}
          speed={0.14}
          scale={1.1}
          frequency={1}
          warpStrength={0.85}
          mouseInfluence={0.5}
          noise={0.04}
          parallax={0.3}
          iterations={1}
          intensity={1.1}
          bandWidth={5}
          transparent
          autoRotate={0}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/55 to-white/92"
        aria-hidden="true"
      />

      {backHref ? (
        <Link
          href={backHref}
          className="relative z-[2] mt-6 ml-7 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-medium text-neutral-700 no-underline hover:text-neutral-900 max-md:ml-6"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          {backLabel}
        </Link>
      ) : null}

      <div className="absolute right-0 bottom-0 left-0 z-[2] max-w-[520px] p-9 pb-10 max-md:relative max-md:px-6 max-md:py-7">
        <h1 className="m-0 mb-3.5 text-[clamp(24px,2.8vw,36px)] leading-[1.12] font-semibold tracking-tight text-neutral-900 max-md:text-2xl">
          {title}
        </h1>
        <p className="m-0 max-w-[480px] text-sm leading-relaxed text-neutral-600">{description}</p>
      </div>
    </section>
  );
}
