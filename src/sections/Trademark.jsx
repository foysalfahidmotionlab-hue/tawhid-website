import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { Container, Eyebrow, Reveal, Rich, ease } from '../components/ui/primitives';
import { BRAND } from '../components/ui/Logo';

/** The Zinnia trademark seal, presented as the mark behind our rice. */
export default function Trademark() {
  const { t } = useLang();
  return (
    <section id="trademark" className="bg-cream py-20 lg:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-mint-50 to-mint-100 p-8 shadow-[0_40px_90px_-60px_rgba(11,53,32,0.6)] ring-1 ring-gold/25 sm:p-12 lg:p-16">
          {/* soft zinnia-pink and gold light */}
          <div className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#e8467c]/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold-light/25 blur-3xl" />

          <div className="relative grid items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -12 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.1, ease }}
              className="relative mx-auto w-full max-w-[19rem] lg:col-span-5 lg:max-w-[22rem]"
            >
              <div className="absolute -inset-5 animate-spin-slow rounded-full border border-dashed border-gold/50">
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_0_4px_rgba(227,197,127,0.35)]" />
              </div>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark opacity-70" />
              <img
                src={BRAND.seal}
                alt={t('hero.sealAlt')}
                loading="lazy"
                className="relative w-full rounded-full bg-white p-1.5 shadow-[0_30px_60px_-30px_rgba(11,53,32,0.7)]"
              />
            </motion.div>

            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow>{t('trademark.eyebrow')}</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <h2 className="mt-5 font-display text-[2.4rem] font-light leading-[1.1] tracking-[-0.02em] text-forest-950 sm:text-5xl lg:text-[3.4rem]">
                  <Rich parts={t('trademark.title')} />
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/65">{t('trademark.text')}</p>
              </Reveal>
              <Reveal delay={0.18}>
                <ul className="mt-7 flex flex-wrap gap-2.5">
                  {t('trademark.points').map((p) => (
                    <li key={p} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-forest-900 ring-1 ring-forest-900/10">
                      <Check className="h-4 w-4 text-gold-dark" strokeWidth={2.4} />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 text-sm text-ink/50">{t('trademark.owner')}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
