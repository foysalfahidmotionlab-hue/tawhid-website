import { Image as ImageIcon } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

const tones = {
  light: 'bg-gradient-to-br from-sand via-cream to-white text-forest-800 ring-1 ring-forest-900/5',
  mid: 'bg-gradient-to-br from-forest-100 via-forest-50 to-cream text-forest-800 ring-1 ring-forest-900/5',
  dark: 'bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 text-cream',
  night: 'bg-gradient-to-br from-white/[0.07] to-white/[0.02] text-cream ring-1 ring-white/10',
};

/**
 * Photo slot. Shows `src` when provided, otherwise a styled placeholder
 * with the slot's label so it is clear which photo belongs where.
 */
export default function ImagePlaceholder({
  src,
  alt,
  label = 'Photo',
  icon: Icon = ImageIcon,
  tone = 'light',
  className = '',
  rounded = 'rounded-[2rem]',
}) {
  const { t } = useLang();

  if (src) {
    return <img src={src} alt={alt || label} loading="lazy" className={`h-full w-full object-cover ${rounded} ${className}`} />;
  }

  const isDark = tone === 'dark' || tone === 'night';

  return (
    <div role="img" aria-label={label} className={`relative isolate overflow-hidden ${rounded} ${tones[tone]} ${className}`}>
      <div className={`dot-pattern absolute inset-0 -z-10 ${isDark ? 'opacity-[0.07]' : 'opacity-[0.1]'}`} />
      <div className={`absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full blur-3xl ${isDark ? 'bg-gold/15' : 'bg-gold-light/30'}`} />
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border sm:h-14 sm:w-14 ${
            isDark ? 'border-gold-light/40 text-gold-light' : 'border-gold/50 bg-white/60 text-gold-dark'
          }`}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.4} />
        </span>
        <span className="font-display text-xl font-light sm:text-2xl">{label}</span>
        <span className={`text-[0.6rem] font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-cream/45' : 'text-forest-800/45'}`}>
          {t('placeholder')}
        </span>
      </div>
    </div>
  );
}
