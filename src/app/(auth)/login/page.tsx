import Link from 'next/link';
import { login } from '../../actions';
import { AuthShell } from '@/app/(auth)/components/auth-shell';
import { AuthVisual } from '@/app/(auth)/components/auth-visual';
import { LogoPlaceholder } from '@/app/(auth)/components/logo-placeholder';
import { PasswordField } from '@/app/(auth)/components/password-field';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldRequired } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; expired?: string }>;
}) {
  const params = await searchParams;
  const message = params.error ?? (params.expired ? 'Sesi berakhir. Masuk kembali untuk melanjutkan' : null);

  return (
    <AuthShell
      visual={
        <AuthVisual
          title="Konsultasi Tidak Berhenti di Rumah Sakit"
          description="Review progress kesehatan pasien secara berkala dengan bantuan AI tanpa menyebarkan data sensitif. Mudah, cepat, dan aman."
        />
      }
    >
      <LogoPlaceholder />

      <div className="text-center">
        <h2 className="m-0 mb-1.5 text-2xl font-semibold tracking-tight text-neutral-900">Selamat datang kembali</h2>
        <p className="m-0 text-[13px] leading-snug text-neutral-500">Masuk ke akun dokter Sehatica untuk melanjutkan.</p>
      </div>

      {message ? <Alert className="mt-5">{message}</Alert> : null}

      <form action={login} className="flex flex-col mt-7 gap-4">
        <Field>
          <FieldLabel htmlFor="email">
            Email
            <FieldRequired>*</FieldRequired>
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Masukkan email"
          />
        </Field>

        <PasswordField
          id="password"
          name="password"
          label="Password"
          placeholder="Masukkan password"
          autoComplete="current-password"
        />

        <Button type="submit" variant="secondary" size="md" className="mt-5 w-full">
          Masuk
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[13px] text-neutral-500 max-md:flex-col max-md:items-start">
        <span>
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-neutral-900 underline underline-offset-2 hover:text-teal-700">
            Daftar
          </Link>
        </span>
        <Link href="/register" className="font-medium text-neutral-900 underline underline-offset-2 hover:text-teal-700">
          Lupa password?
        </Link>
      </div>
    </AuthShell>
  );
}
