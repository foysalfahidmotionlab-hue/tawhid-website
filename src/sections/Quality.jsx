import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { promises } from '../data/content';
import { packs } from '../data/products';
import { images } from '../data/images';
import { useLang } from '../i18n/LanguageContext';
import { Container, Reveal, Eyebrow, Rich, ease } from '../components/ui/primitives';

/** Rotating "Our Quality Standard" badge with a golden arrow button. */
function StandardBadge() {
  const { t } = useLang();
  return (
    <a href="#production" aria-label={t('quality.badgeAria')} className="group relative block h-40 w-40 shrink-0 sm:h-44 sm:w-44">
      <svg viewBox="0 0 120 120" className="h-full w-full animate-spin-slow" aria-hidden="true">
        <defs>
          <path id="std-circle" d="M60,60 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
        </defs>
        <text fill="#9c7a2e" fontSize="8.4" fontWeight="600" style={{ fontFamily: '"DM Sans", "Hind Siliguri", sans-serif' }}>
          <textPath href="#std-circle" textLength="308" lengthAdjust="spacing">
            {t('quality.badge')}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto grid h-20 w-20 place-items-center rounded-full bg-forest-900 text-gold-light shadow-[0_16px_30px_-12px_rgba(17,32,19,0.7)] transition-all duration-500 group-hover:scale-110 group-hover:bg-gold group-hover:text-forest-950 sm:h-24 sm:w-24">
        <ArrowUpRight className="h-8 w-8 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.5} />
      </span>
    </a>
  );
}

export default function Quality() {
  const { t, tr, num } = useLang();

  return (
    <section id="quality" className="overflow-hidden bg-cream py-24 lg:py-36">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <Eyebrow>{t('quality.eyebrow')}</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 font-display text-[2.5rem] font-light leading-[1.06] tracking-[-0.02em] text-forest-950 sm:text-6xl lg:text-[4rem]">
                <Rich parts={t('quality.title')} />
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/60">{t('quality.desc')}</p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="flex lg:col-span-4 lg:justify-end">
            <StandardBadge />
          </Reveal>
        </div>

        <div className="mt-16 grid items-center gap-16 lg:mt-20 lg:grid-cols-12">
          {/* field circle with the premium pack */}
          <div className="relative mx-auto w-full max-w-[34rem] lg:col-span-7">
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.2, ease }}
              className="relative mx-auto aspect-square w-[80%] overflow-hidden rounded-full ring-1 ring-gold/40 ring-offset-8 ring-offset-cream"
            >
              <img src={images.goldenField} alt="" loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-forest-950/5 via-forest-900/25 to-forest-950/70" />
            </motion.div>
            <motion.img
              src={packs.cloth}
              alt=""
              loading="lazy"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.1, delay: 0.25, ease }}
              className="absolute inset-x-0 -bottom-6 mx-auto h-[86%] w-auto drop-shadow-[0_40px_40px_rgba(17,32,19,0.35)]"
            />
          </div>

          {/* promises */}
          <div className="lg:col-span-5">
            <Reveal>
              <h3 className="font-display text-3xl font-light leading-tight text-forest-950 sm:text-4xl">
                <Rich parts={t('quality.careTitle')} />
              </h3>
              <p className="mt-4 leading-relaxed text-ink/60">{t('quality.careText')}</p>
            </Reveal>
            <ol className="mt-8 border-t border-forest-900/10">
              {promises.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease }}
                  className="group flex gap-6 border-b border-forest-900/10 py-5 transition-transform duration-500 hover:translate-x-1.5"
                >
                  <span className="pt-1 font-display text-lg italic text-gold-dark">{num(`0${i + 1}`)}</span>
                  <div>
                    <p className="font-display text-xl font-normal text-forest-950">{tr(p.title)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/55">{tr(p.text)}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
