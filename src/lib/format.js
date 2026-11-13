// Taka, numbers and dates for Bangla / English.
const nf = { bn: new Intl.NumberFormat('bn-BD'), en: new Intl.NumberFormat('en-IN') };

export const formatNumber = (n, lang = 'bn') => nf[lang === 'en' ? 'en' : 'bn'].format(n);
export const taka = (n, lang = 'bn') => (n == null ? '—' : `৳ ${formatNumber(n, lang)}`);

export function formatDateTime(iso, lang = 'bn') {
  return new Date(iso).toLocaleString(lang === 'en' ? 'en-GB' : 'bn-BD', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const formatKg = (kg, lang = 'bn') => `${formatNumber(kg, lang)} ${lang === 'en' ? 'KG' : 'কেজি'}`;
