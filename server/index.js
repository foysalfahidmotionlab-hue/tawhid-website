// Zinia / Tawhid Auto Rice Mill — API + website server.
//   dev:  `npm run dev`   (Vite on :5173 proxies /api and /uploads here)
//   prod: `npm run build && npm start`  (serves the built site from dist/)
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UPLOAD_DIR, db } from './db.js';
import { sameOrigin } from './auth.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = express();
const PORT = Number(process.env.API_PORT || process.env.PORT) || 8787;

app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY);

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
const dist = resolve(root, 'dist');
if (existsSync(dist)) {
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

app.listen(PORT, () => {
  const admins = db.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n;
  console.log(`Zinia server on http://localhost:${PORT}`);
  if (!admins) console.log('No admin account yet — create one with:  npm run admin:create -- you@example.com "Your Name"');
});
