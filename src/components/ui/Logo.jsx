import { Wheat } from 'lucide-react';
import { site } from '../../config/site';
import { useLang } from '../../i18n/LanguageContext';
import { useSite } from '../../store/content';

/** Emblem logo placeholder — set `site.logo` to an image path to use the real logo. */
export default function Logo({ tone = 'dark', className = '' }) {
  const { t } = useLang();
  const { brandShort } = useSite();
  const light = tone === 'light';
  return (
    <a href="/" className={`flex shrink-0 items-center gap-3 ${className}`} aria-label={t('brand.name')}>
      {site.logo ? (
        <img src={site.logo} alt={t('brand.name')} className="h-12 w-auto" />
      ) : (
        <>
          <span
            className={`relative grid h-12 w-12 place-items-center rounded-full border transition-colors duration-500 ${
              light ? 'border-gold-light/70 text-gold-light' : 'border-gold-dark/60 text-gold-dark'
            }`}
          >
            <span className="absolute inset-[3px] rounded-full border border-current opacity-30" />
            <Wheat className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="leading-none">
            <span className={`block font-display text-[1.5rem] font-normal tracking-tight transition-colors duration-500 ${light ? 'text-cream' : 'text-forest-950'}`}>
              {brandShort || t('brand.short')}
            </span>
            <span
              className={`mt-1 block text-[0.55rem] font-semibold uppercase tracking-[0.32em] transition-colors duration-500 ${
                light ? 'text-cream/60' : 'text-forest-700/70'
              }`}
            >
              {t('brand.descriptor')}
            </span>
          </span>
        </>
      )}
    </a>
  );
}
