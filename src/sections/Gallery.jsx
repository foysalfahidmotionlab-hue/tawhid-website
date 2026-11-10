import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gallery, galleryCategories } from '../data/content';
import { useLang } from '../i18n/LanguageContext';
import { Container, SectionHeading, Reveal, ease } from '../components/ui/primitives';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

const tones = ['light', 'mid', 'dark'];

function Tile({ item, index }) {
  const { t, tr } = useLang();
  const label = tr(item.label);

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-[1.75rem]">
      <div className="h-full w-full transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]">
        {item.pack ? (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_55%,#fff,#efe6d2_72%)] p-3">
            <img src={item.src} alt={label} loading="lazy" className="h-full w-auto max-w-full object-contain" />
          </div>
        ) : (
          <ImagePlaceholder src={item.src} label={label} icon={item.icon} tone={tones[index % 3]} className="h-full w-full" rounded="rounded-none" />
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between bg-gradient-to-t from-forest-950/85 to-transparent p-5 pt-16 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="font-display text-xl font-light text-cream">{label}</span>
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-cream backdrop-blur">
          {t(`gallery.categories.${item.category}`)}
        </span>
      </div>
    </div>
  );
}

export default function Gallery() {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');
  const items = filter === 'all' ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <section id="gallery" className="bg-cream py-24 lg:py-36">
      <Container>
        <SectionHeading align="center" eyebrow={t('gallery.eyebrow')} title={t('gallery.title')} description={t('gallery.desc')} />

        <Reveal delay={0.15} className="mt-10 flex justify-center">
          <div className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto rounded-full bg-sand p-1.5 ring-1 ring-forest-900/5">
            {galleryCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
                  filter === c ? 'text-cream' : 'text-ink/60 hover:text-forest-900'
                }`}
              >
                {filter === c && (
                  <motion.span layoutId="gallery-pill" className="absolute inset-0 rounded-full bg-forest-900" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{t(`gallery.categories.${c}`)}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <motion.ul layout className="mt-12 grid auto-rows-[170px] grid-flow-dense grid-cols-2 gap-4 sm:auto-rows-[220px] lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease }}
                className={filter === 'all' ? item.span : 'row-span-2'}
              >
                <Tile item={item} index={i} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </Container>
    </section>
  );
}
