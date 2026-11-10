import { motion } from 'framer-motion';
import { useLang } from '../../i18n/LanguageContext';

const options = [
  ['bn', 'বাংলা'],
  ['en', 'EN'],
];

/** বাংলা / EN switch. `id` keeps the sliding pill separate per instance. */
export default function LangToggle({ tone = 'light', id = 'lang' }) {
  const { lang, setLang, t } = useLang();
  const light = tone === 'light';
  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className={`relative flex shrink-0 rounded-full p-1 text-xs font-semibold ${
        light ? 'bg-white/10 text-cream ring-1 ring-white/20 backdrop-blur' : 'bg-forest-900/[0.06] text-forest-900 ring-1 ring-forest-900/10'
      }`}
    >
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          lang={key}
          onClick={() => setLang(key)}
          aria-pressed={lang === key}
          className="relative rounded-full px-3 py-1.5 transition-colors"
        >
          {lang === key && (
            <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-full bg-gold" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
          )}
          <span className={`relative ${lang === key ? 'text-forest-950' : ''}`}>{label}</span>
        </button>
      ))}
    </div>
  );
}
