import { images } from './images';

/**
 * Product catalogue (Bangla + English).
 * - `image`: packaging photo shown in the product showcase.
 *   Rice 29 and Rice 28 use the general Zinia premium pack until their own
 *   packaging photos are ready — replace the path when you have them.
 * - `grainPhoto`: close-up used in "See the difference up close"
 *   (temporary stock photography — replace with real photos of each variety).
 * - Descriptions are temporary placeholders.
 */
export const products = [
  {
    id: 'katari',
    name: { bn: 'কাটারি চাল', en: 'Katari Rice' },
    short: { bn: 'কাটারি', en: 'Katari' },
    description: {
      bn: 'সরু, মিহি দানা — যত্নে ছাঁটাই করা, প্রতিটি পরিবেশনে পরিচ্ছন্ন ও আকর্ষণীয়।',
      en: 'Fine, slender grains milled with care for a clean finish on every table.',
    },
    image: '/images/packs/katari.webp',
    grainPhoto: images.riceBoard,
  },
  {
    id: 'nazir',
    name: { bn: 'নাজির চাল', en: 'Nazir Rice' },
    short: { bn: 'নাজির', en: 'Nazir' },
    description: {
      bn: 'প্রতিদিনের রুচিশীল পছন্দ — সমান দানা ও নির্ভরযোগ্য রান্নার জন্য প্রক্রিয়াজাত।',
      en: 'A refined everyday choice, processed for consistent grains and a dependable result.',
    },
    image: '/images/packs/trio.webp',
    grainPhoto: images.riceScoop,
  },
  {
    id: 'miniket',
    name: { bn: 'মিনিকেট চাল', en: 'Miniket Rice' },
    short: { bn: 'মিনিকেট', en: 'Miniket' },
    description: {
      bn: 'আধুনিক স্বয়ংক্রিয় প্রক্রিয়ায় তৈরি পালিশ করা, সমান আকারের দানা — ঘর ও ব্যবসা দুইয়ের জন্যই।',
      en: 'Polished, uniform grains prepared through modern automatic processing for homes and businesses.',
    },
    image: '/images/packs/premium-scene.webp',
    grainPhoto: images.rawRice,
  },
  {
    id: 'rice-29',
    name: { bn: '২৯ চাল', en: 'Rice 29' },
    short: { bn: '২৯', en: 'Rice 29' },
    description: {
      bn: 'প্রতিদিনের খাবারের জন্য আস্থার জাত — পরিষ্কার, ছাঁটাই ও প্যাক করা একই মানে।',
      en: 'A trusted variety for daily meals — cleaned, milled and packed to the same standard.',
    },
    image: '/images/packs/premium-cloth.webp',
    grainPhoto: images.paddyBasket,
  },
  {
    id: 'rice-28',
    name: { bn: '২৮ চাল', en: 'Rice 28' },
    short: { bn: '২৮', en: 'Rice 28' },
    description: {
      bn: 'জনপ্রিয় নিত্যদিনের চাল — ধান থেকে প্যাকেট পর্যন্ত সমান মানের প্রতি মনোযোগে প্রক্রিয়াজাত।',
      en: 'A popular staple, processed with attention to consistency from paddy to package.',
    },
    image: '/images/packs/premium-cloth.webp',
    grainPhoto: images.goldenStalk,
  },
];

/** Packaging photos for group shots. */
export const packs = {
  katari: '/images/packs/katari.webp',
  trio: '/images/packs/trio.webp',
  scene: '/images/packs/premium-scene.webp',
  cloth: '/images/packs/premium-cloth.webp',
};
