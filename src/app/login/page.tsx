import Link from 'next/link';
import { login } from '../actions';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; expired?: string }>;
}) {
  const params = await searchParams;
  const message = params.error ?? (params.expired ? 'Sesi berakhir. Masuk kembali untuk melanjutkan.' : null);

  return (
    <main className="login-shell">
      <section className="login-story" aria-label="Tentang ruang review Sehatica">
        <div className="brand-mark" aria-hidden="true"><span>S</span></div>
        <div className="login-copy">
          <p className="eyebrow">SEHATICA FOR DOCTORS</p>
          <h1>Satu keputusan klinis, dengan konteks yang pasien setujui.</h1>
          <p>Review hanya menampilkan pertanyaan dan jawaban AI yang dipilih pasien. Rekam medis lainnya tetap berada di perangkat pasien.</p>
        </div>
        <div className="privacy-strip">
          <span className="privacy-line" aria-hidden="true" />
          <p>Bundle review kedaluwarsa otomatis. Akses dibatasi ke dokter tujuan.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="utility-label">PORTAL TERBATAS</p>
          <h2>Masuk sebagai Dokter</h2>
          <p className="form-intro">Gunakan akun dokter yang sudah terdaftar di Sehatica.</p>
          {message ? <div className="form-error" role="alert">{message}</div> : null}
          <form action={login} className="login-form">
            <label htmlFor="email">
              Email dokter
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="dokter@klinik.id" />
            </label>
            <label htmlFor="password">
              Password
              <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} />
            </label>
            <button type="submit" className="primary-button">Masuk ke Antrean Review</button>
          </form>
          
          <p className="security-note" style={{ textAlign: 'center', marginTop: 20 }}>
            Belum memiliki akun dokter?{' '}
            <Link href="/register" style={{ color: 'var(--care)', fontWeight: 700 }}>
              Daftar di sini
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
