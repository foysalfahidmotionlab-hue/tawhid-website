import { motion } from 'framer-motion';
import { highlights } from '../data/content';
import { images } from '../data/images';
import { site } from '../config/site';
import { Container, Reveal, Eyebrow, Mark, CountUp, ease } from '../components/ui/primitives';
import Button from '../components/ui/Button';

export default function Intro() {
  return (
    <section id="about" className="relative overflow-hidden bg-cream py-24 lg:py-36">
      <Container className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
        {/* image composition */}
        <div className="relative mx-auto h-[30rem] w-full max-w-[32rem] sm:h-[36rem] lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease }}
            className="absolute left-0 top-0 h-[90%] w-[78%] overflow-hidden rounded-b-[2rem] rounded-t-full shadow-[0_40px_80px_-40px_rgba(17,32,19,0.6)]"
          >
            <img src={images.goldenField} alt="Ripening paddy in soft sunlight" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.1, delay: 0.25, ease }}
            className="absolute bottom-0 right-0 h-[42%] w-[50%] overflow-hidden rounded-[1.75rem] border-[6px] border-cream shadow-[0_30px_60px_-30px_rgba(17,32,19,0.6)]"
          >
            <img src={images.riceHands} alt="Hands sorting rice grains" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4, ease }}
            className="absolute right-[2%] top-[12%] rounded-2xl bg-forest-900 px-6 py-5 text-cream shadow-[0_30px_50px_-25px_rgba(17,32,19,0.7)]"
          >
            <p className="font-display text-5xl font-light leading-none">
              <CountUp to={site.capacity.value} />
              <span className="ml-1 font-sans text-sm font-medium text-gold-light">{site.capacity.unit}</span>
            </p>
            <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-cream/55">Every single day</p>
          </motion.div>
        </div>

        {/* copy */}
        <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow>About Zinia</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 font-display text-[2.6rem] font-light leading-[1.04] tracking-[-0.02em] text-forest-950 sm:text-6xl lg:text-[4.2rem]">
              Quality You Can <Mark>Trust</Mark>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
              {site.name} is a quality-focused automatic rice processing company. We bring together modern processing and
              careful handling to deliver rice of the best quality — consistently, batch after batch.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease }}
                  className="group flex gap-5 border-t border-forest-900/10 py-6"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-dark transition-colors duration-500 group-hover:bg-forest-900 group-hover:text-gold-light">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-normal text-forest-950">{h.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/55">{h.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
            <Button href="#story" variant="primary">Our Story</Button>
            <Button href="#products" variant="outline" icon={false}>View Products</Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
