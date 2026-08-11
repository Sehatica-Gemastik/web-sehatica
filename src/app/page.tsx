import Link from 'next/link';
import { claimVoluntaryReview, decideReview, logout } from './actions';
import { getAssignedReviews, getDoctorSession, getVoluntaryPool, ReviewCase, VoluntaryPoolItem } from '@/lib/backend';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRupiah(amount?: string | number | null) {
  if (!amount) return 'Rp 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

function statusLabel(status: string) {
  if (status === 'approved') return 'Disetujui';
  if (status === 'revised') return 'Perlu Revisi';
  return 'Menunggu Review';
}

function scopeLabel(scope: string) {
  if (scope === 'bubble') return 'Chat Bubble';
  if (scope === 'session') return 'Chat Room Sesi';
  return 'Seluruh Riwayat';
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ case?: string; filter?: string; error?: string; updated?: string; claimed?: string }>;
}) {
  const params = await searchParams;
  const [doctor, reviews, voluntaryPool] = await Promise.all([
    getDoctorSession('/'),
    getAssignedReviews(),
    getVoluntaryPool(),
  ]);

  const currentFilter = params.filter ?? 'assigned'; // 'assigned' | 'paid' | 'pool'
  const paidReviews = reviews.filter((r: ReviewCase) => r.reviewType === 'paid' || r.isPaid);

  const selectedId = Number(params.case);
  const activeAssignedList = currentFilter === 'paid' ? paidReviews : reviews;
  const selected = activeAssignedList.find((review: ReviewCase) => review.id === selectedId) ?? activeAssignedList[0] ?? null;

  const selectedPoolItem = voluntaryPool.find((item: VoluntaryPoolItem) => item.id === selectedId) ?? voluntaryPool[0] ?? null;

  return (
    <main className="workspace-shell">
      <aside className="queue-panel">
        <header className="queue-header">
          <div className="brand-lockup">
            <div className="brand-mark small" aria-hidden="true"><span>S</span></div>
            <div><strong>Sehatica</strong><span>Ruang Dokter</span></div>
          </div>
          <div className="queue-title-row">
            <div><p className="utility-label">ANTREAN REVIEW DOKTER</p><h1>Dashboard</h1></div>
            <span className="count-pill"><span aria-hidden="true">{reviews.filter((r: ReviewCase) => r.status === 'pending').length}</span></span>
          </div>
        </header>

        <nav className="filter-tabs" aria-label="Filter jenis review">
          <Link
            href="/?filter=assigned"
            className={`filter-tab ${currentFilter === 'assigned' ? 'active' : ''}`}
          >
            Antrean Saya ({reviews.length})
          </Link>
          <Link
            href="/?filter=paid"
            className={`filter-tab ${currentFilter === 'paid' ? 'active' : ''}`}
          >
            Review Berbayar ({paidReviews.length})
          </Link>
          <Link
            href="/?filter=pool"
            className={`filter-tab ${currentFilter === 'pool' ? 'active' : ''}`}
          >
            Pool Sukarela ({voluntaryPool.length})
          </Link>
        </nav>

        {currentFilter === 'pool' ? (
          /* Voluntary Open Pool List */
          <nav className="case-list" aria-label="Pool review sukarela">
            {voluntaryPool.length === 0 ? (
              <div className="empty-queue">
                <strong style={{ color: 'var(--ink)' }}>Pool Sukarela Kosong</strong>
                <p>Belum ada permintaan review sukarela baru dari pasien.</p>
              </div>
            ) : (
              voluntaryPool.map((item: VoluntaryPoolItem) => {
                const isSelected = selectedPoolItem?.id === item.id;
                return (
                  <Link
                    href={`/?filter=pool&case=${item.id}`}
                    key={item.id}
                    className={`case-row ${isSelected ? 'selected' : ''}`}
                    style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px', padding: '12px 14px' }}
                  >
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>Pasien {item.patientInitials}</strong>
                      <small style={{ color: 'var(--muted)', marginTop: '2px', display: 'block' }}>
                        {item.qnaCount} QnA Pair · {scopeLabel(item.reviewScope)}
                      </small>
                    </div>
                    <span className="scope-chip" style={{ fontSize: '9px', alignSelf: 'center' }}>
                      Sukarela
                    </span>
                  </Link>
                );
              })
            )}
          </nav>
        ) : (
          /* Doctor's Assigned Case Queue */
          <nav className="case-list" aria-label="Daftar review pasien">
            {activeAssignedList.length === 0 ? (
              <div className="empty-queue"><span className="empty-ring" /><strong>Antrean selesai</strong><p>Belum ada kasus review di kategori ini.</p></div>
            ) : activeAssignedList.map((review: ReviewCase) => (
              <Link
                href={`/?filter=${currentFilter}&case=${review.id}`}
                key={review.id}
                className={`case-row ${selected?.id === review.id ? 'selected' : ''}`}
                aria-current={selected?.id === review.id ? 'page' : undefined}
              >
                <span className={`risk-dot ${review.reviewType === 'paid' || review.isPaid ? 'paid' : review.safetyLevel}`} aria-hidden="true" />
                <span className="case-copy">
                  <strong>{review.patientName} ({review.qnaCount} QnA)</strong>
                  <small>{review.patientQuestion}</small>
                </span>
                <span className={`status-tag ${review.status} ${review.reviewType === 'paid' || review.isPaid ? 'paid' : ''}`}>
                  {review.reviewType === 'paid' || review.isPaid ? formatRupiah(review.fee) : statusLabel(review.status)}
                </span>
              </Link>
            ))}
          </nav>
        )}

        <footer className="doctor-footer">
          <div className="doctor-avatar">{doctor.avatarInitials ?? 'DR'}</div>
          <div>
            <strong>{doctor.name}</strong>
            <Link href="/profile" style={{ color: 'var(--care)', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>
              Pengaturan Profil
            </Link>
          </div>
          <form action={logout}><button type="submit" className="text-button">Keluar</button></form>
        </footer>
      </aside>

      <section className="review-workspace">
        {params.error ? <div className="notice error" role="alert">{params.error}</div> : null}
        {params.updated ? <div className="notice success" role="status">Keputusan dan catatan per-bubble tersimpan untuk pasien.</div> : null}
        {params.claimed ? <div className="notice success" role="status">Request sukarela berhasil diklaim. Permintaan izin telah dikirim ke mobile pasien.</div> : null}

        {currentFilter === 'pool' ? (
          !selectedPoolItem ? (
            <div className="workspace-empty">
              <div className="care-glyph" aria-hidden="true" />
              <p className="eyebrow">Pool Review Sukarela Platform</p>
              <h2>Pool Sukarela Kosong</h2>
              <p>Belum ada kasus sukarela dari pasien di platform saat ini.</p>
            </div>
          ) : (
            <article className="pool-claim-card">
              <header className="pool-claim-header">
                <div className="pool-avatar-large">{selectedPoolItem.patientInitials}</div>
                <div style={{ flex: 1 }}>
                  <p className="eyebrow" style={{ color: 'var(--amber)' }}>PERMINTAAN REVIEW SUKARELA · KASUS #{selectedPoolItem.id}</p>
                  <h2 style={{ margin: '4px 0 2px', fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700 }}>
                    Pasien {selectedPoolItem.patientInitials}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
                    Dibuat {formatDate(selectedPoolItem.createdAt)} · Total {selectedPoolItem.qnaCount} Pasang QnA
                  </p>
                </div>
                <span className="status-chip" style={{ color: 'var(--amber)', background: 'var(--amber-pale)' }}>
                  Terbuka di Pool
                </span>
              </header>

              <div className="pool-claim-body">
                <div className="pool-privacy-banner">
                  <h4>Kerahasiaan & Proteksi Privasi Pasien</h4>
                  <p>
                    Untuk melindungi privasi pasien, isi percakapan dan detail pertanyaan belum dapat dibuka.
                    Setelah Anda menekan tombol di bawah, notifikasi permintaan izin akan otomatis terkirim ke aplikasi mobile pasien.
                    Begitu pasien menekan "Beri Izin", percakapan lengkap akan terbuka dan langsung masuk ke Antrean Utama Anda.
                  </p>
                </div>

                <div className="pool-specs-grid">
                  <div className="pool-spec-item">
                    <label>Cakupan Izin Review</label>
                    <strong>{scopeLabel(selectedPoolItem.reviewScope)}</strong>
                  </div>
                  <div className="pool-spec-item">
                    <label>Jumlah Pertanyaan</label>
                    <strong>{selectedPoolItem.qnaCount} Pasang QnA</strong>
                  </div>
                  <div className="pool-spec-item">
                    <label>Status Keamanan AI</label>
                    <strong>{selectedPoolItem.safetyLevel === 'urgent' ? 'Potensi Darurat' : 'Standard Safety'}</strong>
                  </div>
                  <div className="pool-spec-item">
                    <label>Tarif Peninjauan</label>
                    <strong style={{ color: 'var(--care-dark)' }}>Sukarela (Rp 0)</strong>
                  </div>
                </div>

                <form action={claimVoluntaryReview} className="pool-claim-action">
                  <input type="hidden" name="reviewId" value={selectedPoolItem.id} />
                  <button
                    type="submit"
                    className="primary-button"
                    style={{ width: '100%', minHeight: '52px', fontSize: '15px', fontWeight: 700 }}
                  >
                    Klaim Kasus Ini & Minta Izin Akses Percakapan
                  </button>
                </form>
              </div>
            </article>
          )
        ) : !selected ? (
          <div className="workspace-empty">
            <div className="care-glyph" aria-hidden="true" />
            <p className="eyebrow">Semua Tertangani</p>
            <h2>Tidak ada review yang menunggu.</h2>
            <p>Kasus baru akan muncul setelah pasien mengirimkan review berbayar atau mengizinkan peninjauan sukarela.</p>
          </div>
        ) : (
          <article className="review-sheet">
            <header className="review-sheet-header">
              <div>
                <p className="eyebrow">
                  REVIEW #{selected.id} · {selected.reviewType === 'paid' || selected.isPaid ? `PERMINTAAN BERBAYAR (${formatRupiah(selected.fee)})` : 'PENINJAUAN SUKARELA'}
                </p>
                <h2>{selected.patientName}</h2>
                <p>Dikirim {formatDate(selected.consentedAt)} · Total {selected.qnaCount} Pasang QnA</p>
              </div>
              <div>
                <span className={`status-chip ${selected.status}`}>{statusLabel(selected.status)}</span>
                <span className="scope-chip">{scopeLabel(selected.reviewScope)}</span>
              </div>
            </header>

            <div className="consent-banner">
              <span aria-hidden="true">✓</span>
              <p>
                <strong>Persetujuan Pasien Terverifikasi.</strong> Pasien memberikan izin review pada tingkat <strong>{scopeLabel(selected.reviewScope)}</strong>.
                {selected.patientPhone ? ` Nomor telepon: ${selected.patientPhone}` : ''}
              </p>
            </div>

            <div className="care-trail">
              {selected.items && selected.items.length > 0 ? (
                selected.items.map((item, idx) => (
                  <section className="trail-step" key={item.id || idx}>
                    <div className="trail-marker"><span>{String(idx + 1).padStart(2, '0')}</span></div>
                    <div>
                      <p className="trail-label">PERTANYAAN PASIEN (QnA #{idx + 1})</p>
                      <blockquote>{item.patientQuestion}</blockquote>
                      
                      <div className="ai-bubble-card">
                        <div className="trail-heading">
                          <p className="trail-label">JAWABAN HEALLY AI</p>
                          <span className={`safety-label ${item.safetyLevel}`}>{item.safetyLevel === 'urgent' ? 'Potensi Darurat' : 'Perlu Review'}</span>
                        </div>
                        <p className="ai-response">{item.aiResponse}</p>
                      </div>

                      {selected.status === 'pending' ? (
                        <div className="bubble-annotation-box">
                          <label htmlFor={`itemNote_${item.clientMessageId}`}>Catatan Klinis Dokter untuk Chat #{item.clientMessageId} (Opsional)</label>
                          <textarea
                            id={`itemNote_${item.clientMessageId}`}
                            name={`itemNote_${item.clientMessageId}`}
                            form="decision-main-form"
                            placeholder="Contoh: Dosis obat ini perlu disesuaikan dengan resep resmi..."
                            defaultValue={item.doctorItemNote ?? ''}
                          />
                        </div>
                      ) : item.doctorItemNote ? (
                        <div className="bubble-annotation-box" style={{ background: 'var(--care-pale)', borderColor: 'var(--care-muted)' }}>
                          <label style={{ color: 'var(--care-dark)' }}>Catatan Dokter untuk Chat ini:</label>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink)' }}>{item.doctorItemNote}</p>
                        </div>
                      ) : null}
                    </div>
                  </section>
                ))
              ) : (
                <section className="trail-step">
                  <div className="trail-marker"><span>01</span></div>
                  <div>
                    <p className="trail-label">PERTANYAAN PASIEN</p>
                    <blockquote>{selected.patientQuestion}</blockquote>
                    
                    <div className="ai-bubble-card">
                      <div className="trail-heading">
                        <p className="trail-label">JAWABAN HEALLY AI</p>
                        <span className={`safety-label ${selected.safetyLevel}`}>{selected.safetyLevel === 'urgent' ? 'Potensi Darurat' : 'Perlu Review'}</span>
                      </div>
                      <p className="ai-response">{selected.aiResponse}</p>
                    </div>
                  </div>
                </section>
              )}

              {selected.patientNote ? (
                <div className="patient-note">
                  <strong>Catatan Pasien:</strong> {selected.patientNote}
                </div>
              ) : null}

              {selected.status === 'pending' ? (
                <form id="decision-main-form" action={decideReview} className="decision-form">
                  <input type="hidden" name="reviewId" value={selected.id} />
                  <label htmlFor="doctorSummaryNote">Catatan Rangkuman Master Dokter untuk Pasien (Opsional)</label>
                  <textarea
                    id="doctorSummaryNote"
                    name="doctorSummaryNote"
                    placeholder="Tuliskan rekomendasi medis atau tindak lanjut menyeluruh yang perlu dibaca pasien..."
                    defaultValue={selected.doctorSummaryNote ?? selected.doctorNote ?? ''}
                  />

                  <div className="decision-actions">
                    <button type="submit" name="status" value="revised" className="secondary-button">
                      Perlu Revisi Medis
                    </button>
                    <button type="submit" name="status" value="approved" className="primary-button">
                      Setujui Konsultasi AI
                    </button>
                  </div>
                </form>
              ) : (
                <div className={`decision-receipt ${selected.status}`}>
                  <strong>Rangkuman Keputusan Dokter ({statusLabel(selected.status)})</strong>
                  <p>{selected.doctorSummaryNote || selected.doctorNote || 'Tidak ada catatan rangkuman umum.'}</p>
                  <small>Ditinjau oleh {doctor.name} pada {formatDate(selected.decidedAt)}</small>
                </div>
              )}
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
