// Secure image uploads: memory-only intake, sharp decodes and re-encodes to
// WebP (which also strips any non-image payload and metadata), random names.
import multer from 'multer';
import sharp from 'sharp';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UPLOAD_DIR } from './db.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED.has(file.mimetype)),
}).single('image');

/**
 * Optimise an uploaded image and save it. Returns its public URL.
 * kind: 'photo' (wide images, max 2000px) or 'pack' (product images, max 1100px tall).
 */
export async function saveImage(buffer, kind = 'photo') {
  let img = sharp(buffer, { failOn: 'error', limitInputPixels: 50e6 }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error('Not an image');
  img = kind === 'pack' ? img.resize({ height: 1100, withoutEnlargement: true }) : img.resize({ width: 2000, withoutEnlargement: true });
  const out = await img.webp({ quality: 82, alphaQuality: 90 }).toBuffer();
  const name = `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}.webp`;
  writeFileSync(resolve(UPLOAD_DIR, name), out);
  return `/uploads/${name}`;
}
