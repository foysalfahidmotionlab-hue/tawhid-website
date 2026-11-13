import { motion } from 'framer-motion';
import { Check, PackageOpen, ShoppingBag, Store, Truck } from 'lucide-react';
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
  const price = orderType === 'wholesale' ? p.wholesale_price : p.retail_price;

  const priceRow = (type, value) => {
    const on = orderType === type;
    return (
      <div
        className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-colors ${
          on ? 'border-gold bg-gold/10' : 'border-forest-900/10 bg-white/50'
        }`}
      >
        <span className={`text-sm ${on ? 'font-semibold text-forest-950' : 'text-ink/55'}`}>
          {type === 'wholesale' ? t('shop.wholesalePrice') : t('shop.retailPrice')}
          {on && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-bold text-forest-950">{t('shop.yourPrice')}</span>}
        </span>
        <span className={`font-semibold ${on ? 'text-lg text-forest-950' : 'text-ink/50'}`}>
          {taka(value, lang)}
          <span className="ml-1 text-xs font-normal text-ink/45">/ {t('shop.bag')}</span>
        </span>
      </div>
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease }}
      className="grid overflow-hidden rounded-[2rem] bg-white/80 shadow-[0_30px_60px_-40px_rgba(11,53,32,0.55)] ring-1 ring-forest-900/[0.07] backdrop-blur sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="bg-card-tint relative flex min-h-[17rem] items-center justify-center p-5">
        <span className="absolute left-4 top-4 rounded-full bg-forest-900 px-3 py-1 text-xs font-semibold text-cream">
          {formatKg(p.weight_kg, lang)}
        </span>
        <img src={p.image} alt={name} loading="lazy" className="h-60 w-auto max-w-full object-contain drop-shadow-[0_24px_30px_rgba(11,53,32,0.3)]" />
      </div>

      <div className="flex flex-col p-6 sm:p-7">
        <h3 className="font-display text-[1.85rem] font-normal leading-tight text-forest-950">{name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{desc}</p>

        <div className="mt-5 space-y-2">
          {priceRow('wholesale', p.wholesale_price)}
          {priceRow('retail', p.retail_price)}
        </div>

        {!p.available ? (
          <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{t('shop.outOfStock')}</p>
        ) : (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <QtyStepper value={qty} onChange={(n) => setQty(p.id, n)} max={p.stock_qty ?? undefined} label={`${name} — ${t('shop.quantity')}`} />
              {p.stock_qty != null && p.stock_qty <= 50 && (
                <p className="mt-1.5 text-xs text-gold-dark">{t('shop.onlyLeft').replace('{n}', num(p.stock_qty))}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-ink/50">
                {num(qty)} {t('shop.bags')} × {taka(price, lang)}
              </p>
              <p className="font-display text-2xl text-forest-950">{taka(qty * price, lang)}</p>
            </div>
          </div>
        )}

        {p.available && (
          <button
            type="button"
            onClick={() => {
              if (qty === 0) setQty(p.id, orderType === 'wholesale' ? WHOLESALE_MIN_BAGS : 1);
              navigate('/checkout');
            }}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-forest-800 px-6 py-3.5 font-semibold text-cream transition hover:bg-forest-700"
          >
            {t('shop.orderNow')}
          </button>
        )}
      </div>
    </motion.article>
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

        <p className="mt-6 text-center text-xs text-ink/45">
          {t('shop.cod')} · {t('shop.priceNote')}
        </p>
      </Container>
    </section>
  );
}
