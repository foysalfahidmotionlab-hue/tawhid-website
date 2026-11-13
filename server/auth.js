// Admin authentication: scrypt password hashes + random session tokens in an
// httpOnly cookie. Only a SHA-256 hash of each session token is stored.
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { db } from './db.js';

const COOKIE = 'zinia_admin';
const SESSION_DAYS = 7;
const isProd = process.env.NODE_ENV === 'production';

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [alg, saltHex, hashHex] = String(stored).split('$');
  if (alg !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(expected, actual);
}

export function validatePasswordStrength(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain letters and numbers.';
  return null;
}

const sha = (s) => createHash('sha256').update(s).digest('hex');

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function createSession(res, adminId) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db.prepare('INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)').run(sha(token), adminId, expires.toISOString());
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}${isProd ? '; Secure' : ''}`
  );
}

export function destroySession(req, res) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (token) db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(sha(token));
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProd ? '; Secure' : ''}`);
}

/** Express middleware: requires a valid admin session. Sets req.admin. */
export function requireAdmin(req, res, next) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  const row = db
    .prepare(
      `SELECT a.id, a.email, a.name, s.expires_at FROM admin_sessions s
       JOIN admin_users a ON a.id = s.admin_id WHERE s.token_hash = ?`
    )
    .get(sha(token));
  if (!row || new Date(row.expires_at) < new Date()) {
    if (row) db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(sha(token));
    return res.status(401).json({ error: 'Session expired' });
  }
  req.admin = { id: row.id, email: row.email, name: row.name };
  next();
}

/**
 * Blocks cross-site writes: state-changing requests must come from this site.
 * (Cookies are also SameSite=Strict.)
 */
export function sameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ error: 'Cross-site request blocked' });
    } catch {
      return res.status(403).json({ error: 'Bad origin' });
    }
  }
  next();
}

// ---- simple in-memory rate limiter ----------------------------------------
const buckets = new Map();
/** Allow `limit` hits per `windowMs` per key. Returns true when allowed. */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n += 1;
  return b.n <= limit;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  db.prepare("DELETE FROM admin_sessions WHERE expires_at < strftime('%Y-%m-%dT%H:%M:%fZ','now')").run();
}, 10 * 60e3).unref();

/**
 * Optional first admin from environment settings (ADMIN_EMAIL + ADMIN_PASSWORD),
 * set in the host's dashboard — never in code. Only creates the account when that
 * email doesn't exist yet; it never changes an existing password.
 * Used on Vercel, where there is no terminal to run `npm run admin:create`.
 */
export function ensureAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (db.prepare('SELECT 1 FROM admin_users WHERE email = ?').get(email)) return;
  const weak = validatePasswordStrength(password);
  if (weak) {
    console.error(`ADMIN_PASSWORD not used: ${weak}`);
    return;
  }
  db.prepare('INSERT INTO admin_users (email, name, password_hash) VALUES (?, ?, ?)')
    .run(email, process.env.ADMIN_NAME?.trim() || 'Admin', hashPassword(password));
  console.log(`Admin account created for ${email} from environment settings.`);
}
