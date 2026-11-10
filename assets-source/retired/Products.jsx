import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X, Check } from 'lucide-react';
import { products } from '../data/products';
import { images } from '../data/images';
import { site } from '../config/site';
import { Container, Mark, SectionHeading, Reveal, ease } from '../components/ui/primitives';
import RiceBag from '../components/ui/RiceBag';
import Button from '../components/ui/Button';

function ProductCard({ product, index, onView }) {
  const [dark] = product.colors;
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.1, ease }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-cream shadow-[0_30px_60px_-40px_rgba(17,32,19,0.55)] ring-1 ring-forest-900/[0.06] transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-[0_50px_80px_-40px_rgba(17,32,19,0.6)]"
    >
      {/* photo stage with pack */}
      <div className="relative aspect-[4/3.5] overflow-hidden">
        <img
          src={product.photo}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${dark}26 0%, ${dark}b3 70%, ${dark}e6 100%)` }} />
        <span className="absolute left-6 top-5 font-display text-2xl font-light italic text-cream/80">0{index + 1}</span>
        <span className="absolute right-5 top-5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-cream backdrop-blur-md">
          {site.positioning}
        </span>
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <RiceBag
            title={product.bagTitle}
            colors={product.colors}
            image={product.image}
            className="h-auto w-[44%] translate-y-[14%] -rotate-3 drop-shadow-[0_30px_30px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:translate-y-[4%] group-hover:rotate-0"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold-dark">Premium Rice</p>
        <h3 className="mt-2 font-display text-[2rem] font-light leading-tight text-forest-950">{product.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-7">
          <button
            type="button"
            onClick={() => onView(product)}
            className="inline-flex items-center gap-3 rounded-full border border-forest-900/15 py-1.5 pl-5 pr-1.5 text-sm font-semibold text-forest-900 transition-all duration-300 hover:border-forest-900 hover:bg-forest-900 hover:text-cream"
          >
            View Details
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-900 text-cream">
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function QuoteCard() {
  return (
    <Reveal delay={0.16} className="h-full">
      <div className="grain relative isolate flex h-full min-h-[26rem] flex-col justify-between overflow-hidden rounded-[2rem] p-8 text-cream">
        <img src={images.riceSack} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950 via-forest-950/80 to-forest-950/40" />
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold-light">Bulk & Wholesale</p>
        <div>
          <h3 className="font-display text-4xl font-light leading-[1.05]">
            Need rice in <em className="italic text-gold-light">volume</em>?
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-cream/70">
            With a daily capacity of {site.capacity.value} {site.capacity.unit.toLowerCase()}, we are ready to discuss your
            supply requirements.
          </p>
          <Button href="#contact" variant="accent" className="mt-8">Get Quotation</Button>
        </div>
      </div>
    </Reveal>
  );
}

function ProductModal({ product, onClose, onInquire }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const details = [
    ['Variety', product.name],
    ['Processing', 'Automatic rice processing'],
    ['Quality', site.positioning],
    ['Packaging', 'Details to be added'],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-forest-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-cream sm:rounded-[2rem] md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-forest-900 shadow ring-1 ring-forest-900/10 transition hover:bg-forest-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div
          className="flex items-end justify-center px-10 pt-12"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${product.colors[1]}45 0%, transparent 65%), linear-gradient(160deg, #f8f4ea, #efe6d2)`,
          }}
        >
          <RiceBag title={product.bagTitle} colors={product.colors} image={product.image} className="w-[62%] max-w-[260px] md:w-[70%]" />
        </div>
        <div className="flex flex-col p-8 sm:p-10">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold-dark">{site.name}</p>
          <h3 id="product-modal-title" className="mt-3 font-display text-5xl font-light leading-none text-forest-950">
            {product.name}
          </h3>
          <p className="mt-5 leading-relaxed text-ink/60">{product.description}</p>
          <dl className="mt-8 divide-y divide-forest-900/[0.07] border-y border-forest-900/[0.07]">
            {details.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-ink/50">{k}</dt>
                <dd className="flex items-center gap-2 font-semibold text-forest-950">
                  <Check className="h-3.5 w-3.5 text-gold-dark" />
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => onInquire(product.name)}>Request Quotation</Button>
            <Button variant="outline" icon={false} onClick={onClose}>Close</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Products({ onInquire }) {
  const [selected, setSelected] = useState(null);

  return (
    <section id="products" className="relative bg-sand py-24 lg:py-36">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Our Products"
            title={
              <>
                Five varieties. <Mark>One</Mark> standard of quality.
              </>
            }
          />
          <Reveal delay={0.12} className="max-w-sm">
            <p className="leading-relaxed text-ink/60">
              Each variety is processed in our automatic rice mill with the same care — so you receive the best
              quality rice, whichever you choose.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onView={setSelected} />
          ))}
          <QuoteCard />
        </div>
      </Container>

      <AnimatePresence>
        {selected && (
          <ProductModal
            product={selected}
            onClose={() => setSelected(null)}
            onInquire={(name) => {
              setSelected(null);
              onInquire(name);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
