import { PesanView } from '@/app/(dashboard)/components/pesan/pesan-view';
import { getDoctorSession } from '@/lib/backend';
import { getMockChatConversations, getMockMonitorPatients } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export default async function PesanPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  await getDoctorSession('/pesan');
  const params = await searchParams;
  const patients = getMockMonitorPatients();
  const conversations = getMockChatConversations();
  const requestedId = Number(params.patient);
  const activeId = patients.find((patient) => patient.id === requestedId)?.id ?? patients[0]?.id ?? 1;

  return (
    <PesanView
      patients={patients}
      conversations={conversations}
      activeId={activeId}
    />
  );
}
