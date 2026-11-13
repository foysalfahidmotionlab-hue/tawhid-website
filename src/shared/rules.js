// Order rules shared by the website (for instant feedback) and the server
// (which re-checks everything — the server is the source of truth).

export const WHOLESALE_MIN_BAGS = 10;
export const MAX_BAGS_PER_LINE = 5000;

const BN = '০১২৩৪৫৬৭৮৯';
/** Convert Bangla digits to ASCII digits. */
export const toAsciiDigits = (s) => String(s ?? '').replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));

/**
 * Normalise a Bangladeshi mobile number to 01XXXXXXXXX, or return null if invalid.
 * Accepts +8801…, 8801…, 01…, spaces, dashes and Bangla digits.
 */
export function normalizeBdPhone(input) {
  let s = toAsciiDigits(input).replace(/[\s\-().]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  if (s.startsWith('880')) s = s.slice(2);
  else if (s.startsWith('88')) s = s.slice(2);
  return /^01[3-9]\d{8}$/.test(s) ? s : null;
}

/** Whole positive bag count, or null. */
export function parseQty(v) {
  const n = Number(toAsciiDigits(v));
  return Number.isInteger(n) && n > 0 && n <= MAX_BAGS_PER_LINE ? n : null;
}

export const retailPrice = (p) => (p.wholesale_price == null ? null : p.wholesale_price + (p.retail_markup ?? 0));
export const unitPrice = (p, type) => (type === 'wholesale' ? p.wholesale_price : retailPrice(p));

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
/** Allowed next statuses from each status (no skipping backwards automatically). */
export const NEXT_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};
