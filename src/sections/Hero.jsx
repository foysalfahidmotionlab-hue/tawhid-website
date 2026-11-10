import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Check } from 'lucide-react';
import { images } from '../data/images';
import { products } from '../data/products';
import { useLang } from '../i18n/LanguageContext';
import { Container, Eyebrow, Rich, ease } from '../components/ui/primitives';
import Button from '../components/ui/Button';

const AUTOPLAY_MS = 6500;
const SWING_DEG = 42; // how far packs travel along the circular path

/**
 * Product showcase hero. All packs stay mounted (so nothing has to load
 * mid-transition) and swing along a circular arc around a pivot below
 * the stage: the current pack swings out one side while the next swings
 * in from the other — no empty frame between them.
 */
export default function Hero({ activeId, autoplay, onAutoAdvance, onChoose, onInquire }) {
  const { t, tr, num } = useLang();
  const n = products.length;
  const index = Math.max(0, products.findIndex((p) => p.id === activeId));
  const product = products[index];

  useEffect(() => {
    if (!autoplay) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setTimeout(() => onAutoAdvance(products[(index + 1) % n].id), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [autoplay, index, n, onAutoAdvance]);

  // Position of each pack relative to the active one: 0 = centre, ±1 = just off-stage.
  const offsetOf = (i) => {
    let o = (i - index + n) % n;
    if (o > n / 2) o -= n;
    return o;
  };

  const specs = [
    [t('hero.quality'), t('brand.positioning')],
    [t('hero.processing'), t('hero.automatic')],
    [t('hero.packaging'), t('hero.toBeAdded')],
  ];

  return (
    <section id="home" className="bg-hero relative isolate overflow-hidden text-forest-950">
      {/* soft light + leaf-green glows */}
      <div className="absolute -left-40 top-10 -z-10 h-[34rem] w-[34rem] rounded-full bg-mint-300/40 blur-3xl" />
      <div className="absolute -right-32 bottom-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-gold-light/25 blur-3xl" />
      <div className="dot-pattern absolute inset-0 -z-10 text-forest-700 opacity-[0.06]" />

      <Container className="pb-12 pt-32 lg:pb-14 lg:pt-36">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,30rem)_1fr] lg:gap-6">
          {/* intro */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease }}>
            <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
            <h1 className="hero-title mt-6 font-display text-[3.2rem] font-light leading-[1] tracking-[-0.03em] sm:text-7xl lg:text-[4.6rem] xl:text-[5.4rem]">
              <Rich parts={t('hero.title')} />
            </h1>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink/65">{t('hero.sub')}</p>
            <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold/45 bg-white/60 px-4 py-2 text-sm font-medium text-forest-800 backdrop-blur">
              <Award className="h-4 w-4 text-gold-dark" strokeWidth={1.8} />
              {t('brand.trademarkLine')}
            </span>
          </motion.div>

          {/* pack stage — circular swing carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.45, ease }}
            className="relative mx-auto mt-6 aspect-[4/5] w-full max-w-[24rem] sm:max-w-[28rem] lg:mt-0 lg:max-w-none"
          >
            {/* emerald arch with a village paddy field inside — echoes the packaging */}
            <div className="absolute inset-x-[6%] -top-[4%] bottom-[18%] rounded-b-[2.6rem] rounded-t-full border border-gold/55 p-2">
              <div className="bg-arch relative h-full w-full overflow-hidden rounded-b-[2.1rem] rounded-t-full">
                <img src={images.villageField} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-luminosity" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 25%, var(--arch-to) 100%)' }} />
                <div className="absolute inset-x-0 top-[12%] mx-auto h-40 w-40 rounded-full bg-gold-light/30 blur-3xl" />
              </div>
            </div>
            <div className="absolute bottom-[3%] left-1/2 h-8 w-[72%] -translate-x-1/2 rounded-[50%] bg-forest-950/20 blur-xl" />

            {products.map((p, i) => {
              const o = offsetOf(i);
              const on = o === 0;
              return (
                <motion.div
                  key={p.id}
                  aria-hidden={!on}
                  className="absolute inset-x-[3%] bottom-0 top-[16%]"
                  style={{ transformOrigin: '50% 170%', zIndex: on ? 2 : 1, pointerEvents: on ? 'auto' : 'none' }}
                  initial={false}
                  animate={{ rotate: o * SWING_DEG, opacity: on ? 1 : 0, scale: on ? 1 : 0.8 }}
                  transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1], opacity: { duration: on ? 0.6 : 0.8, delay: on ? 0.05 : 0.1 } }}
                >
                  <motion.img
                    src={p.image}
                    alt={on ? tr(p.name) : ''}
                    loading="eager"
                    decoding="async"
                    animate={on ? { y: [0, -10, 0] } : { y: 0 }}
                    transition={on ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                    className="h-full w-full object-contain drop-shadow-[0_40px_45px_rgba(29,50,26,0.28)]"
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* details */}
          <div className="lg:pl-6" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
                transition={{ duration: 0.45, ease }}
              >
                <p className="font-display text-xl italic text-gold-dark">
                  {num(String(index + 1).padStart(2, '0'))} / {num(String(n).padStart(2, '0'))}
                </p>
                <h2 className="mt-2 font-display text-5xl font-light leading-tight">{tr(product.name)}</h2>
                <p className="mt-4 max-w-md leading-relaxed text-ink/60">{tr(product.description)}</p>
                <dl className="mt-7 max-w-md">
                  {specs.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 border-b border-forest-900/10 py-3.5 text-sm">
                      <dt className="text-ink/50">{k}</dt>
                      <dd className="flex items-center gap-2 font-medium text-forest-900">
                        <Check className="h-3.5 w-3.5 text-gold-dark" />
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <Button variant="primary" className="mt-8" onClick={() => onInquire(product.id)}>
                  {t('hero.requestPrice')}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* variety tabs */}
        <div
          role="tablist"
          aria-label={t('hero.chooseVariety')}
          className="no-scrollbar -mx-5 mt-12 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0"
        >
          {products.map((p, i) => {
            const on = p.id === product.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onChoose(p.id)}
                className={`relative flex min-w-[9.5rem] shrink-0 items-center gap-4 overflow-hidden rounded-[1.4rem] border px-5 py-4 text-left transition-colors duration-300 ${
                  on ? 'border-transparent' : 'border-forest-900/10 bg-white/45 hover:border-forest-900/20 hover:bg-white/75'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="variety-tab"
                    className="absolute inset-0 rounded-[1.4rem] border border-gold bg-white shadow-[0_14px_30px_-18px_rgba(29,50,26,0.45)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
                <span className={`relative h-7 w-2.5 shrink-0 rounded-full ${on ? 'bg-gold' : 'bg-forest-300/70'}`} />
                <span className="relative">
                  <span className="block font-display text-xl font-light">{tr(p.short)}</span>
                  <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-forest-900/45">
                    {num(`0${i + 1}`)}
                    {on && ` · ${t('hero.selected')}`}
                  </span>
                </span>
                {on && autoplay && (
                  <motion.span
                    key={`progress-${p.id}`}
                    className="absolute bottom-0 left-0 h-0.5 bg-gold"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
