import Link from 'next/link';
import { decideReview, logout } from './actions';
import { getAssignedReviews, getDoctorSession, ReviewCase } from '@/lib/backend';

export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

function statusLabel(status: ReviewCase['status']) {
  if (status === 'approved') return 'Disetujui';
  if (status === 'revised') return 'Perlu revisi';
  return 'Menunggu';
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ case?: string; error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const [doctor, reviews] = await Promise.all([getDoctorSession('/'), getAssignedReviews()]);
  const selectedId = Number(params.case);
  const selected = reviews.find((review) => review.id === selectedId) ?? reviews[0] ?? null;
  const pendingCount = reviews.filter((review) => review.status === 'pending').length;

  return (
    <main className="workspace-shell">
      <aside className="queue-panel">
        <header className="queue-header">
          <div className="brand-lockup">
            <div className="brand-mark small" aria-hidden="true"><span>S</span></div>
            <div><strong>Sehatica</strong><span>Ruang dokter</span></div>
          </div>
          <div className="queue-title-row">
            <div><p className="utility-label">ANTREAN SAYA</p><h1>Review masuk</h1></div>
            <span className="count-pill"><span aria-hidden="true">{pendingCount}</span><span className="sr-only">{pendingCount} review menunggu</span></span>
          </div>
        </header>

        <nav className="case-list" aria-label="Daftar review pasien">
          {reviews.length === 0 ? (
            <div className="empty-queue"><span className="empty-ring" /><strong>Antrean selesai</strong><p>Belum ada jawaban Heally yang menunggu review Anda.</p></div>
          ) : reviews.map((review) => (
            <Link
              href={`/?case=${review.id}`}
              key={review.id}
              className={`case-row ${selected?.id === review.id ? 'selected' : ''}`}
              aria-current={selected?.id === review.id ? 'page' : undefined}
            >
              <span className={`risk-dot ${review.safetyLevel}`} aria-hidden="true" />
              <span className="case-copy"><strong>{review.patientName}</strong><small>{review.patientQuestion}</small></span>
              <span className={`status-tag ${review.status}`}>{statusLabel(review.status)}</span>
            </Link>
          ))}
        </nav>

        <footer className="doctor-footer">
          <div className="doctor-avatar">{doctor.avatarInitials ?? 'DR'}</div>
          <div><strong>{doctor.name}</strong><span>Dokter terverifikasi</span></div>
          <form action={logout}><button type="submit" className="text-button">Keluar</button></form>
        </footer>
      </aside>

      <section className="review-workspace">
        {params.error ? <div className="notice error" role="alert">{params.error}</div> : null}
        {params.updated ? <div className="notice success" role="status">Keputusan tersimpan dan tersedia untuk pasien.</div> : null}
        {!selected ? (
          <div className="workspace-empty"><div className="care-glyph" aria-hidden="true" /><p className="eyebrow">Semua tertangani</p><h2>Tidak ada review yang menunggu.</h2><p>Kasus baru akan muncul setelah pasien memilih jawaban Heally dan memberikan persetujuan eksplisit.</p></div>
        ) : (
          <article className="review-sheet">
            <header className="review-sheet-header">
              <div><p className="eyebrow">REVIEW #{selected.id}</p><h2>{selected.patientName}</h2><p>Dikirim {formatDate(selected.consentedAt)} · kedaluwarsa {formatDate(selected.expiresAt)}</p></div>
              <span className={`status-chip ${selected.status}`}>{statusLabel(selected.status)}</span>
            </header>

            <div className="consent-banner"><span aria-hidden="true">✓</span><p><strong>Persetujuan tercatat.</strong> Pasien hanya membagikan pertanyaan, jawaban AI, level keamanan, dan catatan di halaman ini.</p></div>

            <div className="care-trail">
              <section className="trail-step patient-step">
                <div className="trail-marker"><span>01</span></div>
                <div><p className="trail-label">PERTANYAAN PASIEN</p><blockquote>{selected.patientQuestion}</blockquote>{selected.patientNote ? <p className="patient-note">Catatan: {selected.patientNote}</p> : null}</div>
              </section>
              <section className="trail-step ai-step">
                <div className="trail-marker"><span>02</span></div>
                <div><div className="trail-heading"><p className="trail-label">JAWABAN HEALLY · BELUM TERVERIFIKASI</p><span className={`safety-label ${selected.safetyLevel}`}>{selected.safetyLevel === 'urgent' ? 'Potensi darurat' : 'Perlu review'}</span></div><p className="ai-response">{selected.aiResponse}</p></div>
              </section>
              <section className="trail-step decision-step">
                <div className="trail-marker"><span>03</span></div>
                <div>
                  <p className="trail-label">KEPUTUSAN DOKTER</p>
                  {selected.status === 'pending' ? (
                    <form action={decideReview} className="decision-form">
                      <input type="hidden" name="reviewId" value={selected.id} />
                      <label htmlFor="note">Catatan klinis</label>
                      <textarea id="note" name="note" maxLength={2000} placeholder="Wajib diisi bila jawaban perlu direvisi. Hindari menambahkan diagnosis baru tanpa pemeriksaan." />
                      <div className="decision-actions">
                        <button type="submit" name="status" value="revised" className="secondary-button">Minta revisi</button>
                        <button type="submit" name="status" value="approved" className="primary-button">Setujui jawaban</button>
                      </div>
                    </form>
                  ) : (
                    <div className={`decision-receipt ${selected.status}`}><strong>{statusLabel(selected.status)}</strong><p>{selected.doctorNote ?? 'Tidak ada catatan tambahan.'}</p><small>Diputuskan {selected.decidedAt ? formatDate(selected.decidedAt) : '—'}</small></div>
                  )}
                </div>
              </section>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
