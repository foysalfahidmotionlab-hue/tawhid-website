import { motion } from 'framer-motion';
import { site } from '../config/site';
import { packs } from '../data/products';
import { useLang } from '../i18n/LanguageContext';
import { Container, CountUp, ease } from '../components/ui/primitives';
import Button from '../components/ui/Button';
import { useSite } from '../store/content';

/** "48 tons of rice, every single day" band with the product family. */
export default function CapacityBand() {
  const { t } = useLang();
  const { capacity } = useSite();

  return (
    <section
      aria-label={t('production.capLabel')}
      className="bg-band grain relative overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--band-glow)] blur-3xl" />
      <Container className="relative flex flex-col items-center justify-between gap-6 py-14 text-center lg:flex-row lg:gap-10 lg:py-6 lg:text-left">
        <div className="flex items-end gap-5">
          <span className="text-band-num font-display text-[7rem] font-light leading-[0.8] tracking-[-0.04em] lg:text-[8.5rem]">
            <CountUp to={capacity} duration={2.2} />
          </span>
          <span className="pb-2 text-left font-display text-2xl font-light leading-snug sm:text-[1.7rem]">
            {t('band.line1')}
            <br />
            {t('band.line2')}
          </span>
        </div>
        <motion.img
          src={packs.trio}
          alt=""
          loading="lazy"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease }}
          className="h-64 w-auto drop-shadow-[0_30px_35px_rgba(0,0,0,0.35)] lg:-my-6 lg:h-80"
        />
        <Button href="#contact" variant="accent" size="lg">
          {t('nav.quote')}
        </Button>
      </Container>
    </section>
  );
}
