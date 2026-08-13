'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquare,
  UserRound,
} from 'lucide-react';
import { logout } from '@/app/actions';
import { Avatar } from '@/components/ui/avatar';
import { SehaticaLogo } from '@/components/brand/sehatica-logo';
import { cn } from '@/lib/utils';
import type { DoctorSession } from '@/lib/backend';

const NAV = [
  { href: '/', label: 'Monitor', icon: Activity },
  { href: '/pesan', label: 'Pesan', icon: MessageSquare },
  { href: '/jadwal', label: 'Jadwal', icon: CalendarDays },
  { href: '/profil', label: 'Profil', icon: UserRound },
] as const;

type DashboardShellProps = {
  doctor: DoctorSession;
  children: React.ReactNode;
};

export function DashboardShell({ doctor, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isJadwal = pathname.startsWith('/jadwal');
  const isPesan = pathname.startsWith('/pesan');
  const isProfil = pathname.startsWith('/profil');
  const isFullBleed = isJadwal || isPesan || isProfil;

  return (
    <div
      className={cn(
        'grid h-dvh gap-3 overflow-hidden bg-neutral-100 p-3 max-md:grid-cols-[56px_minmax(0,1fr)] max-md:p-2',
        collapsed ? 'grid-cols-[56px_minmax(0,1fr)]' : 'grid-cols-[240px_minmax(0,1fr)]',
      )}
    >
      <aside
        className={cn(
          'flex h-[calc(100dvh-24px)] flex-col overflow-hidden py-3 max-md:h-[calc(100dvh-16px)]',
          collapsed ? 'px-1.5' : 'px-2.5',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-2 pb-4',
            collapsed && 'flex-col items-center pb-3.5',
          )}
        >
          <div className={cn('flex min-w-0 items-center gap-2.5', collapsed && 'justify-center')}>
            <SehaticaLogo
              href="/"
              variant="on-light"
              height={collapsed ? 24 : 28}
              crop={collapsed}
            />
          </div>
          <button
            type="button"
            className={cn(
              'grid h-7 w-7 cursor-pointer place-items-center rounded border-0 bg-transparent text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900',
              collapsed && 'w-8',
            )}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="grid min-h-0 flex-1 content-start gap-1" aria-label="Navigasi dokter">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center rounded-md text-sm font-medium no-underline transition-colors',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2.5',
                  active
                    ? 'bg-black/4 font-semibold'
                    : 'bg-transparent text-neutral-600 hover:bg-black/2 hover:font-semibold',
                )}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} strokeWidth={1.75} />
                {!collapsed ? <span>{label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className={cn('grid gap-2.5 pt-3', collapsed && 'justify-items-center')}>
          <Link
            href="/profil"
            className={cn(
              'flex w-full items-center rounded-lg no-underline hover:bg-black/5',
              collapsed ? 'justify-center px-0 py-2' : 'gap-2 px-2.5 py-2',
            )}
          >
            <Avatar initials={doctor.avatarInitials ?? 'DR'} size="sm" />
            {!collapsed ? (
              <span className="min-w-0 truncate text-xs font-semibold text-neutral-900">{doctor.name}</span>
            ) : null}
          </Link>
          <form action={logout} className="w-full">
            <button
              type="submit"
              className={cn(
                'flex w-full cursor-pointer items-center rounded-lg border-0 bg-red-600/5 text-xs text-red-600 hover:bg-red-600/10',
                collapsed ? 'justify-center px-0 py-2' : 'gap-2 px-2.5 py-2',
              )}
              title="Keluar"
            >
              <LogOut size={16} />
              {!collapsed ? <span>Keluar</span> : null}
            </button>
          </form>
        </div>
      </aside>

      <div className="min-h-0 h-[calc(100dvh-24px)] min-w-0 overflow-hidden max-md:h-[calc(100dvh-16px)]">
        <main
          className={cn(
            'h-full min-h-0 overscroll-contain rounded-lg bg-white',
            isProfil
              ? 'overflow-hidden'
              : isFullBleed
                ? 'overflow-hidden'
                : 'overflow-y-auto px-8 py-7 max-md:rounded-xl max-md:px-4 max-md:py-5',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
