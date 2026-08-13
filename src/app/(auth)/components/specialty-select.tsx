'use client';

import { MEDICAL_SPECIALTIES } from '@/lib/specialties';
import { AuthDropdown } from './auth-dropdown';

type SpecialtySelectProps = {
  required?: boolean;
  defaultValue?: string;
};

export function SpecialtySelect({ required = true, defaultValue = '' }: SpecialtySelectProps) {
  return (
    <AuthDropdown
      name="specialty"
      label="Spesialisasi"
      placeholder="Pilih spesialisasi medis"
      required={required}
      defaultValue={defaultValue}
      options={MEDICAL_SPECIALTIES.map((item) => ({ value: item, label: item }))}
    />
  );
}
