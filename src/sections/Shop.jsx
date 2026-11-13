import { motion } from 'framer-motion';
import { ArrowRight, Banknote, Check, MapPin, PackageOpen, ReceiptText, ShoppingBag, Store, Truck, Wheat } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { useShop } from '../store/shop';
import { taka, formatKg } from '../lib/format';
import { navigate } from '../lib/router';
import { Container, Reveal, SectionHeading, ease } from '../components/ui/primitives';
import QtyStepper from '../components/shop/QtyStepper';
import { WHOLESALE_MIN_BAGS } from '../shared/rules';

export function OrderTypeToggle({ compact = false }) {
  const { t } = useLang();
  const { orderType, setOrderType } = useShop();
  const opts = [
    { key: 'retail', icon: ShoppingBag, label: t('shop.retail'), hint: t('shop.retailHint') },
    { key: 'wholesale', icon: Store, label: t('shop.wholesale'), hint: t('shop.wholesaleHint') },
  ];
  return (
    <div role="radiogroup" aria-label={t('checkout.orderType')} className={`grid grid-cols-2 gap-3 ${compact ? '' : 'sm:max-w-xl'}`}>
      {opts.map(({ key, icon: Icon, label, hint }) => {
        const on = orderType === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setOrderType(key)}
            className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
              on
                ? 'border-forest-800 bg-forest-900 text-cream shadow-[0_18px_36px_-20px_rgba(11,53,32,0.8)]'
                : 'border-forest-900/12 bg-white/70 text-forest-950 hover:border-forest-700/40 hover:bg-white'
            }`}
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${on ? 'bg-gold text-forest-950' : 'bg-forest-50 text-forest-700'}`}>
              <Icon className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <span>
              <span className="block font-semibold leading-tight">{label}</span>
              <span className={`mt-0.5 block text-xs ${on ? 'text-cream/70' : 'text-ink/50'}`}>{hint}</span>
            </span>
            {on && <Check className="absolute right-3 top-3 h-4 w-4 text-gold-light" />}
          </button>
        );
      })}
    </div>
  );
}

function ProductCard({ p, index }) {
  const { t, lang, num } = useLang();
  const { orderType, quantities, setQty } = useShop();
  const qty = quantities[String(p.id)] || 0;
  const name = lang === 'en' ? p.name_en : p.name_bn;
  const desc = lang === 'en' ? p.description_en : p.description_bn;
  const wholesale = orderType === 'wholesale';
  const price = wholesale ? p.wholesale_price : p.retail_price;
  const otherPrice = wholesale ? p.retail_price : p.wholesale_price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_80px_-50px_rgba(11,53,32,0.6)] ring-1 ring-forest-900/[0.06] sm:flex-row lg:flex-col xl:flex-row"
    >
      {/* pack on a soft stage */}
      <div className="bg-card-tint relative flex min-h-[19rem] items-end justify-center overflow-hidden px-6 pb-6 pt-14 sm:w-[44%] sm:shrink-0 lg:w-auto xl:w-[44%]">
        <span aria-hidden="true" lang="en" className="text-brand-watermark pointer-events-none absolute -left-2 top-12 select-none font-['Fraunces'] text-[5.5rem] font-semibold italic leading-none tracking-[-0.04em]">
          Zinia
        </span>
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-forest-900 ring-1 ring-forest-900/10 backdrop-blur">
          <Wheat className="h-3.5 w-3.5 text-gold-dark" />
          {formatKg(p.weight_kg, lang)}
        </span>
        <div className="absolute bottom-[12%] left-1/2 h-[58%] w-[78%] -translate-x-1/2 rounded-full bg-white/55 blur-2xl" />
        <div className="absolute bottom-5 left-1/2 h-5 w-[60%] -translate-x-1/2 rounded-[50%] bg-forest-950/20 blur-lg" />
        <img
          src={p.image}
          alt={name}
          loading="lazy"
          className="relative h-56 w-auto max-w-full object-contain drop-shadow-[0_24px_30px_rgba(11,53,32,0.3)] transition-transform duration-700 group-hover:-translate-y-1.5 group-hover:scale-[1.03] sm:h-60"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-dark">{t('shop.brandLine')}</p>
        <h3 className="mt-2 font-display text-[1.75rem] font-normal leading-tight text-forest-950">{name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/60">{desc}</p>

        {/* active price, the other one quietly underneath */}
        <div className="mt-5 rounded-2xl bg-mint-50 px-4 py-3.5 ring-1 ring-forest-900/[0.06]">
          <p className="flex items-center gap-2 text-xs font-semibold text-forest-800">
            <span className="rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-bold text-forest-950">{t('shop.yourPrice')}</span>
            {wholesale ? t('shop.wholesalePrice') : t('shop.retailPrice')}
          </p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[2rem] leading-none text-forest-950">{taka(price, lang)}</span>
            <span className="text-sm text-ink/50">/ {t('shop.bag')}</span>
          </p>
          <p className="mt-1.5 text-xs text-ink/50">
            {wholesale ? t('shop.retailPrice') : t('shop.wholesalePrice')} {taka(otherPrice, lang)}
            {!wholesale && <> · {t('shop.fromBags', { n: num(WHOLESALE_MIN_BAGS) })}</>}
          </p>
        </div>

        {!p.available ? (
          <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{t('shop.outOfStock')}</p>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <QtyStepper value={qty} onChange={(n) => setQty(p.id, n)} max={p.stock_qty ?? undefined} label={`${name} — ${t('shop.quantity')}`} />
                {p.stock_qty != null && p.stock_qty <= 50 && (
                  <p className="mt-1.5 text-xs text-gold-dark">{t('shop.onlyLeft').replace('{n}', num(p.stock_qty))}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-ink/45">{t('shop.lineTotal')}</p>
                <p className="font-display text-2xl leading-tight text-forest-950">{taka(qty * price, lang)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (qty === 0) setQty(p.id, wholesale ? WHOLESALE_MIN_BAGS : 1);
                navigate('/checkout');
              }}
              className="group/btn mt-5 inline-flex items-center justify-between gap-3 rounded-full bg-forest-800 py-2 pl-6 pr-2 font-semibold text-cream shadow-[0_16px_34px_-18px_rgba(11,53,32,0.9)] transition hover:bg-forest-700"
            >
              {t('shop.orderNow')}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-forest-950">
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </span>
            </button>
          </>
        )}
      </div>
    </motion.article>
  );
}

/** ১ → ২ → ৩: how ordering works. */
function ProcessSteps() {
  const { t, num } = useLang();
  const icons = [ShoppingBag, MapPin, ReceiptText];
  return (
    <ol className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] bg-forest-900/[0.08] ring-1 ring-forest-900/[0.06] sm:grid-cols-3">
      {t('shop.steps').map(([title, text], i) => {
        const Icon = icons[i];
        return (
          <li key={title} className="flex items-start gap-4 bg-white/75 p-5 backdrop-blur sm:p-6">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-900 text-gold-light">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[0.65rem] font-bold text-forest-950">
                {num(i + 1)}
              </span>
            </span>
            <span>
              <span className="block font-semibold text-forest-950">{title}</span>
              <span className="mt-0.5 block text-sm leading-snug text-ink/55">{text}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Small reassurance row under the products. */
function TrustRow() {
  const { t } = useLang();
  const icons = [Banknote, Truck, ReceiptText];
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-3">
      {t('shop.trust').map(([title, text], i) => {
        const Icon = icons[i];
        return (
          <li key={title} className="flex items-center gap-3 rounded-2xl border border-forest-900/[0.08] bg-white/50 px-4 py-3.5">
            <Icon className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.6} />
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-forest-950">{title}</span>
              <span className="text-xs text-ink/50">{text}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Sticky summary bar shown while the cart has items. */
export function CartBar() {
  const { t, lang, num } = useLang();
  const { totalBags, subtotal, orderType, meetsMinimum } = useShop();
  if (totalBags === 0) return null;
  const short = orderType === 'wholesale' && !meetsMinimum ? WHOLESALE_MIN_BAGS - totalBags : 0;
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease }}
      className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-forest-950/95 px-5 py-3.5 text-cream shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-forest-950">
            <PackageOpen className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm text-cream/65">
              {t(`orderType.${orderType}`)} · {num(totalBags)} {t('shop.bags')}
            </p>
            <p className="font-display text-xl">{taka(subtotal, lang)}</p>
          </div>
        </div>
        {short > 0 ? (
          <p className="text-sm text-gold-light">{t('shop.needMore').replace('{n}', num(short))}</p>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-semibold text-forest-950 transition hover:bg-gold-light"
          >
            <Truck className="h-4 w-4" />
            {t('shop.checkout')}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function Shop() {
  const { t } = useLang();
  const { catalog, orderType, totalBags, meetsMinimum } = useShop();

  return (
    <section id="order" className="bg-production relative py-24 lg:py-32">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading className="lg:col-span-7" eyebrow={t('shop.eyebrow')} title={t('shop.title')} description={t('shop.desc')} />
          <Reveal delay={0.1} className="lg:col-span-5">
            <OrderTypeToggle />
          </Reveal>
        </div>

        <ProcessSteps />

        {orderType === 'wholesale' && totalBags > 0 && !meetsMinimum && (
          <p role="alert" className="mt-8 rounded-2xl border border-gold/50 bg-gold/10 px-5 py-3 text-sm font-medium text-forest-900">
            {t('shop.wholesaleMin')}
          </p>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {catalog.status === 'loading' && <p className="text-ink/50">{t('shop.loading')}</p>}
          {catalog.status === 'error' && <p className="text-rose-700">{t('shop.loadError')}</p>}
          {catalog.status === 'ready' && catalog.products.length === 0 && <p className="text-ink/50">{t('shop.empty')}</p>}
          {catalog.products.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>

        <TrustRow />
      </Container>
    </section>
  );
}
