import { PengaturanView } from '@/app/(dashboard)/components/pengaturan/pengaturan-view';
import { accessToken } from '@/lib/backend';
import { getPartnerPatients } from '@/lib/doctor-api';

export const dynamic = 'force-dynamic';

export default async function PengaturanPage() {
  const { token } = await accessToken('/pengaturan');
  const patients = await getPartnerPatients(token);

  return <PengaturanView patients={patients} />;
}
