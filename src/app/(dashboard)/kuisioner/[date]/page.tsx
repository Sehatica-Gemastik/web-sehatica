import { notFound } from 'next/navigation';
import { DailyQuestionnaireDetail } from '@/app/(dashboard)/components/monitor/daily-questionnaire-detail';
import { accessToken } from '@/lib/backend';
import { getDailyQuestionnaireLog, getPartnerPatients } from '@/lib/doctor-api';

export const dynamic = 'force-dynamic';

export default async function KuisionerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ patient?: string }>;
}) {
  const { date } = await params;
  const { patient: patientParam } = await searchParams;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const { token } = await accessToken(`/kuisioner/${date}`);
  const patients = await getPartnerPatients(token);
  const requestedId = Number(patientParam);
  const patientId = patients.find((p) => p.id === requestedId)?.id ?? patients[0]?.id ?? null;
  if (!patientId) notFound();

  const patient = patients.find((p) => p.id === patientId);
  let log;
  try {
    log = await getDailyQuestionnaireLog(token, patientId, date);
  } catch {
    notFound();
  }

  if (!log || !patient) notFound();

  return (
    <DailyQuestionnaireDetail
      log={log}
      patientName={patient.name}
      backHref={`/?patient=${patientId}`}
    />
  );
}
