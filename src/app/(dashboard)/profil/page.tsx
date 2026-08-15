import { ProfilView } from '@/app/(dashboard)/components/profil/profil-view';
import { accessToken } from '@/lib/backend';
import { getDoctorProfile } from '@/lib/doctor-api';

export const dynamic = 'force-dynamic';

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const { token } = await accessToken('/profil');
  const doctor = await getDoctorProfile(token);

  return (
    <ProfilView
      doctor={doctor}
      error={params.error}
      updated={Boolean(params.updated)}
    />
  );
}
