'use client';

import { Field, FieldHelp, FieldLabel, FieldRequired } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type PhoneFieldProps = {
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  id?: string;
};

export function PhoneField({
  required = false,
  defaultValue = '',
  value,
  onValueChange,
  id = 'phone',
}: PhoneFieldProps) {
  const controlled = value !== undefined;

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        Nomor telepon
        {required ? <FieldRequired>*</FieldRequired> : null}
      </FieldLabel>

      <input type="hidden" name="phoneCountry" value="+62" />

      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2">
        <span
          className="grid min-h-10 select-none place-items-center rounded border border-neutral-200 bg-neutral-200/70 px-2.5 text-sm font-medium text-neutral-500"
          aria-hidden="true"
        >
          +62
        </span>
        <Input
          id={id}
          name="phone"
          type="tel"
          inputMode="numeric"
          required={required}
          placeholder="81234567890"
          defaultValue={controlled ? undefined : defaultValue}
          value={controlled ? value : undefined}
          onChange={controlled ? (event) => onValueChange?.(event.target.value) : undefined}
        />
      </div>
      <FieldHelp>Tanpa angka 0 di depan.</FieldHelp>
    </Field>
  );
}
