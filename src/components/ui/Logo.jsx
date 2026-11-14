import { useLang } from '../../i18n/LanguageContext';
import { useSite } from '../../store/content';

export const BRAND = {
  logo: '/images/brand/tawhid-logo.webp', // full Tawhid Auto Rice Mill logo
  emblem: '/images/brand/tawhid-emblem.webp', // the emblem alone (rice ears + T leaf)
  seal: '/images/brand/zinnia-seal.webp', // Zinnia trademark seal
};

/**
 * Tawhid Auto Rice Mill logo.
 * - default: the emblem with the name beside it (header, menus)
 * - `full`: the complete logo artwork (footer)
 */
export default function Logo({ tone = 'dark', full = false, className = '' }) {
  const { t, lang } = useLang();
  const { brandShort } = useSite();
  const light = tone === 'light';

  if (full) {
    return (
      <a href="/" className={`inline-block shrink-0 ${className}`} aria-label={t('brand.name')}>
        <img src={BRAND.logo} alt={t('brand.name')} className="h-24 w-auto" />
      </a>
    );
  }

  return (
    <a href="/" className={`flex shrink-0 items-center gap-2.5 ${className}`} aria-label={t('brand.name')}>
      <img src={BRAND.emblem} alt="" className="h-11 w-auto sm:h-12" />
      <span className="leading-none">
        <span
          className={`block text-[1.45rem] font-normal tracking-tight transition-colors duration-500 ${
            light ? 'text-cream' : 'text-[#0f4a2a]'
          } ${lang === 'en' ? 'font-["Fraunces"] font-semibold uppercase tracking-[0.04em]' : 'font-display'}`}
        >
          {brandShort || t('brand.short')}
        </span>
        <span
          className={`mt-1 block text-[0.55rem] font-semibold uppercase tracking-[0.32em] transition-colors duration-500 ${
            light ? 'text-cream/60' : 'text-[#0f4a2a]/75'
          }`}
        >
          {t('brand.descriptor')}
        </span>
      </span>
    </a>
  );
}
