import { DashboardShell } from '@/app/(dashboard)/components/dashboard/dashboard-shell';
import { getDoctorSession } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doctor = await getDoctorSession('/');
  return <DashboardShell doctor={doctor}>{children}</DashboardShell>;
}
