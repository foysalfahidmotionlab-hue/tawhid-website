// Zinia / Tawhid Auto Rice Mill — API + website server.
//   dev:  `npm run dev`   (Vite on :5173 proxies /api and /uploads here)
//   prod: `npm run build && npm start`  (serves the built site from dist/)
import app from './app.js';
import { db } from './db.js';

const PORT = Number(process.env.API_PORT || process.env.PORT) || 8787;

app.listen(PORT, () => {
  const admins = db.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n;
  console.log(`Zinia server on http://localhost:${PORT}`);
  if (!admins) console.log('No admin account yet — create one with:  npm run admin:create -- you@example.com "Your Name"');
});
