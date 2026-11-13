// Vercel entry: every /api/* and /uploads/* request is sent here (see vercel.json).
// Note: on Vercel the database lives in /tmp and is TEMPORARY — fine for a test
// deployment, not for real orders. Use a Node host with a disk for the live shop.
export { default } from '../server/app.js';
