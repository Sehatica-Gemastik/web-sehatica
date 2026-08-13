'use client';

import { useState } from 'react';
import { Mail, Pencil, Phone } from 'lucide-react';
import { PhoneField } from '@/app/(auth)/components/phone-field';
import { SpecialtySelect } from '@/app/(auth)/components/specialty-select';
import { ShowQrButton } from '@/app/(dashboard)/components/monitor/show-qr-button';
import { updateDoctorProfile } from '@/app/actions';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { DoctorProfile } from '@/lib/backend';
import { formatPhoneDisplay, splitPhoneNumber } from '@/lib/phone-utils';

type ProfilViewProps = {
  doctor: DoctorProfile;
  error?: string;
  updated?: boolean;
};

type ProfileDraft = {
  name: string;
  specialty: string;
  phoneLocal: string;
  bio: string;
};

function ContactPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-neutral-50 px-4 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">{value}</span>
    </div>
  );
}

export function ProfilView({ doctor, error, updated }: ProfilViewProps) {
  const phoneParts = splitPhoneNumber(doctor.phone);

  const initialDraft: ProfileDraft = {
    name: doctor.name,
    specialty: doctor.specialty,
    phoneLocal: phoneParts.local,
    bio: doctor.bio ?? '',
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(initialDraft);

  const display = editing ? draft : initialDraft;

  const handleCancel = () => {
    setDraft(initialDraft);
    setEditing(false);
  };

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-y-auto overscroll-contain bg-linear-to-br from-[#DDF5F3] via-[#EEF9F8] to-[#FFF0EB] px-6 py-8 sm:px-10">
      <div className="w-full max-w-3xl shrink-0">
        {error ? <Alert className="mb-4">{error}</Alert> : null}
        {updated ? <Alert variant="success" className="mb-4">Profil disimpan</Alert> : null}

        <article className="w-full rounded-2xl border border-black/4 bg-white">
          <div className="relative h-28 overflow-hidden rounded-t-2xl bg-linear-to-br from-[#B2EBF2]/90 via-[#E0F7FA] to-[#F4FFFE]">
            <div className="absolute right-3 top-3 flex gap-2">
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/80 bg-white/85 backdrop-blur-sm hover:bg-white"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={14} />
                  Edit
                </Button>
              ) : null}
              <ShowQrButton doctorId={doctor.id} doctorName={display.name} />
            </div>
          </div>

          <div className="relative overflow-visible px-6">
            <div className="absolute left-6 -top-10 sm:left-10">
              <Avatar
                initials={doctor.avatarInitials}
                size="lg"
                className="h-20 w-20 text-lg"
              />
            </div>

            {editing ? (
              <form action={updateDoctorProfile} className="relative z-0 grid w-full gap-4 overflow-visible pt-12 pb-4">
                <Field>
                  <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" value={doctor.email} disabled className="bg-neutral-50 text-neutral-500" />
                </Field>

                <PhoneField
                  id="profile-phone"
                  value={draft.phoneLocal}
                  onValueChange={(phoneLocal) => setDraft((current) => ({ ...current, phoneLocal }))}
                />

                <SpecialtySelect required defaultValue={draft.specialty} />

                <Field>
                  <FieldLabel htmlFor="bio">Biografi</FieldLabel>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={draft.bio}
                    onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
                    placeholder="Pengalaman praktik (opsional)"
                  />
                </Field>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                    Batalkan
                  </Button>
                  <Button type="submit" size="sm" className="border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800">
                    Simpan
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="pt-12">
                  <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{display.name}</h1>
                  <p className="mt-1 text-sm text-neutral-500">{display.specialty}</p>
                  <Badge variant="secondary" className="mt-2 bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
                    DOC-{doctor.id}
                  </Badge>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                    {display.bio || 'Belum ada biografi.'}
                  </p>
                </div>

                <div className="mt-6 grid gap-2.5">
                  <ContactPill icon={<Mail size={15} />} value={doctor.email} />
                  <ContactPill icon={<Phone size={15} />} value={formatPhoneDisplay(doctor.phone)} />
                </div>
              </>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
