// End-to-end API checks for the ordering system.
//   node scripts/api-test.mjs http://localhost:8788
// Uses the admin login from ADMIN-LOGIN.local.txt. Creates real test orders.
import { readFileSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8787';
const creds = readFileSync(new URL('../ADMIN-LOGIN.local.txt', import.meta.url), 'utf8');
const email = creds.match(/Email:\s+(\S+)/)[1];
const password = creds.match(/Password:\s+(\S+)/)[1];

let pass = 0;
let fail = 0;
const check = (name, ok, extra = '') => {
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  — ${extra}` : ''}`);
};
let cookie = '';
async function api(path, { method = 'GET', body, admin = false } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', Origin: BASE, ...(admin && cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

const customer = { name: 'Test Customer', phone: '০১৭১১-২২২৩৩৩', address: 'House 12, Road 3, Test Para', district: 'Rajshahi', upazila: 'Boalia', notes: 'API test' };
const key = () => `test-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// --- catalog ---
const cat = await api('/api/catalog');
const katari = cat.json.products.find((p) => p.slug === 'katari-nazirshail');
const nazir = cat.json.products.find((p) => p.slug === '29-nazir');
check('catalog lists only the 2 sellable products', cat.json.products.length === 2, cat.json.products.map((p) => p.slug).join(', '));
check('Katari prices 1900 / 1950', katari?.wholesale_price === 1900 && katari?.retail_price === 1950);
check('29 Nazir prices 1230 / 1280', nazir?.wholesale_price === 1230 && nazir?.retail_price === 1280);

// --- wholesale minimum ---
let r = await api('/api/quote', { method: 'POST', body: { order_type: 'wholesale', items: [{ product_id: katari.id, quantity: 4 }, { product_id: nazir.id, quantity: 5 }], district: 'Dhaka' } });
check('wholesale 9 bags rejected', r.status === 400 && r.json.code === 'wholesale_min', r.json.error);
r = await api('/api/quote', { method: 'POST', body: { order_type: 'wholesale', items: [{ product_id: katari.id, quantity: 4 }, { product_id: nazir.id, quantity: 6 }], district: 'Dhaka' } });
check('wholesale 10 bags across products accepted', r.status === 200 && r.json.total_bags === 10);
check('wholesale subtotal = 4×1900 + 6×1230 = 14980', r.json.subtotal === 14980, String(r.json.subtotal));
check('no delivery rate yet → pending', r.json.delivery.charge === null && r.json.grand_total === null);

// --- bad input ---
r = await api('/api/quote', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: 0 }] } });
check('zero quantity rejected', r.status === 400 && r.json.code === 'quantity');
r = await api('/api/quote', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: -3 }] } });
check('negative quantity rejected', r.status === 400);
r = await api('/api/quote', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: 2.5 }] } });
check('fractional quantity rejected', r.status === 400);
const inactive = (await api('/api/admin/products', { admin: true })).json;
check('admin API blocked without login', !Array.isArray(inactive));
r = await api('/api/orders', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: 1, unit_price: 1 }], customer: { ...customer, phone: '12345' }, payment_plan: 'advance10', idempotency_key: key() } });
check('invalid phone rejected', r.status === 400 && r.json.fields?.phone === 'phone');

// --- a payment option is required ---
r = await api('/api/orders', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: 1 }], customer, idempotency_key: key() } });
check('order without payment option rejected', r.status === 400 && r.json.code === 'payment_plan', r.json.error);
r = await api('/api/orders', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: 1 }], customer, payment_plan: 'free', idempotency_key: key() } });
check('unknown payment option rejected', r.status === 400 && r.json.code === 'payment_plan');

// --- price tampering is ignored ---
r = await api('/api/orders', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: 2, unit_price: 1, line_total: 2 }], subtotal: 2, delivery_charge: 0, customer, payment_plan: 'advance10', idempotency_key: key() } });
check('retail order saved', r.status === 201 && /^ZN-\d{6}-\d{4}$/.test(r.json.order_no), r.json.order_no);
const retailToken = r.json.receipt_token;
let rc = await api(`/api/receipt/${retailToken}`);
check('server ignored sent prices (2×1950 = 3900)', rc.json.subtotal === 3900 && rc.json.items[0].unit_price === 1950);
check('phone normalised from Bangla digits', rc.json.customer_phone === '01711222333', rc.json.customer_phone);
check('receipt: pending delivery, unpaid, pending', rc.json.delivery_charge === null && rc.json.grand_total === null && rc.json.payment_status === 'unpaid' && rc.json.status === 'pending');
check('receipt hides internal fields', !('internal_notes' in rc.json) && !('idempotency_key' in rc.json));
check('bad receipt token → 404', (await api('/api/receipt/not-a-real-token-123456789')).status === 404);

// --- duplicate submission ---
const k = key();
const body = { order_type: 'retail', items: [{ product_id: nazir.id, quantity: 1 }], customer, payment_plan: 'full', idempotency_key: k };
const [a, b] = await Promise.all([api('/api/orders', { method: 'POST', body }), api('/api/orders', { method: 'POST', body })]);
check('double submit creates one order', a.json.order_no === b.json.order_no, `${a.json.order_no} / ${b.json.order_no}`);

// --- admin ---
r = await api('/api/admin/login', { method: 'POST', body: { email, password: 'wrong-password-1' } });
check('wrong password rejected', r.status === 401);
r = await api('/api/admin/login', { method: 'POST', body: { email, password }, admin: true });
check('admin login', r.status === 200);
r = await api('/api/admin/delivery-rates', { method: 'POST', admin: true, body: { zone: 'outside_dhaka', order_type: 'wholesale', mode: 'per_bag', amount: 40, free_from_bags: 50, label: 'Outside Dhaka wholesale (test)' } });
check('admin adds delivery rate', r.status === 201);
r = await api('/api/quote', { method: 'POST', body: { order_type: 'wholesale', items: [{ product_id: katari.id, quantity: 10 }], district: 'Rajshahi' } });
check('per-bag delivery 10×40 = 400', r.json.delivery.charge === 400 && r.json.grand_total === 19400, JSON.stringify(r.json.delivery));
r = await api('/api/quote', { method: 'POST', body: { order_type: 'wholesale', items: [{ product_id: katari.id, quantity: 50 }], district: 'Rajshahi' } });
check('free delivery from 50 bags', r.json.delivery.charge === 0);
r = await api('/api/quote', { method: 'POST', body: { order_type: 'retail', items: [{ product_id: katari.id, quantity: 1 }], district: 'Rajshahi' } });
check('retail outside Dhaka still pending (no retail rate)', r.json.delivery.charge === null);

const list = await api(`/api/admin/orders?q=${encodeURIComponent(rc.json.order_no)}`, { admin: true });
const id = list.json.rows[0]?.id;
check('admin finds order by ID', list.json.rows[0]?.order_no === rc.json.order_no);
r = await api(`/api/admin/orders/${id}/status`, { method: 'POST', admin: true, body: { status: 'confirmed' } });
check('cannot confirm before delivery charge is set', r.status === 400, r.json.error);
r = await api(`/api/admin/orders/${id}/status`, { method: 'POST', admin: true, body: { status: 'delivered' } });
check('cannot skip pending → delivered', r.status === 400);
r = await api(`/api/admin/orders/${id}/delivery`, { method: 'POST', admin: true, body: { charge: 150 } });
check('admin sets delivery charge', r.status === 200);
r = await api(`/api/admin/orders/${id}/status`, { method: 'POST', admin: true, body: { status: 'confirmed', note: 'Called customer' } });
check('admin confirms order', r.status === 200);
rc = await api(`/api/receipt/${retailToken}`);
check('receipt now shows 3900 + 150 = 4050, confirmed', rc.json.grand_total === 4050 && rc.json.status === 'confirmed');
check('receipt keeps payment option 10% advance', rc.json.payment_plan === 'advance10' && rc.json.amount_paid === 0);

// --- payments: advance (10% of 3900 = 390), then full ---
r = await api(`/api/admin/orders/${id}/payment`, { method: 'POST', admin: true, body: { payment_status: 'advance_paid' } });
check('admin records advance received', r.status === 200, r.json.error);
rc = await api(`/api/receipt/${retailToken}`);
check('advance 390 recorded, still not fully paid', rc.json.amount_paid === 390 && rc.json.payment_status === 'unpaid');
r = await api(`/api/admin/orders?payment=advance_paid`, { admin: true });
check('filter: advance paid', r.json.rows.some((x) => x.id === id));
r = await api(`/api/admin/orders/${id}/payment`, { method: 'POST', admin: true, body: { payment_status: 'paid' } });
rc = await api(`/api/receipt/${retailToken}`);
check('paid in full = 4050', r.status === 200 && rc.json.payment_status === 'paid' && rc.json.amount_paid === 4050);
r = await api(`/api/admin/orders/${id}/payment`, { method: 'POST', admin: true, body: { payment_status: 'bogus' } });
check('invalid payment status rejected', r.status === 400);

// price change keeps history
r = await api(`/api/admin/products/${katari.id}`, { method: 'PATCH', admin: true, body: { wholesale_price: 2000 } });
check('price change → retail auto 2050', r.json.retail_price === 2050);
rc = await api(`/api/receipt/${retailToken}`);
check('old order keeps old price 1950', rc.json.items[0].unit_price === 1950);
await api(`/api/admin/products/${katari.id}`, { method: 'PATCH', admin: true, body: { wholesale_price: 1900 } });

const stats = await api('/api/admin/stats', { admin: true });
check('dashboard stats load', stats.status === 200 && stats.json.total >= 2, `total ${stats.json.total}, bags ${stats.json.totalBags}`);
const csv = await fetch(`${BASE}/api/admin/orders.csv`, { headers: { Cookie: cookie } });
check('CSV export', csv.status === 200 && (await csv.text()).includes('Order ID'));
r = await api('/api/admin/logout', { method: 'POST', admin: true });
check('logout ends session', (await api('/api/admin/stats', { admin: true })).status === 401);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
