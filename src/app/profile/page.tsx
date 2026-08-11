import Link from 'next/link';
import { getDoctorProfile } from '@/lib/backend';
import { updateDoctorProfile, logout } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const doctor = await getDoctorProfile();

  return (
    <main style={{ minHeight: '100vh', background: 'var(--canvas)', padding: '24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--care)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Kembali ke Antrean Review
          </Link>
          <form action={logout}>
            <button type="submit" className="text-button" style={{ color: 'var(--red)', fontWeight: 700 }}>
              Keluar Sesi
            </button>
          </form>
        </div>

        {params.error ? <div className="notice error">{params.error}</div> : null}
        {params.updated ? <div className="notice success">Profil dokter berhasil diperbarui.</div> : null}

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{doctor.avatarInitials}</div>
            <div className="profile-info">
              <h1>{doctor.name}</h1>
              <p>{doctor.specialty} · Rating {doctor.rating.toFixed(1)} ★ ({doctor.reviewCount} ulasan, {doctor.verifiedCount} verifikasi)</p>
            </div>
          </div>

          <form action={updateDoctorProfile} className="profile-form" style={{ display: 'grid', gap: '20px' }}>
            <div style={{ background: 'var(--care-pale)', padding: '16px', borderRadius: '12px', border: '1px solid var(--care-muted)' }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="isAvailable"
                  defaultChecked={doctor.isAvailable}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--care)' }}
                />
                Status Ketersediaan: {doctor.isAvailable ? '🟢 Online (Menerima Review)' : '🔴 Offline (Sedang Tidak Menerima)'}
              </label>
              <p style={{ margin: '6px 0 0 30px', fontSize: '12px', color: 'var(--muted)' }}>
                Bila Online, profil Anda akan muncul untuk pasien di aplikasi mobile Sehatica.
              </p>
            </div>

            <label htmlFor="name">
              Nama Lengkap beserta Gelar
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={doctor.name}
                required
              />
            </label>

            <label htmlFor="email">
              Email (Tidak dapat diubah)
              <input
                id="email"
                type="email"
                value={doctor.email}
                disabled
                style={{ background: 'var(--canvas)', color: 'var(--muted)', cursor: 'not-allowed' }}
              />
            </label>

            <label htmlFor="specialty">
              Spesialisasi Medical
              <input
                id="specialty"
                name="specialty"
                type="text"
                defaultValue={doctor.specialty}
                required
              />
            </label>

            <label htmlFor="feePerQna">
              Tarif Review per QnA (Rupiah)
              <input
                id="feePerQna"
                name="feePerQna"
                type="number"
                min="0"
                step="5000"
                defaultValue={parseFloat(doctor.feePerQna || '25000')}
                required
              />
              <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                Biaya ini akan dihitung otomatis di aplikasi mobile pasien berdasarkan jumlah pasang QnA (Pertanyaan + Jawaban AI) yang dipilih untuk di-review.
              </span>
            </label>

            <label htmlFor="phone">
              Nomor Telepon Kontak
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={doctor.phone ?? ''}
                placeholder="081234567890"
              />
            </label>

            <label htmlFor="bio">
              Biografi / Profil Ringkas
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={doctor.bio ?? ''}
                placeholder="Tuliskan pengalaman klinis dan jadwal konsultasi Anda..."
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Link href="/" className="secondary-button" style={{ textDecoration: 'none' }}>
                Batal
              </Link>
              <button type="submit" className="primary-button">
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
