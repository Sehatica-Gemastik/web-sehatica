'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field, FieldHint, FieldLabel, FieldRequired } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  hint?: string;
};

export function PasswordField({
  id,
  name,
  label,
  placeholder = 'Masukkan password',
  required = true,
  minLength = 8,
  autoComplete = 'current-password',
  hint,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? <FieldRequired>*</FieldRequired> : null}
        {hint ? <FieldHint>{hint}</FieldHint> : null}
      </FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded border-0 bg-transparent text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-0"
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
}
