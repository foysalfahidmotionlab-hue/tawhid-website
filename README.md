# Tawhid Auto Rice Mill — Zinia™ website & ordering system

Bangla-first website with retail / wholesale ordering, receipts and an admin dashboard.

- **Website:** React + Tailwind + Framer Motion (Vite)
- **Server:** Node.js (Express) in `server/`
- **Database:** SQLite file at `data/zinia.db` (Node's built-in `node:sqlite`, Node 22.13+)
- **Uploads:** `data/uploads/` (resized and converted to WebP automatically)

## Run it on your computer

```bash
npm install
npm run admin:create -- owner@example.com "Owner Name"   # first time only; asks for a password
npm run dev
```

- Website: http://localhost:5173
- Admin: http://localhost:5173/admin

`npm run dev` starts the website (port 5173) and the API server (port 8787) together.

## What customers can do

1. Choose **খুচরা (retail)** or **পাইকারি (wholesale)** — prices switch instantly.
2. Pick bags of each product. Wholesale needs **at least 10 bags in total**.
3. Enter name, mobile, address, district, upazila → see the order summary.
4. Confirm → the order is saved, and they get a **receipt link** (PDF download + print).

Payment is **cash on delivery**. Orders are never marked paid automatically.

## What the admin can do (`/admin`)

- **Dashboard:** order counts by status and type, bags sold, order value, revenue, 14-day chart.
- **Orders:** search, filter, update status (Pending → Confirmed → Processing → Shipped → Delivered, or Cancelled), set delivery charge, mark paid, internal notes, receipt PDF / print, CSV export.
- **Products & prices:** add / edit / archive products, images, wholesale price, retail markup (retail = wholesale + markup), stock, enable/disable.
- **Delivery charges:** Dhaka / outside Dhaka / per district, wholesale / retail / both, flat or per bag, free from N bags.
- **Website content:** hero text, images, company info, capacity, contact details, gallery.
- **Account:** change password.

## Security

- Prices, the wholesale minimum and delivery charges are calculated **on the server**; anything the browser sends as a price is ignored.
- Admin passwords are hashed (scrypt); sessions are random tokens in an httpOnly, SameSite=Strict cookie.
- Admin writes are blocked from other websites; sign-in is rate limited.
- Receipts are only reachable through an unguessable link; there is no public order list.
- Uploads are re-encoded by `sharp` (non-images are rejected).
- No passwords or keys are stored in the code. Admin accounts are created with `npm run admin:create`.

## Going live

This needs a host that runs **Node.js 22.13+ with a persistent disk** (the database and uploads are files).
Examples: a VPS (DigitalOcean, Hetzner, Contabo, a Bangladeshi VPS), Render or Railway with a disk.
**Vercel / Netlify static hosting will not work** for the ordering system, because they have no persistent disk.

```bash
npm ci
npm run build
npm run admin:create -- owner@example.com "Owner Name"
NODE_ENV=production PORT=8787 npm start
```

Put it behind HTTPS (e.g. Caddy or Nginx) and set `TRUST_PROXY=1` so rate limiting sees real visitor IPs.
See `.env.example` for all settings. **Back up the `data/` folder** regularly — it holds all orders.

## Test deployment on Vercel (temporary data)

Vercel can run the whole site for **checking and demos**, but it has no permanent disk:
the database lives in `/tmp` and **orders, uploads and content edits can disappear at any time**
(and you may be signed out when Vercel starts a fresh copy). Do not take real orders there.

1. Import the GitHub repo on vercel.com (settings come from `vercel.json`).
2. In **Settings → Environment Variables** add `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   (10+ characters, letters and numbers) and optionally `ADMIN_NAME`, then redeploy.
   For a quick test login such as `admin` / `admin`, also add `ALLOW_SIMPLE_ADMIN_PASSWORD=1`
   — anyone could guess it, so remove it (and use a strong password) before real orders.
3. Sign in at `https://<your-project>.vercel.app/admin`.

The admin account is re-created from these settings whenever the data is reset.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Website + API for development |
| `npm run build` | Build the website into `dist/` |
| `npm start` | Production server (serves `dist/` + API) |
| `npm run admin:create -- email "Name"` | Create an admin, or reset an admin's password |
| `node scripts/api-test.mjs http://localhost:8787` | End-to-end API checks (creates test orders) |
