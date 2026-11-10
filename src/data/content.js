import {
  Factory,
  Cog,
  Wheat,
  Package,
  Gauge,
  Sparkles,
  Layers,
  Filter,
  Settings2,
  PackageCheck,
} from 'lucide-react';
import { images } from './images';
import { packs } from './products';

/** "Quality You Can Trust" points */
export const highlights = [
  {
    icon: Gauge,
    title: { bn: '৪৮ টন দৈনিক উৎপাদন', en: '48 Tons Daily' },
    text: {
      bn: 'স্থির ও নির্ভরযোগ্য সরবরাহের জন্য প্রতিদিন ৪৮ টন প্রক্রিয়াজাতকরণ সক্ষমতা।',
      en: 'A daily capacity built for steady, dependable supply.',
    },
  },
  {
    icon: Sparkles,
    title: { bn: 'প্রিমিয়াম মানের চাল', en: 'Premium Quality' },
    text: {
      bn: 'প্রতিটি ব্যাচ একটিই লক্ষ্যে প্রক্রিয়াজাত — সেরা মানের চাল।',
      en: 'Every batch processed with one aim — the best quality rice.',
    },
  },
  {
    icon: Settings2,
    title: { bn: 'আধুনিক প্রক্রিয়াজাতকরণ', en: 'Modern Processing' },
    text: {
      bn: 'স্বয়ংক্রিয় প্রক্রিয়া প্রতিটি ধাপকে রাখে দক্ষ, পরিচ্ছন্ন ও সামঞ্জস্যপূর্ণ।',
      en: 'Automatic milling keeps every stage efficient, clean and consistent.',
    },
  },
  {
    icon: Layers,
    title: { bn: 'পাঁচটি জাত', en: 'Five Varieties' },
    text: {
      bn: 'কাটারি, নাজির, মিনিকেট, ২৯ ও ২৮ — পাঁচটি জাত, একটিই মান।',
      en: 'Katari, Nazir, Miniket, Rice 29 and Rice 28 — one standard.',
    },
  },
];

/** Production workflow (generic steps — edit as needed) */
export const workflow = [
  {
    icon: Wheat,
    title: { bn: 'ধান গ্রহণ', en: 'Paddy Intake' },
    text: { bn: 'ধান গ্রহণ করে প্রক্রিয়াজাতকরণের জন্য প্রস্তুত করা হয়।', en: 'Paddy is received and prepared for processing.' },
  },
  {
    icon: Filter,
    title: { bn: 'পরিষ্কারকরণ', en: 'Cleaning' },
    text: { bn: 'ছাঁটাইয়ের আগে ময়লা ও অপদ্রব্য সরানো হয়।', en: 'Impurities are removed before milling begins.' },
  },
  {
    icon: Cog,
    title: { bn: 'মিলিং', en: 'Milling' },
    text: { bn: 'স্বয়ংক্রিয় খোসা ছাড়ানো ও ছাঁটাইয়ে বেরিয়ে আসে দানা।', en: 'Automatic husking and milling bring out the grain.' },
  },
  {
    icon: Layers,
    title: { bn: 'গ্রেডিং', en: 'Grading' },
    text: { bn: 'সমান মানের জন্য দানা বাছাই করা হয়।', en: 'Grains are sorted for a consistent finish.' },
  },
  {
    icon: PackageCheck,
    title: { bn: 'প্যাকেজিং', en: 'Packaging' },
    text: { bn: 'তৈরি চাল প্যাক করে সরবরাহের জন্য প্রস্তুত করা হয়।', en: 'Finished rice is packed and readied for dispatch.' },
  },
];

/** Quality promises */
export const promises = [
  {
    title: { bn: 'সামঞ্জস্যপূর্ণ মান', en: 'A Consistent Standard' },
    text: {
      bn: 'প্রতিটি ব্যাগে, প্রতিটি ব্যাচে একই উচ্চ মান বজায় রাখাই আমাদের লক্ষ্য।',
      en: 'We aim for the same high standard in every bag, batch after batch.',
    },
  },
  {
    title: { bn: 'যত্নশীল প্রক্রিয়াজাতকরণ', en: 'Careful Processing' },
    text: {
      bn: 'প্রক্রিয়াজাতকরণের প্রতিটি ধাপ পরিচালিত হয় মনোযোগ ও যত্নে।',
      en: 'Each stage of processing is handled with attention and care.',
    },
  },
  {
    title: { bn: 'পরিচ্ছন্ন প্যাকেজিং', en: 'Clean Packaging' },
    text: {
      bn: 'মিল থেকে যেমন বের হয়, ঠিক তেমন অবস্থায় আপনার কাছে পৌঁছাতে চাল প্যাক করা হয়।',
      en: 'Rice is packed to reach you in the condition it left our mill.',
    },
  },
  {
    title: { bn: 'নির্ভরযোগ্য সরবরাহ', en: 'Dependable Supply' },
    text: {
      bn: 'দৈনিক ৪৮ টন সক্ষমতা আপনার অর্ডার নির্ভরযোগ্যভাবে পূরণে সহায়তা করে।',
      en: 'A 48-ton daily capacity helps us serve your orders reliably.',
    },
  },
];

/**
 * Gallery. Set `src` to a photo path to fill a slot. Factory, processing,
 * machinery and packaging-line slots are left for real Zinia photos.
 * `pack: true` shows the whole image (for packaging photos with transparent backgrounds).
 * `span` controls the tile size in the "All" view.
 */
export const galleryCategories = ['all', 'factory', 'processing', 'machinery', 'products', 'packaging'];

export const gallery = [
  { id: 1, category: 'factory', label: { bn: 'কারখানার বাইরের অংশ', en: 'Factory Exterior' }, icon: Factory, span: 'col-span-2 row-span-2', src: null },
  { id: 2, category: 'processing', label: { bn: 'চাল প্রক্রিয়াজাতকরণ', en: 'Rice Processing' }, icon: Cog, span: '', src: null },
  { id: 3, category: 'products', label: { bn: 'কাটারি চাল', en: 'Katari Rice' }, span: 'row-span-2', src: packs.katari, pack: true },
  { id: 4, category: 'machinery', label: { bn: 'মিলিং যন্ত্রপাতি', en: 'Milling Machinery' }, icon: Settings2, span: '', src: null },
  { id: 5, category: 'packaging', label: { bn: 'প্যাকেজিং', en: 'Packaging' }, icon: Package, span: '', src: null },
  { id: 6, category: 'products', label: { bn: 'আমাদের চালের জাত', en: 'Our Rice Varieties' }, span: 'col-span-2', src: packs.trio, pack: true },
  { id: 7, category: 'factory', label: { bn: 'কারখানার ভেতরে', en: 'Factory Floor' }, icon: Factory, span: '', src: null },
  { id: 8, category: 'products', label: { bn: 'চালের দানা', en: 'Rice Grains' }, span: '', src: images.rawRice },
  { id: 9, category: 'processing', label: { bn: 'প্রক্রিয়াজাতকরণ লাইন', en: 'Processing Line' }, icon: Wheat, span: '', src: null },
  { id: 10, category: 'packaging', label: { bn: 'প্যাক করা চাল', en: 'Packed Rice' }, span: 'col-span-2', src: packs.scene, pack: true },
];
