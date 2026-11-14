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

// ---- payment plans -------------------------------------------------------
/**
 * How the customer pays (chosen at checkout):
 *  advance10 — 10% of the product price in advance, the rest on delivery
 *  delivery  — the delivery charge in advance, the product price on delivery
 *  advance50 — 50% of the product price in advance, the rest on delivery
 *  full      — the full amount in advance
 * Older orders have 'cod' (everything on delivery).
 */
export const PAYMENT_PLANS = ['advance10', 'delivery', 'advance50', 'full'];
export const DEFAULT_PAYMENT_PLAN = 'advance10';

/**
 * Advance and balance for an order. `null` means "not known yet" (the delivery
 * charge is still to be confirmed).
 */
export function paymentBreakdown({ payment_plan, subtotal, delivery_charge, grand_total }) {
  let advance;
  switch (payment_plan) {
    case 'advance10': advance = Math.round(subtotal * 0.1); break;
    case 'advance50': advance = Math.round(subtotal * 0.5); break;
    case 'delivery': advance = delivery_charge ?? null; break;
    case 'full': advance = grand_total ?? null; break;
    default: advance = 0;
  }
  const balance = grand_total != null && advance != null ? Math.max(0, grand_total - advance) : null;
  return { advance, balance };
}

/** Customer-facing payment state: 'paid' | 'advance_paid' | 'unpaid' | 'refunded'. */
export function paymentState({ payment_status, amount_paid }) {
  if (payment_status === 'paid' || payment_status === 'refunded') return payment_status;
  return amount_paid > 0 ? 'advance_paid' : 'unpaid';
}
