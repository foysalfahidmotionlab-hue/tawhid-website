import { Minus, Plus } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { toAsciiDigits } from '../../shared/rules';

/** − [ n ] + bag counter. Accepts Bangla or English digits when typed. */
export default function QtyStepper({ value, onChange, max, size = 'md', label }) {
  const { t, num } = useLang();
  const big = size === 'md';
  const btn = `grid shrink-0 place-items-center rounded-full border border-forest-900/15 bg-white text-forest-900 transition hover:border-forest-700 hover:bg-forest-50 disabled:opacity-35 ${
    big ? 'h-11 w-11' : 'h-8 w-8'
  }`;
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label || t('shop.quantity')}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(0, value - 1))} disabled={value <= 0} aria-label={t('shop.decrease')}>
        <Minus className={big ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      </button>
      <input
        inputMode="numeric"
        aria-label={label || t('shop.quantity')}
        value={value === 0 ? '' : num(value)}
        placeholder={num(0)}
        onChange={(e) => {
          const n = parseInt(toAsciiDigits(e.target.value).replace(/\D/g, ''), 10);
          onChange(Number.isNaN(n) ? 0 : max != null ? Math.min(n, max) : n);
        }}
        className={`rounded-xl border border-forest-900/15 bg-white text-center font-semibold text-forest-950 outline-none focus:border-gold focus:ring-4 focus:ring-gold-light/40 ${
          big ? 'h-11 w-16 text-lg' : 'h-8 w-12 text-sm'
        }`}
      />
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={max != null && value >= max}
        aria-label={t('shop.increase')}
      >
        <Plus className={big ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      </button>
    </div>
  );
}
