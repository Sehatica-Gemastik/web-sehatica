import { ProfilView } from '@/app/(dashboard)/components/profil/profil-view';
import { getDoctorSession } from '@/lib/backend';
import { getMockDoctorProfile } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const session = await getDoctorSession('/profil');
  const doctor = getMockDoctorProfile(session);

  return (
    <ProfilView
      doctor={doctor}
      error={params.error}
      updated={Boolean(params.updated)}
    />
  );
}
