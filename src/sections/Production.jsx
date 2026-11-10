import { motion } from 'framer-motion';
import { Factory, Cog, Settings2 } from 'lucide-react';
import { site } from '../config/site';
import { workflow } from '../data/content';
import { useLang } from '../i18n/LanguageContext';
import { Container, Rich, SectionHeading, Reveal, CountUp, ease } from '../components/ui/primitives';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

// Replace with real photo paths of the Zinia facility when available.
const productionImages = { factory: null, machinery: null, line: null };

export default function Production() {
  const { t, tr, num } = useLang();

  return (
    <section id="production" className="bg-production relative isolate overflow-hidden py-24 text-forest-950 lg:py-36">
      <div className="absolute -right-40 top-20 -z-10 h-[30rem] w-[30rem] rounded-full bg-white/60 blur-3xl" />

      <Container>
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <SectionHeading
            className="lg:col-span-7"
            eyebrow={t('production.eyebrow')}
            title={t('production.title')}
            description={t('production.desc')}
          />

          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2rem] border border-gold/35 bg-white/65 p-8 shadow-[0_30px_60px_-40px_rgba(29,50,26,0.45)] backdrop-blur-sm">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold-dark">{t('production.capLabel')}</p>
              <div className="mt-3 flex items-end gap-4">
                <span className="text-gradient-gold-deep font-display text-[8rem] font-light leading-[0.8] tracking-[-0.04em] sm:text-[10rem]">
                  <CountUp to={site.capacity} duration={2.4} />
                </span>
                <span className="pb-3 font-display text-3xl font-light leading-none">
                  {t('units.tons')}
                  <span className="mt-2 block font-sans text-xs font-semibold uppercase tracking-[0.22em] text-forest-900/50">
                    {t('units.perDay')}
                  </span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* facility photo slots */}
        <div className="mt-16 grid gap-5 md:grid-cols-12 md:grid-rows-2">
          <Reveal className="md:col-span-7 md:row-span-2">
            <ImagePlaceholder src={productionImages.factory} label={t('production.factory')} icon={Factory} tone="mid" className="h-full min-h-[18rem] md:min-h-[30rem]" />
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-5">
            <ImagePlaceholder src={productionImages.machinery} label={t('production.machinery')} icon={Settings2} tone="light" className="h-full min-h-[14rem]" />
          </Reveal>
          <Reveal delay={0.16} className="md:col-span-5">
            <ImagePlaceholder src={productionImages.line} label={t('production.line')} icon={Cog} tone="light" className="h-full min-h-[14rem]" />
          </Reveal>
        </div>

        {/* workflow */}
        <div className="mt-24">
          <Reveal className="flex items-end justify-between gap-6">
            <h3 className="font-display text-3xl font-light sm:text-4xl">
              <Rich parts={t('production.workflowTitle')} />
            </h3>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-forest-900/40 sm:block">{t('production.workflowLabel')}</span>
          </Reveal>

          <div className="relative mt-12">
            <motion.div
              aria-hidden="true"
              className="absolute left-7 right-7 top-7 hidden h-px origin-left bg-gradient-to-r from-gold/70 via-gold/30 to-gold/70 lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.6, ease }}
            />
            <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {workflow.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease }}
                    className="group relative"
                  >
                    <span className="relative grid h-14 w-14 place-items-center rounded-full border border-gold/50 bg-white text-gold-dark shadow-sm transition-colors duration-500 group-hover:bg-gold group-hover:text-forest-950">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-forest-900/40">
                      {t('production.step')} {num(`0${i + 1}`)}
                    </p>
                    <h4 className="mt-2 font-display text-2xl font-light">{tr(step.title)}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink/55">{tr(step.text)}</p>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
