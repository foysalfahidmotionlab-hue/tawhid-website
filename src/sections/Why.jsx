import { motion } from 'framer-motion';
import { site } from '../config/site';
import { highlights } from '../data/content';
import { useLang } from '../i18n/LanguageContext';
import { Container, Reveal, SectionHeading, ease } from '../components/ui/primitives';

/** "Quality You Can Trust" — four reasons to choose Zinia. */
export default function Why() {
  const { t, tr, num } = useLang();

  return (
    <section id="about" className="bg-cream py-24 lg:py-32">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading className="lg:col-span-7" eyebrow={t('why.eyebrow')} title={t('why.title')} />
          <Reveal delay={0.12} className="lg:col-span-5">
            <p className="leading-relaxed text-ink/60 sm:text-lg">{t('why.desc')}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: i * 0.08, ease }}
                className="group border-t border-forest-900/10 pt-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/60 text-gold-dark transition-colors duration-500 group-hover:bg-forest-900 group-hover:text-gold-light">
                  {i === 0 ? (
                    <span className="font-display text-base">{num(site.capacity)}</span>
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </span>
                <h3 className="mt-6 font-display text-2xl font-normal text-forest-950">{tr(h.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/55">{tr(h.text)}</p>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
