import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Wheat } from 'lucide-react';
import { products } from '../data/products';
import { useLang } from '../i18n/LanguageContext';
import { Container, Rich, ease } from '../components/ui/primitives';
import Button from '../components/ui/Button';
import { useSite } from '../store/content';

const AUTOPLAY_MS = 6500;
const SWING_DEG = 42; // how far packs travel along the circular path

/** The Zinia™ brand lockup: emblem + wordmark + "a brand of Tawhid Auto Rice Mill". */
function BrandLockup() {
  const { t, lang } = useLang();
  return (
    <div className="flex items-center gap-4">
      <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-forest-800 text-gold-light shadow-[0_14px_30px_-14px_rgba(11,53,32,0.8)] ring-1 ring-gold/60 ring-offset-[3px] ring-offset-transparent">
        <span className="absolute inset-[4px] rounded-full border border-gold-light/40" />
        <Wheat className="h-7 w-7" strokeWidth={1.4} />
      </span>
      <div>
        <p className="flex items-baseline gap-2 leading-none">
          <span className="font-['Fraunces'] text-[2.6rem] font-medium italic tracking-[-0.02em] text-forest-900" lang="en">
            Zinia
          </span>
          <span className="-translate-y-4 text-sm font-semibold text-gold-dark" lang="en">™</span>
          {lang === 'bn' && <span className="font-display text-2xl text-forest-700/80">{t('hero.brandBn')}</span>}
        </p>
        <p className="mt-1.5 text-[0.78rem] font-medium tracking-wide text-forest-800/70">{t('hero.brandOf')}</p>
      </div>
    </div>
  );
}

/**
 * Brand-first hero: the Zinia™ lockup and headline on the left; on the right
 * the pack stands on a soft disc in front of a large "Zinia" wordmark. All packs
 * stay mounted and swing along a circular arc, so no frame is ever empty.
 */
export default function Hero({ activeId, autoplay, onAutoAdvance, onChoose, onInquire }) {
  const { t, tr, num } = useLang();
  const content = useSite();
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

  const facts = [t('hero.fact25'), t('hero.factTypes'), `${num(content.capacity)} ${t('hero.factDaily')}`];

  return (
    <section id="home" className="bg-hero relative isolate overflow-hidden text-forest-950">
      {/* soft paddy field rising from the bottom of the hero */}
      <img
        src={content.heroBg}
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[40%] w-full object-cover object-bottom opacity-[0.35] mix-blend-multiply [mask-image:linear-gradient(to_top,#000_10%,transparent_100%)]"
      />
      <div className="absolute -left-40 top-10 -z-10 h-[34rem] w-[34rem] rounded-full bg-mint-300/40 blur-3xl" />
      <div className="absolute -right-32 top-1/3 -z-10 h-[30rem] w-[30rem] rounded-full bg-gold-light/25 blur-3xl" />

      <Container className="pb-10 pt-28 lg:pb-12 lg:pt-32">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* brand + headline */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease }}
          >
            <BrandLockup />
            <div className="mt-7 h-px w-24 bg-gradient-to-r from-gold to-transparent" />
            <h1 className="hero-title mt-7 font-display text-[3.2rem] font-light leading-[1] tracking-[-0.03em] sm:text-7xl lg:text-[4.4rem] xl:text-[5rem]">
              <Rich parts={content.heroTitle || t('hero.title')} />
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/65">{content.heroSub || t('hero.sub')}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/#order" variant="accent" size="lg">
                {t('shop.orderNow')}
              </Button>
              <Button href="#products" variant="outline" size="lg" icon={false}>
                {t('hero.explore')}
              </Button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-forest-800/80">
              {facts.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* pack stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.45, ease }}
            className="relative mx-auto mt-4 aspect-square w-full max-w-[26rem] [container-type:inline-size] sm:max-w-[34rem] lg:col-span-7 lg:mt-0 lg:max-w-[44rem]"
          >
            {/* the brand, written large behind the pack */}
            <span
              aria-hidden="true"
              lang="en"
              className="text-brand-watermark pointer-events-none absolute inset-x-0 top-[-3%] select-none whitespace-nowrap pr-[4%] text-center font-['Fraunces'] text-[32cqw] font-semibold italic leading-none tracking-[-0.04em]"
            >
              Zinia
            </span>

            {/* disc + slowly turning gold orbit */}
            <div className="absolute inset-[13%] top-[17%] rounded-full bg-stage-disc shadow-[inset_0_-30px_60px_-30px_rgba(31,100,64,0.25),0_40px_80px_-40px_rgba(11,53,32,0.45)] ring-1 ring-gold/35" />
            <div className="absolute inset-[8%] top-[12%] animate-spin-slow rounded-full border border-dashed border-gold/45">
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_0_4px_rgba(227,197,127,0.35)]" />
            </div>
            <div className="absolute bottom-[6%] left-1/2 h-7 w-[52%] -translate-x-1/2 rounded-[50%] bg-forest-950/25 blur-xl" />

            {products.map((p, i) => {
              const o = offsetOf(i);
              const on = o === 0;
              return (
                <motion.div
                  key={p.id}
                  aria-hidden={!on}
                  className="absolute inset-x-[14%] bottom-[5%] top-[14%]"
                  style={{ transformOrigin: '50% 170%', zIndex: on ? 2 : 1, pointerEvents: on ? 'auto' : 'none' }}
                  initial={false}
                  animate={{ rotate: o * SWING_DEG, opacity: on ? 1 : 0, scale: on ? 1 : 0.8 }}
                  transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1], opacity: { duration: on ? 0.6 : 0.8, delay: on ? 0.05 : 0.1 } }}
                >
                  <motion.img
                    src={content.showcaseImage(p.id, p.image)}
                    alt={on ? tr(p.name) : ''}
                    loading="eager"
                    decoding="async"
                    animate={on ? { y: [0, -10, 0] } : { y: 0 }}
                    transition={on ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                    className="h-full w-full object-contain drop-shadow-[0_34px_40px_rgba(29,50,26,0.3)]"
                  />
                </motion.div>
              );
            })}

            {/* current variety */}
            <div className="absolute -bottom-[3%] right-0 z-10 hidden w-60 sm:block lg:-right-4 xl:w-64" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.45, ease }}
                  className="rounded-2xl bg-white/80 p-5 shadow-[0_24px_50px_-28px_rgba(11,53,32,0.55)] ring-1 ring-forest-900/[0.07] backdrop-blur-md"
                >
                  <p className="flex items-center justify-between text-xs font-semibold text-gold-dark">
                    <span lang="en">Zinia™</span>
                    <span>{num(String(index + 1).padStart(2, '0'))} / {num(String(n).padStart(2, '0'))}</span>
                  </p>
                  <h2 className="mt-1.5 font-display text-[1.7rem] font-normal leading-tight text-forest-950">{tr(product.name)}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/60">{tr(product.description)}</p>
                  <button
                    type="button"
                    onClick={() => onInquire(product.id)}
                    className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 hover:text-forest-950"
                  >
                    {t('hero.viewPrice')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* variety tabs */}
        <div
          role="tablist"
          aria-label={t('hero.chooseVariety')}
          className="no-scrollbar -mx-5 mt-8 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0"
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
