import Link from 'next/link';
import { registerDoctor } from '../../actions';
import { AuthShell } from '@/app/(auth)/components/auth-shell';
import { AuthVisual } from '@/app/(auth)/components/auth-visual';
import { LogoPlaceholder } from '@/app/(auth)/components/logo-placeholder';
import { PasswordField } from '@/app/(auth)/components/password-field';
import { PhoneField } from '@/app/(auth)/components/phone-field';
import { SpecialtySelect } from '@/app/(auth)/components/specialty-select';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldRequired } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
    <AuthShell
      wide
      visual={
        <AuthVisual
          title="Bergabung sebagai dokter partner Sehatica."
          description="Bantu pasien mendapatkan rekomendasi medis terverifikasi."
          backHref="/login"
          backLabel="Kembali"
        />
      }
    >
      <LogoPlaceholder />

      <div className="text-center">
        <h2 className="m-0 mb-1.5 text-2xl font-semibold tracking-tight text-neutral-900">Buat akun dokter</h2>
        <p className="m-0 text-[13px] leading-snug text-neutral-500">Isi data profesional Anda untuk memulai verifikasi.</p>
      </div>

      {params.error ? <Alert className="mt-5">{params.error}</Alert> : null}

      <form action={registerDoctor} className="mt-7 grid gap-4">
        <Field>
          <FieldLabel htmlFor="name">
            Nama lengkap
            <FieldRequired>*</FieldRequired>
          </FieldLabel>
          <Input id="name" name="name" type="text" required placeholder="dr. Budi Santoso, Sp.PD" />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">
            Email
            <FieldRequired>*</FieldRequired>
          </FieldLabel>
          <Input id="email" name="email" type="email" required placeholder="Masukkan email" />
        </Field>

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <PasswordField
            id="password"
            name="password"
            label="Password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
          />
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Konfirmasi"
            placeholder="Ulangi password"
            autoComplete="new-password"
          />
        </div>

        <SpecialtySelect />
        <PhoneField />

        <Field>
          <FieldLabel htmlFor="bio">Biografi</FieldLabel>
          <Textarea id="bio" name="bio" rows={3} placeholder="Pengalaman praktik (opsional)" />
        </Field>

        <Button type="submit" variant="secondary" size="md" className="mt-1 w-full">
          Buat akun
        </Button>
      </form>

      <div className="mt-5 text-[13px] text-neutral-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-neutral-900 underline underline-offset-2 hover:text-teal-700">
          Masuk
        </Link>
      </div>
    </AuthShell>
  );
}
