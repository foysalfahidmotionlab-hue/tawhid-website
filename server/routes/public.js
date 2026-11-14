// Customer-facing API. No customer data is listed here; a receipt can only be
// read with its unguessable receipt token.
import { Router } from 'express';
import { db, getSetting } from '../db.js';
import { quote, createOrder, loadOrder, OrderError } from '../orders.js';
import { rateLimit } from '../auth.js';
import { retailPrice } from '../../src/shared/rules.js';

export const publicRouter = Router();

const ip = (req) => req.ip || req.socket.remoteAddress || 'unknown';

/** Purchasable products with server-side prices + editable site content. */
publicRouter.get('/catalog', (_req, res) => {
  const products = db
    .prepare(
      `SELECT p.id, p.slug, p.name_bn, p.name_en, p.description_bn, p.description_en, p.weight_kg,
              p.wholesale_price, p.retail_markup, p.out_of_stock, p.stock_qty,
              (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY is_primary DESC, sort_order, id LIMIT 1) AS image
       FROM products p
       WHERE p.is_active = 1 AND p.is_archived = 0 AND p.wholesale_price IS NOT NULL
       ORDER BY p.sort_order, p.id`
    )
    .all()
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name_bn: p.name_bn,
      name_en: p.name_en,
      description_bn: p.description_bn,
      description_en: p.description_en,
      weight_kg: p.weight_kg,
      wholesale_price: p.wholesale_price,
      retail_price: retailPrice(p),
      available: !p.out_of_stock && (p.stock_qty == null || p.stock_qty > 0),
      stock_qty: p.stock_qty,
      image: p.image,
    }));
  res.set('Cache-Control', 'no-store');
  res.json({ products, content: getSetting('content', {}) });
});

function sendError(res, e) {
  if (e instanceof OrderError) return res.status(e.status).json({ error: e.message, code: e.code, fields: e.fields });
  console.error(e);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

/** Price check for the checkout summary (nothing is saved). */
publicRouter.post('/quote', (req, res) => {
  if (!rateLimit(`quote:${ip(req)}`, 120, 60e3)) return res.status(429).json({ error: 'Too many requests' });
  try {
    const q = quote({ order_type: req.body?.order_type, items: req.body?.items, district: req.body?.district });
    res.json(q);
  } catch (e) {
    sendError(res, e);
  }
});

/** Place an order. Returns the order number and the receipt token. */
publicRouter.post('/orders', (req, res) => {
  if (!rateLimit(`order:${ip(req)}`, 15, 15 * 60e3)) {
    return res.status(429).json({ error: 'অনেকগুলো অর্ডার একসাথে পাঠানো হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' });
  }
  try {
    const out = createOrder(req.body);
    res.status(out.duplicate ? 200 : 201).json(out);
  } catch (e) {
    sendError(res, e);
  }
});

/** Receipt data — only via the secret token. */
publicRouter.get('/receipt/:token', (req, res) => {
  const token = String(req.params.token || '');
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return res.status(404).json({ error: 'Not found' });
  const o = loadOrder('receipt_token', token);
  if (!o) return res.status(404).json({ error: 'Not found' });
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex');
  res.json({
    order_no: o.order_no,
    created_at: o.created_at,
    customer_name: o.customer_name,
    customer_phone: o.customer_phone,
    address: o.address,
    district: o.district,
    upazila: o.upazila,
    order_type: o.order_type,
    notes: o.notes,
    total_bags: o.total_bags,
    subtotal: o.subtotal,
    delivery_charge: o.delivery_charge,
    delivery_source: o.delivery_source,
    grand_total: o.grand_total,
    payment_method: o.payment_method,
    payment_plan: o.payment_plan,
    payment_status: o.payment_status,
    amount_paid: o.amount_paid,
    status: o.status,
    items: o.items.map((i) => ({
      name_bn: i.name_bn,
      name_en: i.name_en,
      weight_kg: i.weight_kg,
      unit_price: i.unit_price,
      quantity: i.quantity,
      line_total: i.line_total,
    })),
    company: getSetting('content', {}),
  });
});
