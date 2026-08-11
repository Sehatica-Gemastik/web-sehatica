import Link from 'next/link';
import { registerDoctor } from '../actions';

export const metadata = {
  title: 'Pendaftaran Dokter — Sehatica',
  description: 'Daftar sebagai dokter terverifikasi untuk meninjau jawaban AI Heally.',
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="brand-mark" aria-hidden="true">
          <span>S</span>
        </div>
        <div className="login-copy">
          <p className="eyebrow">SEHATICA FOR DOCTORS</p>
          <h1>Bergabung sebagai Dokter Partner</h1>
          <p>
            Bantu pasien mendapatkan rekomendasi medis terverifikasi. Tinjau jawaban AI Heally dan berikan arahan klinis yang tepat.
          </p>
        </div>
        <div className="privacy-strip">
          <span className="privacy-line" aria-hidden="true" />
          <p>Persetujuan medis berbasis transparansi dan privasi penuh pasien.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="utility-label">PENDAFTARAN DOKTER</p>
          <h2>Buat Akun Dokter</h2>
          <p className="form-intro">Isi data profesional Anda untuk memulai verifikasi.</p>

          {params.error ? (
            <div className="form-error" role="alert">
              {params.error}
            </div>
          ) : null}

          <form action={registerDoctor} className="login-form">
            <label htmlFor="name">
              Nama Lengkap beserta Gelar
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="dr. Budi Santoso, Sp.PD"
              />
            </label>

            <label htmlFor="email">
              Email Profesional
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="dokter@sehatica.id"
              />
            </label>

            <label htmlFor="password">
              Password (minimal 8 karakter)
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
              />
            </label>

            <label htmlFor="specialty">
              Spesialisasi Medical
              <input
                id="specialty"
                name="specialty"
                type="text"
                required
                placeholder="Dokter Umum / Spesialis Penyakit Dalam"
              />
            </label>

            <label htmlFor="phone">
              Nomor Telepon (opsional)
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="081234567890"
              />
            </label>

            <label htmlFor="bio">
              Biografi Singkat / Pengalaman (opsional)
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Praktik di RS Medika, berpengalaman 10 tahun..."
              />
            </label>

            <button type="submit" className="primary-button">
              Daftar Akun Dokter
            </button>
          </form>

          <p className="security-note" style={{ textAlign: 'center', marginTop: 16 }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: 'var(--care)', fontWeight: 700 }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
