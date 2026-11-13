// SQLite database (Node's built-in node:sqlite). One file: data/zinia.db
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = resolve(process.env.DATA_DIR || resolve(root, 'data'));
export const UPLOAD_DIR = resolve(DATA_DIR, 'uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new DatabaseSync(resolve(DATA_DIR, 'zinia.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');

/** Run fn inside a transaction; rolls back on error. */
export function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  weight_kg REAL NOT NULL DEFAULT 25,
  wholesale_price INTEGER,            -- taka per bag; NULL = no price yet
  retail_markup INTEGER NOT NULL DEFAULT 50,
  is_active INTEGER NOT NULL DEFAULT 0,    -- purchasable
  is_archived INTEGER NOT NULL DEFAULT 0,
  out_of_stock INTEGER NOT NULL DEFAULT 0,
  stock_qty INTEGER,                   -- NULL = not tracked
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_order_at TEXT
);

CREATE TABLE IF NOT EXISTS delivery_rates (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('dhaka','outside_dhaka','district')),
  district TEXT,                        -- for zone = 'district'
  order_type TEXT NOT NULL DEFAULT 'any' CHECK (order_type IN ('any','wholesale','retail')),
  mode TEXT NOT NULL CHECK (mode IN ('flat','per_bag','free')),
  amount INTEGER NOT NULL DEFAULT 0,    -- taka (flat total, or per bag)
  free_from_bags INTEGER,               -- free when total bags >= this
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  receipt_token TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('wholesale','retail')),
  notes TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  total_bags INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_charge INTEGER,              -- NULL = to be confirmed
  delivery_source TEXT NOT NULL,        -- 'rate' | 'pending' | 'admin'
  delivery_rate_label TEXT,
  grand_total INTEGER,                  -- NULL while delivery is pending
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS orders_phone ON orders(customer_phone);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  unit_price INTEGER NOT NULL,          -- price confirmed at order time
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                   -- 'status' | 'payment' | 'delivery' | 'note' | 'created'
  from_value TEXT,
  to_value TEXT,
  note TEXT NOT NULL DEFAULT '',
  admin_id INTEGER REFERENCES admin_users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,                  -- JSON
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
`;

db.exec(SCHEMA);

// ---- seed (first run only) ------------------------------------------------
const hasProducts = db.prepare('SELECT COUNT(*) AS n FROM products').get().n > 0;
if (!hasProducts) {
  const ins = db.prepare(`INSERT INTO products
    (slug, name_bn, name_en, description_bn, description_en, weight_kg, wholesale_price, retail_markup, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, 25, ?, 50, ?, ?)`);
  const img = db.prepare('INSERT INTO product_images (product_id, url, is_primary) VALUES (?, ?, 1)');
  const seed = [
    ['katari-nazirshail', 'জিনিয়া কাটারি নাজিরশাইল', 'Zinia Katari Nazirshail Rice',
      'সরু, মিহি দানা — যত্নে ছাঁটাই করা, প্রতিটি পরিবেশনে পরিচ্ছন্ন ও আকর্ষণীয়।',
      'Fine, slender grains milled with care for a clean finish on every table.', 1900, 1, 1, '/images/packs/katari.webp'],
    ['29-nazir', 'জিনিয়া ২৯ নাজির', 'Zinia 29 Nazir Rice',
      'প্রতিদিনের খাবারের জন্য আস্থার চাল — পরিষ্কার, ছাঁটাই ও প্যাক করা একই মানে।',
      'A trusted everyday rice — cleaned, milled and packed to the same standard.', 1230, 1, 2, '/images/packs/premium-cloth.webp'],
    ['miniket', 'জিনিয়া মিনিকেট', 'Zinia Miniket Rice',
      'আধুনিক স্বয়ংক্রিয় প্রক্রিয়ায় তৈরি পালিশ করা, সমান আকারের দানা।',
      'Polished, uniform grains from modern automatic processing.', null, 0, 3, '/images/packs/premium-scene.webp'],
    ['rice-28', 'জিনিয়া ২৮', 'Zinia Rice 28',
      'জনপ্রিয় নিত্যদিনের চাল — ধান থেকে প্যাকেট পর্যন্ত সমান মানে প্রক্রিয়াজাত।',
      'A popular staple, processed with care from paddy to package.', null, 0, 4, '/images/packs/premium-cloth.webp'],
  ];
  tx(() => {
    for (const [slug, nbn, nen, dbn, den, price, active, order, url] of seed) {
      const { lastInsertRowid } = ins.run(slug, nbn, nen, dbn, den, price, active, order);
      img.run(lastInsertRowid, url);
    }
  });
}

/** Read a JSON setting. */
export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

/** Write a JSON setting. */
export function setSetting(key, value) {
  db.prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(key, JSON.stringify(value));
}
