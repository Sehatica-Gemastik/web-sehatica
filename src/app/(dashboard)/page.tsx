import { PatientPicker } from '@/app/(dashboard)/components/monitor/patient-picker';
import { PtmCharts } from '@/app/(dashboard)/components/monitor/ptm-charts';
import { QuestionnaireContribution } from '@/app/(dashboard)/components/monitor/questionnaire-contribution';
import { RecordsList } from '@/app/(dashboard)/components/monitor/records-list';
import { ShowQrButton } from '@/app/(dashboard)/components/monitor/show-qr-button';
import { Badge } from '@/components/ui/badge';
import { getDoctorSession } from '@/lib/backend';
import {
  getMockDoctorProfile,
  getMockMonitorPatientDetail,
  getMockMonitorPatients,
} from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export default async function MonitorPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const params = await searchParams;
  const session = await getDoctorSession('/');
  const doctor = getMockDoctorProfile(session);
  const patients = getMockMonitorPatients();
  const requestedId = Number(params.patient);
  const activeId = patients.find((p) => p.id === requestedId)?.id ?? patients[0]?.id ?? null;
  const detail = activeId ? getMockMonitorPatientDetail(activeId) : null;

  return (
    <div className="grid w-full gap-7">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Overview pasien partner</h1>
          <Badge variant="outline" className="mt-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-700">
            {patients.length} pasien
          </Badge>
        </div>
        <ShowQrButton doctorId={doctor.id} doctorName={doctor.name} />
      </header>

      {detail ? (
        <>
          <section className="-mt-2">
            <PatientPicker patients={patients} activeId={activeId} />
          </section>

          <PtmCharts detail={detail} />
          <QuestionnaireContribution days={detail.questionnaireDays} />
          <RecordsList records={detail.records} />
        </>
      ) : (
        <div className="rounded-lg bg-neutral-50 px-6 py-6 text-sm text-neutral-500">
          Data pasien belum tersedia
        </div>
      )}
    </div>
  );
}
