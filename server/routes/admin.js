// Admin API. Everything except /login requires a signed-in admin.
import { Router } from 'express';
import { db, tx, getSetting, setSetting } from '../db.js';
import {
  verifyPassword, hashPassword, validatePasswordStrength, createSession, destroySession,
  requireAdmin, rateLimit,
} from '../auth.js';
import { loadOrder } from '../orders.js';
import { uploadMiddleware, saveImage } from '../uploads.js';
import { NEXT_STATUS, ORDER_STATUSES, retailPrice } from '../../src/shared/rules.js';
import { DISTRICT_KEYS } from '../../src/shared/districts.js';

export const adminRouter = Router();
const ip = (req) => req.ip || req.socket.remoteAddress || 'unknown';
const bad = (res, msg, status = 400) => res.status(status).json({ error: msg });
const int = (v) => (v === '' || v == null ? null : Number.isInteger(Number(v)) ? Number(v) : NaN);

// ---------------------------------------------------------------- auth -----
adminRouter.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!rateLimit(`login:${ip(req)}`, 10, 15 * 60e3) || !rateLimit(`login:${email}`, 8, 15 * 60e3)) {
    return bad(res, 'Too many sign-in attempts. Try again in 15 minutes.', 429);
  }
  const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
  // Always run a hash check to keep timing similar for unknown emails.
  const ok = user ? verifyPassword(password, user.password_hash) : (hashPassword(password), false);
  if (!ok) return bad(res, 'Email or password is incorrect.', 401);
  createSession(res, user.id);
  res.json({ id: user.id, email: user.email, name: user.name });
});

adminRouter.use(requireAdmin);

adminRouter.post('/logout', (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

adminRouter.get('/me', (req, res) => res.json(req.admin));

adminRouter.post('/password', (req, res) => {
  const { current, next } = req.body || {};
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin.id);
  if (!verifyPassword(String(current || ''), user.password_hash)) return bad(res, 'Current password is incorrect.');
  const weak = validatePasswordStrength(next);
  if (weak) return bad(res, weak);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hashPassword(next), user.id);
  db.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').run(user.id);
  createSession(res, user.id);
  res.json({ ok: true });
});

// ------------------------------------------------------------ dashboard ----
const dhakaDay = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });

adminRouter.get('/stats', (_req, res) => {
  const rows = db.prepare('SELECT status, order_type, total_bags, subtotal, delivery_charge, grand_total, payment_status, created_at FROM orders').all();
  const live = rows.filter((r) => r.status !== 'cancelled');
  const value = (r) => r.grand_total ?? r.subtotal + (r.delivery_charge ?? 0);
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length]));

  const days = [];
  for (let i = 13; i >= 0; i--) days.push(dhakaDay(Date.now() - i * 864e5));
  const chart = days.map((d) => {
    const dayRows = live.filter((r) => dhakaDay(r.created_at) === d);
    return { day: d, orders: dayRows.length, value: dayRows.reduce((a, r) => a + value(r), 0), bags: dayRows.reduce((a, r) => a + r.total_bags, 0) };
  });

  const recent = db
    .prepare(
      `SELECT id, order_no, created_at, customer_name, customer_phone, order_type, total_bags, subtotal,
              delivery_charge, grand_total, payment_status, status FROM orders ORDER BY id DESC LIMIT 8`
    )
    .all();

  res.json({
    total: rows.length,
    byStatus,
    wholesale: rows.filter((r) => r.order_type === 'wholesale').length,
    retail: rows.filter((r) => r.order_type === 'retail').length,
    totalBags: live.reduce((a, r) => a + r.total_bags, 0),
    totalValue: live.reduce((a, r) => a + value(r), 0),
    confirmedRevenue: live.filter((r) => r.payment_status === 'paid').reduce((a, r) => a + value(r), 0),
    pendingPayment: live.filter((r) => r.payment_status === 'unpaid').reduce((a, r) => a + value(r), 0),
    pendingDelivery: live.filter((r) => r.delivery_charge == null).length,
    chart,
    recent,
  });
});

// --------------------------------------------------------------- orders ----
function orderFilters(q) {
  const where = [];
  const args = [];
  if (q.q) {
    const s = `%${String(q.q).trim()}%`;
    where.push('(order_no LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
    args.push(s, s, s);
  }
  if (q.status && ORDER_STATUSES.includes(q.status)) {
    where.push('status = ?');
    args.push(q.status);
  }
  if (q.type === 'wholesale' || q.type === 'retail') {
    where.push('order_type = ?');
    args.push(q.type);
  }
  if (q.payment === 'paid' || q.payment === 'unpaid' || q.payment === 'refunded') {
    where.push('payment_status = ?');
    args.push(q.payment);
  }
  // Dates are Dhaka calendar days (UTC+6).
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.from || '')) {
    where.push('created_at >= ?');
    args.push(new Date(`${q.from}T00:00:00+06:00`).toISOString());
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.to || '')) {
    where.push('created_at < ?');
    args.push(new Date(new Date(`${q.to}T00:00:00+06:00`).getTime() + 864e5).toISOString());
  }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', args };
}

const itemsSummary = db.prepare(
  "SELECT group_concat(name_bn || ' × ' || quantity, ', ') AS s FROM order_items WHERE order_id = ?"
);

adminRouter.get('/orders', (req, res) => {
  const { sql, args } = orderFilters(req.query);
  const page = Math.max(1, Number(req.query.page) || 1);
  const size = 25;
  const total = db.prepare(`SELECT COUNT(*) AS n FROM orders ${sql}`).get(...args).n;
  const rows = db
    .prepare(
      `SELECT id, order_no, created_at, customer_name, customer_phone, district, upazila, order_type, total_bags,
              subtotal, delivery_charge, grand_total, payment_status, status
       FROM orders ${sql} ORDER BY id DESC LIMIT ? OFFSET ?`
    )
    .all(...args, size, (page - 1) * size)
    .map((r) => ({ ...r, products: itemsSummary.get(r.id).s }));
  res.json({ total, page, size, rows });
});

adminRouter.get('/orders.csv', (req, res) => {
  const { sql, args } = orderFilters(req.query);
  const rows = db.prepare(`SELECT * FROM orders ${sql} ORDER BY id DESC`).all(...args);
  const head = [
    'Order ID', 'Date (Dhaka)', 'Customer', 'Mobile', 'Address', 'Upazila/Area', 'District', 'Order type', 'Products',
    'Total bags', 'Subtotal (BDT)', 'Delivery (BDT)', 'Grand total (BDT)', 'Payment', 'Status', 'Customer notes', 'Internal notes',
  ];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [head.join(',')];
  for (const o of rows) {
    lines.push(
      [
        o.order_no,
        new Date(o.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
        o.customer_name, o.customer_phone, o.address, o.upazila, o.district, o.order_type,
        itemsSummary.get(o.id).s, o.total_bags, o.subtotal,
        o.delivery_charge ?? 'to be confirmed', o.grand_total ?? 'pending', o.payment_status, o.status, o.notes, o.internal_notes,
      ].map(esc).join(',')
    );
  }
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="zinia-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(`﻿${lines.join('\r\n')}`); // BOM so Excel shows Bangla correctly
});

adminRouter.get('/orders/:id', (req, res) => {
  const o = loadOrder('id', Number(req.params.id));
  if (!o) return bad(res, 'Order not found', 404);
  o.history = db
    .prepare(
      `SELECT h.*, a.name AS admin_name FROM order_status_history h
       LEFT JOIN admin_users a ON a.id = h.admin_id WHERE order_id = ? ORDER BY h.id`
    )
    .all(o.id);
  o.next_statuses = NEXT_STATUS[o.status];
  res.json(o);
});

const history = db.prepare(
  'INSERT INTO order_status_history (order_id, kind, from_value, to_value, note, admin_id) VALUES (?, ?, ?, ?, ?, ?)'
);
const touch = db.prepare("UPDATE orders SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?");

adminRouter.post('/orders/:id/status', (req, res) => {
  const o = loadOrder('id', Number(req.params.id));
  if (!o) return bad(res, 'Order not found', 404);
  const to = String(req.body?.status || '');
  const note = String(req.body?.note || '').trim().slice(0, 500);
  if (!NEXT_STATUS[o.status].includes(to)) return bad(res, `Cannot change status from ${o.status} to ${to}.`);
  if (to === 'confirmed' && o.delivery_charge == null) {
    return bad(res, 'Set the delivery charge before confirming this order.');
  }
  tx(() => {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(to, o.id);
    if (to === 'cancelled') {
      // Return reserved bags to stock.
      const inc = db.prepare('UPDATE products SET stock_qty = stock_qty + ? WHERE id = ? AND stock_qty IS NOT NULL');
      for (const i of o.items) if (i.product_id) inc.run(i.quantity, i.product_id);
    }
    history.run(o.id, 'status', o.status, to, note, req.admin.id);
    touch.run(o.id);
  });
  res.json({ ok: true });
});

adminRouter.post('/orders/:id/payment', (req, res) => {
  const o = loadOrder('id', Number(req.params.id));
  if (!o) return bad(res, 'Order not found', 404);
  const to = String(req.body?.payment_status || '');
  if (!['unpaid', 'paid', 'refunded'].includes(to)) return bad(res, 'Invalid payment status.');
  if (to === 'paid' && o.grand_total == null) return bad(res, 'Confirm the delivery charge before marking as paid.');
  if (to === o.payment_status) return res.json({ ok: true });
  tx(() => {
    db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(to, o.id);
    history.run(o.id, 'payment', o.payment_status, to, String(req.body?.note || '').slice(0, 500), req.admin.id);
    touch.run(o.id);
  });
  res.json({ ok: true });
});

adminRouter.post('/orders/:id/delivery', (req, res) => {
  const o = loadOrder('id', Number(req.params.id));
  if (!o) return bad(res, 'Order not found', 404);
  if (o.status === 'cancelled' || o.status === 'delivered') return bad(res, 'This order can no longer be changed.');
  const charge = int(req.body?.charge);
  if (charge == null || Number.isNaN(charge) || charge < 0 || charge > 10_000_000) return bad(res, 'Enter a delivery charge of 0 or more (whole taka).');
  tx(() => {
    db.prepare("UPDATE orders SET delivery_charge = ?, delivery_source = 'admin', grand_total = subtotal + ? WHERE id = ?").run(charge, charge, o.id);
    history.run(o.id, 'delivery', o.delivery_charge == null ? 'to be confirmed' : String(o.delivery_charge), String(charge), '', req.admin.id);
    touch.run(o.id);
  });
  res.json({ ok: true });
});

adminRouter.post('/orders/:id/note', (req, res) => {
  const o = loadOrder('id', Number(req.params.id));
  if (!o) return bad(res, 'Order not found', 404);
  const note = String(req.body?.note || '').trim().slice(0, 1000);
  if (!note) return bad(res, 'Write a note first.');
  const stamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });
  const combined = `${o.internal_notes ? `${o.internal_notes}\n` : ''}[${stamp} · ${req.admin.name}] ${note}`;
  tx(() => {
    db.prepare('UPDATE orders SET internal_notes = ? WHERE id = ?').run(combined, o.id);
    history.run(o.id, 'note', null, null, note, req.admin.id);
    touch.run(o.id);
  });
  res.json({ ok: true });
});

// ------------------------------------------------------------- products ----
const productList = () =>
  db
    .prepare(
      `SELECT p.*, (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY is_primary DESC, sort_order, id LIMIT 1) AS image,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS order_count
       FROM products p ORDER BY p.is_archived, p.sort_order, p.id`
    )
    .all()
    .map((p) => ({ ...p, retail_price: retailPrice(p) }));

adminRouter.get('/products', (_req, res) => res.json(productList()));

function productFields(b, existing = {}) {
  const f = {};
  const err = (m) => {
    throw Object.assign(new Error(m), { http: 400 });
  };
  if ('name_bn' in b) f.name_bn = String(b.name_bn).trim().slice(0, 120) || err('Bangla name is required.');
  if ('name_en' in b) f.name_en = String(b.name_en).trim().slice(0, 120) || err('English name is required.');
  if ('description_bn' in b) f.description_bn = String(b.description_bn).trim().slice(0, 600);
  if ('description_en' in b) f.description_en = String(b.description_en).trim().slice(0, 600);
  if ('weight_kg' in b) {
    const w = Number(b.weight_kg);
    if (!(w > 0 && w <= 200)) err('Package weight must be between 0 and 200 kg.');
    f.weight_kg = w;
  }
  if ('wholesale_price' in b) {
    const v = int(b.wholesale_price);
    if (Number.isNaN(v) || (v != null && (v <= 0 || v > 1_000_000))) err('Wholesale price must be a whole taka amount above 0.');
    f.wholesale_price = v;
  }
  if ('retail_markup' in b) {
    const v = int(b.retail_markup);
    if (v == null || Number.isNaN(v) || v < 0 || v > 100_000) err('Retail markup must be 0 or more (whole taka).');
    f.retail_markup = v;
  }
  if ('stock_qty' in b) {
    const v = int(b.stock_qty);
    if (Number.isNaN(v) || (v != null && v < 0)) err('Stock must be empty (not tracked) or 0 or more.');
    f.stock_qty = v;
  }
  if ('sort_order' in b) f.sort_order = Number(b.sort_order) || 0;
  for (const k of ['is_active', 'is_archived', 'out_of_stock']) if (k in b) f[k] = b[k] ? 1 : 0;
  const merged = { ...existing, ...f };
  if (merged.is_active && merged.wholesale_price == null) err('Set a wholesale price before enabling this product for ordering.');
  if (merged.is_archived) f.is_active = 0;
  return f;
}

const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || `rice-${Date.now().toString(36)}`;

adminRouter.post('/products', (req, res) => {
  try {
    const f = productFields({ weight_kg: 25, retail_markup: 50, ...req.body });
    if (!f.name_bn || !f.name_en) return bad(res, 'Bangla and English names are required.');
    let slug = slugify(f.name_en);
    if (db.prepare('SELECT 1 FROM products WHERE slug = ?').get(slug)) slug = `${slug}-${Date.now().toString(36)}`;
    const cols = ['slug', ...Object.keys(f)];
    const { lastInsertRowid } = db
      .prepare(`INSERT INTO products (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
      .run(slug, ...Object.values(f));
    res.status(201).json(productList().find((p) => p.id === Number(lastInsertRowid)));
  } catch (e) {
    if (e.http) return bad(res, e.message);
    throw e;
  }
});

adminRouter.patch('/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id));
  if (!p) return bad(res, 'Product not found', 404);
  try {
    const f = productFields(req.body || {}, p);
    if (Object.keys(f).length) {
      db.prepare(
        `UPDATE products SET ${Object.keys(f).map((k) => `${k} = ?`).join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
      ).run(...Object.values(f), p.id);
    }
    res.json(productList().find((x) => x.id === p.id));
  } catch (e) {
    if (e.http) return bad(res, e.message);
    throw e;
  }
});

adminRouter.delete('/products/:id', (req, res) => {
  const p = db.prepare('SELECT id FROM products WHERE id = ?').get(Number(req.params.id));
  if (!p) return bad(res, 'Product not found', 404);
  const used = db.prepare('SELECT COUNT(*) AS n FROM order_items WHERE product_id = ?').get(p.id).n;
  if (used) {
    db.prepare('UPDATE products SET is_archived = 1, is_active = 0 WHERE id = ?').run(p.id);
    return res.json({ archived: true });
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(p.id);
  res.json({ deleted: true });
});

adminRouter.post('/products/:id/image', uploadMiddleware, async (req, res) => {
  const p = db.prepare('SELECT id FROM products WHERE id = ?').get(Number(req.params.id));
  if (!p) return bad(res, 'Product not found', 404);
  if (!req.file) return bad(res, 'Choose a JPG, PNG or WebP image (max 12 MB).');
  try {
    const url = await saveImage(req.file.buffer, 'pack');
    tx(() => {
      db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(p.id);
      db.prepare('INSERT INTO product_images (product_id, url, is_primary) VALUES (?, ?, 1)').run(p.id, url);
    });
    res.json(productList().find((x) => x.id === p.id));
  } catch {
    bad(res, 'That file could not be read as an image.');
  }
});

// ------------------------------------------------------- delivery rates ----
adminRouter.get('/delivery-rates', (_req, res) => {
  res.json(db.prepare('SELECT * FROM delivery_rates ORDER BY zone, district, order_type, id').all());
});

function rateFields(b) {
  const zone = String(b.zone || '');
  const mode = String(b.mode || '');
  const order_type = String(b.order_type || 'any');
  if (!['dhaka', 'outside_dhaka', 'district'].includes(zone)) return 'Choose a zone.';
  if (zone === 'district' && !DISTRICT_KEYS.has(b.district)) return 'Choose a district.';
  if (!['flat', 'per_bag', 'free'].includes(mode)) return 'Choose a charge type.';
  if (!['any', 'wholesale', 'retail'].includes(order_type)) return 'Choose an order type.';
  const amount = mode === 'free' ? 0 : int(b.amount);
  if (amount == null || Number.isNaN(amount) || amount < 0) return 'Enter the charge in whole taka.';
  const free_from_bags = int(b.free_from_bags);
  if (Number.isNaN(free_from_bags) || (free_from_bags != null && free_from_bags < 1)) return 'Free-from bags must be empty or 1 or more.';
  const label = String(b.label || '').trim().slice(0, 80);
  return {
    label: label || `${zone === 'district' ? b.district : zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'} · ${order_type}`,
    zone,
    district: zone === 'district' ? b.district : null,
    order_type,
    mode,
    amount,
    free_from_bags,
    is_active: b.is_active === false ? 0 : 1,
  };
}

adminRouter.post('/delivery-rates', (req, res) => {
  const f = rateFields(req.body || {});
  if (typeof f === 'string') return bad(res, f);
  const cols = Object.keys(f);
  db.prepare(`INSERT INTO delivery_rates (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...Object.values(f));
  res.status(201).json({ ok: true });
});

adminRouter.put('/delivery-rates/:id', (req, res) => {
  const f = rateFields(req.body || {});
  if (typeof f === 'string') return bad(res, f);
  const r = db
    .prepare(`UPDATE delivery_rates SET ${Object.keys(f).map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
    .run(...Object.values(f), Number(req.params.id));
  if (!r.changes) return bad(res, 'Rate not found', 404);
  res.json({ ok: true });
});

adminRouter.delete('/delivery-rates/:id', (req, res) => {
  db.prepare('DELETE FROM delivery_rates WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

// -------------------------------------------------------------- content ----
const CONTENT_TEXT_KEYS = [
  'hero_title_bn', 'hero_title_en', 'hero_sub_bn', 'hero_sub_en',
  'company_name_bn', 'company_name_en', 'company_short_bn', 'company_short_en',
  'contact_address_bn', 'contact_address_en', 'contact_phone', 'contact_email', 'capacity',
];
const CONTENT_IMAGE_KEYS = ['hero_bg_image', 'story_banner_image', 'footer_banner_image'];
const isUploadUrl = (v) => v === '' || v == null || /^\/(uploads|images)\/[\w./-]+$/.test(v);

adminRouter.get('/content', (_req, res) => res.json(getSetting('content', {})));

adminRouter.put('/content', (req, res) => {
  const b = req.body || {};
  const out = {};
  for (const k of CONTENT_TEXT_KEYS) if (b[k] != null && String(b[k]).trim()) out[k] = String(b[k]).trim().slice(0, 400);
  if (out.capacity && !/^\d{1,5}$/.test(out.capacity)) return bad(res, 'Capacity must be a whole number of tons.');
  for (const k of CONTENT_IMAGE_KEYS) {
    if (!isUploadUrl(b[k])) return bad(res, 'Invalid image.');
    if (b[k]) out[k] = b[k];
  }
  for (const k of ['showcase_images', 'gallery_images']) {
    if (b[k] && typeof b[k] === 'object') {
      const m = {};
      for (const [slot, url] of Object.entries(b[k])) {
        if (!/^[\w-]{1,40}$/.test(slot) || !isUploadUrl(url)) return bad(res, 'Invalid image.');
        if (url) m[slot] = url;
      }
      out[k] = m;
    }
  }
  setSetting('content', out);
  res.json(out);
});

adminRouter.post('/upload', uploadMiddleware, async (req, res) => {
  if (!req.file) return bad(res, 'Choose a JPG, PNG or WebP image (max 12 MB).');
  try {
    res.json({ url: await saveImage(req.file.buffer, req.query.kind === 'pack' ? 'pack' : 'photo') });
  } catch {
    bad(res, 'That file could not be read as an image.');
  }
});
