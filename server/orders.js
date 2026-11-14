// Server-side pricing, delivery charge calculation and order creation.
// Prices always come from the database — never from the browser.
import { randomBytes } from 'node:crypto';
import { db, tx } from './db.js';
import { DISTRICT_KEYS, DHAKA_ZONE } from '../src/shared/districts.js';
import { WHOLESALE_MIN_BAGS, PAYMENT_PLANS, normalizeBdPhone, parseQty, unitPrice } from '../src/shared/rules.js';

export class OrderError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const productStmt = db.prepare(
  `SELECT p.*, (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY is_primary DESC, sort_order, id LIMIT 1) AS image
   FROM products p WHERE p.id = ?`
);

/** Match the best delivery rate for a district / order type / bag count. */
export function deliveryFor(district, orderType, totalBags) {
  if (!district || !DISTRICT_KEYS.has(district)) return { charge: null, label: null, source: 'pending' };
  const rates = db.prepare('SELECT * FROM delivery_rates WHERE is_active = 1').all();
  const zone = DHAKA_ZONE.has(district) ? 'dhaka' : 'outside_dhaka';
  const score = (r) => {
    let s = 0;
    if (r.zone === 'district') {
      if (r.district !== district) return -1;
      s += 10;
    } else if (r.zone !== zone) return -1;
    if (r.order_type === orderType) s += 5;
    else if (r.order_type !== 'any') return -1;
    return s;
  };
  const best = rates
    .map((r) => [score(r), r])
    .filter(([s]) => s >= 0)
    .sort((a, b) => b[0] - a[0] || b[1].id - a[1].id)[0]?.[1];
  if (!best) return { charge: null, label: null, source: 'pending' };
  let charge = 0;
  if (best.mode === 'flat') charge = best.amount;
  else if (best.mode === 'per_bag') charge = best.amount * totalBags;
  if (best.free_from_bags != null && totalBags >= best.free_from_bags) charge = 0;
  return { charge, label: best.label, source: 'rate' };
}

/**
 * Price an order from product ids and quantities.
 * Throws OrderError on invalid input. Returns lines, totals and delivery.
 */
export function quote({ order_type, items, district }) {
  if (order_type !== 'wholesale' && order_type !== 'retail') throw new OrderError('order_type', 'Choose wholesale or retail.');
  if (!Array.isArray(items) || items.length === 0) throw new OrderError('empty', 'Add at least one product.');
  if (items.length > 50) throw new OrderError('too_many', 'Too many products in one order.');

  const merged = new Map();
  for (const it of items) {
    const id = Number(it?.product_id);
    const qty = parseQty(it?.quantity);
    if (!Number.isInteger(id)) throw new OrderError('product', 'Unknown product.');
    if (!qty) throw new OrderError('quantity', 'Each quantity must be a whole number of bags (at least 1).');
    merged.set(id, (merged.get(id) || 0) + qty);
  }

  const lines = [];
  for (const [id, quantity] of merged) {
    const p = productStmt.get(id);
    if (!p || !p.is_active || p.is_archived) throw new OrderError('unavailable', 'A selected product is not available for ordering.');
    if (p.out_of_stock) throw new OrderError('out_of_stock', `${p.name_bn} is out of stock.`);
    if (p.stock_qty != null && quantity > p.stock_qty)
      throw new OrderError('stock', `Only ${p.stock_qty} bags of ${p.name_bn} are available.`);
    const price = unitPrice(p, order_type);
    if (price == null) throw new OrderError('unavailable', 'A selected product has no price yet.');
    lines.push({
      product_id: p.id,
      name_bn: p.name_bn,
      name_en: p.name_en,
      weight_kg: p.weight_kg,
      image: p.image,
      unit_price: price,
      quantity,
      line_total: price * quantity,
    });
  }

  const total_bags = lines.reduce((a, l) => a + l.quantity, 0);
  if (order_type === 'wholesale' && total_bags < WHOLESALE_MIN_BAGS) {
    throw new OrderError('wholesale_min', 'পাইকারি অর্ডারের জন্য সর্বনিম্ন ১০ বস্তা চাল অর্ডার করতে হবে।');
  }
  const subtotal = lines.reduce((a, l) => a + l.line_total, 0);
  const delivery = deliveryFor(district, order_type, total_bags);
  return {
    order_type,
    lines,
    total_bags,
    subtotal,
    delivery,
    grand_total: delivery.charge == null ? null : subtotal + delivery.charge,
  };
}

function dhakaDateParts(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', year: '2-digit', month: '2-digit', day: '2-digit' })
      .formatToParts(d)
      .map((x) => [x.type, x.value])
  );
  return `${p.year}${p.month}${p.day}`;
}

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** Validate customer details; returns cleaned values or throws OrderError with field errors. */
export function validateCustomer(c) {
  const errors = {};
  const name = clean(c?.name, 80);
  const phone = normalizeBdPhone(c?.phone);
  const address = clean(c?.address, 300);
  const district = clean(c?.district, 40);
  const upazila = clean(c?.upazila, 80);
  const notes = String(c?.notes ?? '').trim().slice(0, 1000);
  if (name.length < 2) errors.name = 'name';
  if (!phone) errors.phone = 'phone';
  if (address.length < 5) errors.address = 'address';
  if (!DISTRICT_KEYS.has(district)) errors.district = 'district';
  if (upazila.length < 2) errors.upazila = 'upazila';
  if (Object.keys(errors).length) {
    const e = new OrderError('customer', 'Please check the highlighted fields.');
    e.fields = errors;
    throw e;
  }
  return { name, phone, address, district, upazila, notes };
}

/** Create an order. Safe to retry with the same idempotency key. */
export function createOrder(body) {
  const key = typeof body?.idempotency_key === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(body.idempotency_key) ? body.idempotency_key : null;
  if (key) {
    const existing = db.prepare('SELECT order_no, receipt_token FROM orders WHERE idempotency_key = ?').get(key);
    if (existing) return { ...existing, duplicate: true };
  }
  const customer = validateCustomer(body?.customer);
  const plan = body?.payment_plan;
  if (!PAYMENT_PLANS.includes(plan)) throw new OrderError('payment_plan', 'Choose a payment option.');

  return tx(() => {
    // Price inside the transaction so stock and prices are consistent.
    const q = quote({ order_type: body?.order_type, items: body?.items, district: customer.district });

    const day = dhakaDateParts();
    const n = db.prepare('SELECT COUNT(*) AS n FROM orders WHERE order_no LIKE ?').get(`ZN-${day}-%`).n + 1;
    const order_no = `ZN-${day}-${String(n).padStart(4, '0')}`;
    const receipt_token = randomBytes(24).toString('base64url');

    db.prepare(
      `INSERT INTO customers (phone, name, address, district, upazila, last_order_at)
       VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       ON CONFLICT(phone) DO UPDATE SET name = excluded.name, address = excluded.address,
         district = excluded.district, upazila = excluded.upazila, last_order_at = excluded.last_order_at`
    ).run(customer.phone, customer.name, customer.address, customer.district, customer.upazila);
    const customerId = db.prepare('SELECT id FROM customers WHERE phone = ?').get(customer.phone).id;

    const { lastInsertRowid: orderId } = db
      .prepare(
        `INSERT INTO orders (order_no, receipt_token, idempotency_key, customer_id, customer_name, customer_phone,
          address, district, upazila, order_type, notes, total_bags, subtotal, delivery_charge, delivery_source,
          delivery_rate_label, grand_total, payment_plan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        order_no, receipt_token, key, customerId, customer.name, customer.phone, customer.address,
        customer.district, customer.upazila, q.order_type, customer.notes, q.total_bags, q.subtotal,
        q.delivery.charge, q.delivery.source, q.delivery.label, q.grand_total, plan
      );

    const insItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name_bn, name_en, weight_kg, unit_price, quantity, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const decStock = db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ? AND stock_qty IS NOT NULL');
    for (const l of q.lines) {
      insItem.run(orderId, l.product_id, l.name_bn, l.name_en, l.weight_kg, l.unit_price, l.quantity, l.line_total);
      decStock.run(l.quantity, l.product_id);
    }
    db.prepare("INSERT INTO order_status_history (order_id, kind, to_value, note) VALUES (?, 'created', 'pending', 'Order placed by customer')").run(orderId);
    return { order_no, receipt_token, duplicate: false };
  });
}

/** Full order with items and history (for receipts and admin). */
export function loadOrder(where, value) {
  const o = db.prepare(`SELECT * FROM orders WHERE ${where} = ?`).get(value);
  if (!o) return null;
  o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(o.id);
  return o;
}
