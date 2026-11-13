// Zinia / Tawhid Auto Rice Mill — the Express app (API + built website).
// Started by server/index.js on a normal host, or by api/index.js on Vercel.
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UPLOAD_DIR } from './db.js';
import { sameOrigin, ensureAdminFromEnv } from './auth.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = express();

ensureAdminFromEnv();

app.disable('x-powered-by');
if (process.env.VERCEL) app.set('trust proxy', true);
else if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY);

app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.use('/api', express.json({ limit: '100kb' }), sameOrigin);
app.use('/api', publicRouter);
app.use('/api/admin', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex');
  next();
}, adminRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '365d', immutable: true, index: false }));

// Production: serve the built website, with SPA fallback for /admin and /receipt/…
// (On Vercel the website is served by Vercel itself; see vercel.json.)
const dist = resolve(root, 'dist');
if (!process.env.VERCEL && existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(resolve(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request' });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image is too large (max 12 MB).' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

export default app;
