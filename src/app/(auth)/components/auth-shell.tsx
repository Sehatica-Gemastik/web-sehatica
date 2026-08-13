import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  visual: ReactNode;
  children: ReactNode;
  wide?: boolean;
};

export function AuthShell({ visual, children, wide = false }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-5 max-md:items-stretch max-md:p-3">
      <div className="grid h-[min(calc(100vh-40px),820px)] min-h-[560px] w-full max-w-[1040px] grid-cols-[minmax(0,1fr)_minmax(380px,1fr)] overflow-hidden rounded-xl border border-neutral-200 bg-white max-md:h-auto max-md:min-h-[calc(100vh-24px)] max-md:max-h-none max-md:grid-cols-1">
        {visual}
        <section className="h-full min-h-0 border-l border-neutral-200 max-md:border-l-0 max-md:border-t">
          <div className="h-full overflow-y-auto overscroll-contain px-9 py-10 max-md:h-auto max-md:max-h-none max-md:px-5 max-md:py-7">
            <div className={cn('mx-auto w-full', wide ? 'max-w-[440px]' : 'max-w-[400px]')}>
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
