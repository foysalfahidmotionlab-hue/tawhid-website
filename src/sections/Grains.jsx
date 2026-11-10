import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { products } from '../data/products';
import { useLang } from '../i18n/LanguageContext';
import { Container, Reveal, SectionHeading, ease } from '../components/ui/primitives';

/** "See the difference up close" — tap a variety to show it in the showcase. */
export default function Grains({ activeId, onChoose }) {
  const { t, tr } = useLang();

  const pick = (id) => {
    onChoose(id);
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="products" className="bg-tint py-24 lg:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={t('grains.eyebrow')} title={t('grains.title')} />
          <Reveal delay={0.12}>
            <p className="text-sm text-ink/50">{t('grains.hint')}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p, i) => {
            const on = p.id === activeId;
            return (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => pick(p.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: i * 0.08, ease }}
                className="group flex flex-col items-center text-center"
              >
                <span
                  className={`block aspect-square w-full max-w-[13rem] overflow-hidden rounded-full border-[6px] shadow-[0_30px_50px_-30px_rgba(17,32,19,0.65)] transition-[border-color,transform] duration-500 group-hover:-translate-y-1.5 ${
                    on ? 'border-gold' : 'border-cream'
                  }`}
                >
                  <img
                    src={p.grainPhoto}
                    alt={tr(p.name)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                </span>
                <span className="mt-5 font-display text-2xl font-light text-forest-950">{tr(p.short)}</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-gold-dark opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {tr(p.name)} <ArrowUp className="h-3 w-3" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
