import { useContext } from 'react';
import { site } from '../config/site';
import { images } from '../data/images';
import { useLang } from '../i18n/LanguageContext';
import { ShopContext } from './shop';

/** "পছন্দের *চাল*\nবেছে নিন।" → rich heading parts (gold word, line breaks). */
export function parseRichText(text) {
  const parts = [];
  String(text)
    .split('\n')
    .forEach((line, i) => {
      if (i > 0) parts.push({ br: true });
      line.split(/(\*[^*]+\*)/).forEach((seg) => {
        if (!seg) return;
        parts.push(seg.startsWith('*') && seg.endsWith('*') ? { t: seg.slice(1, -1), mark: true } : { t: seg });
      });
    });
  return parts;
}

/**
 * Website content edited in Admin → Website content, with the original
 * text and images as fallbacks when a field is left empty.
 */
export function useSite() {
  const { lang, tr } = useLang();
  const c = useContext(ShopContext)?.content || {};
  const pick = (base) => c[`${base}_${lang}`] || null;
  return {
    capacity: Number(c.capacity) || site.capacity,
    contact: {
      address: pick('contact_address') || tr(site.contact.address),
      phone: c.contact_phone || tr(site.contact.phone),
      email: c.contact_email || tr(site.contact.email),
    },
    brandShort: pick('company_short'),
    brandName: pick('company_name'),
    heroTitle: pick('hero_title') ? parseRichText(pick('hero_title')) : null,
    heroSub: pick('hero_sub'),
    paymentInstructions: pick('payment_instructions'),
    heroBg: c.hero_bg_image || images.greenField,
    storyBanner: c.story_banner_image || images.villageField,
    footerBanner: c.footer_banner_image || images.heroField,
    showcaseImage: (id, fallback) => c.showcase_images?.[id] || fallback,
    galleryImage: (id, fallback) => c.gallery_images?.[String(id)] || fallback,
  };
}
