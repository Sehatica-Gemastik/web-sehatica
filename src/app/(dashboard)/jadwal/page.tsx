import { JadwalView } from '@/app/(dashboard)/components/jadwal/jadwal-view';
import { accessToken } from '@/lib/backend';
import { getDoctorAppointments, getPartnerPatients } from '@/lib/doctor-api';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export const dynamic = 'force-dynamic';

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const params = await searchParams;
  const { token } = await accessToken('/jadwal');
  const patients = await getPartnerPatients(token);
  const requestedId = Number(params.patient);
  const activeId = patients.find((patient) => patient.id === requestedId)?.id ?? patients[0]?.id ?? null;

  const weekStart = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
  const weekEnd = dayjs().startOf('isoWeek').add(6, 'day').format('YYYY-MM-DD');
  const appointments = activeId
    ? await getDoctorAppointments(token, activeId, weekStart, weekEnd)
    : [];

  if (!activeId) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-neutral-500">
        Belum ada pasien partner untuk dijadwalkan.
      </div>
    );
  }

  return (
    <JadwalView
      key={activeId}
      patients={patients}
      activeId={activeId}
      initialAppointments={appointments}
    />
  );
}
