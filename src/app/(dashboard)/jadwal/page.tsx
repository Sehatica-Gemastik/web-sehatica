import { JadwalView } from '@/app/(dashboard)/components/jadwal/jadwal-view';
import { getDoctorSession } from '@/lib/backend';
import { getMockAppointments, getMockMonitorPatients } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  await getDoctorSession('/jadwal');
  const params = await searchParams;
  const patients = getMockMonitorPatients();
  const requestedId = Number(params.patient);
  const activeId = patients.find((patient) => patient.id === requestedId)?.id ?? patients[0]?.id ?? 1;
  const appointments = getMockAppointments(activeId);

  return (
    <JadwalView
      key={activeId}
      patients={patients}
      activeId={activeId}
      initialAppointments={appointments}
    />
  );
}
