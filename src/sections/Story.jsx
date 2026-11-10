import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Factory, Target } from 'lucide-react';
import { site } from '../config/site';
import { images } from '../data/images';
import { useLang } from '../i18n/LanguageContext';
import { Container, Reveal, Eyebrow, Rich, ease } from '../components/ui/primitives';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

// Replace with a real factory photo path when available.
const factoryPhoto = null;

export default function Story() {
  const { t, num } = useLang();
  const band = useRef(null);
  const { scrollYProgress } = useScroll({ target: band, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const cap = num(site.capacity);

  return (
    <section id="story" className="relative bg-cream">
      {/* cinematic band */}
      <div ref={band} className="grain relative isolate flex min-h-[72svh] items-end overflow-hidden text-cream">
        <motion.img
          src={images.villageField}
          alt={t('story.fieldAlt')}
          loading="lazy"
          style={{ y }}
          className="absolute inset-0 -z-20 h-[124%] w-full -translate-y-[12%] object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-950/25 to-forest-950/40" />
        <Container className="pb-16 pt-40 lg:pb-24">
          <Reveal>
            <Eyebrow tone="dark">{t('story.eyebrow')}</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6 max-w-4xl font-display text-[2.5rem] font-light leading-[1.05] tracking-[-0.025em] sm:text-6xl lg:text-[4.6rem]">
              <Rich parts={t('story.title')} tone="dark" />
            </h2>
          </Reveal>
        </Container>
      </div>

      {/* story body */}
      <Container className="grid items-center gap-16 py-24 lg:grid-cols-12 lg:gap-20 lg:py-32">
        <div className="relative lg:col-span-6">
          <Reveal>
            <ImagePlaceholder
              src={factoryPhoto}
              label={t('story.factory')}
              icon={Factory}
              tone="dark"
              className="aspect-[5/4] w-full shadow-[0_40px_80px_-40px_rgba(17,32,19,0.6)]"
              rounded="rounded-[2rem]"
            />
          </Reveal>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.25, ease }}
            className="absolute -bottom-10 -right-2 hidden h-44 w-44 overflow-hidden rounded-[1.5rem] border-[6px] border-cream shadow-2xl sm:block lg:-right-10"
          >
            <img src={images.paddyBasket} alt="" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>
        </div>

        <div className="lg:col-span-6">
          <Reveal>
            <p className="font-display text-2xl font-light leading-snug text-forest-950 sm:text-[1.9rem]">
              <Rich parts={t('story.lead')} />
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 leading-relaxed text-ink/60">{t('story.body', { cap })}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-10 flex gap-5 rounded-[1.5rem] bg-sand/70 p-6 ring-1 ring-forest-900/[0.06] sm:p-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-900 text-gold-light">
                <Target className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <h3 className="font-display text-xl font-normal text-forest-950">{t('story.focusTitle')}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{t('story.focusText', { cap })}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
