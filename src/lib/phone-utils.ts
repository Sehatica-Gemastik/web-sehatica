export function splitPhoneNumber(phone: string | null | undefined) {
  if (!phone) return { local: '' };

  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    return { local: digits.slice(2) };
  }

  return { local: digits.replace(/^0/, '') };
}

export function formatPhoneDisplay(phone: string | null | undefined) {
  const { local } = splitPhoneNumber(phone);
  if (!local) return '—';
  return `+62 ${local}`;
}
