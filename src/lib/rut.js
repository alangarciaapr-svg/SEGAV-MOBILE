export function cleanRut(value = '') {
  return String(value).replace(/[^0-9kK]/g, '').toUpperCase();
}

export function calculateDv(rutNumber) {
  let sum = 0;
  let multiplier = 2;
  const digits = String(rutNumber).replace(/\D/g, '').split('').reverse();
  for (const digit of digits) {
    sum += Number(digit) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

export function validateRut(value = '') {
  const cleaned = cleanRut(value);
  if (cleaned.length < 2) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return calculateDv(body) === dv;
}

export function formatRut(value = '') {
  const cleaned = cleanRut(value);
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}
