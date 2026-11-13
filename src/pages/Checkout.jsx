import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { useShop } from '../store/shop';
import { api } from '../lib/api';
import { taka, formatKg } from '../lib/format';
import { navigate, goToSection } from '../lib/router';
import { DISTRICTS } from '../shared/districts';
import { normalizeBdPhone, WHOLESALE_MIN_BAGS } from '../shared/rules';
import { Container } from '../components/ui/primitives';
import QtyStepper from '../components/shop/QtyStepper';
import { OrderTypeToggle } from '../sections/Shop';

const inputCls =
  'w-full rounded-2xl border bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-4 focus:ring-gold-light/40';

function Field({ id, label, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest-900">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

const newKey = () =>
  (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9-]/g, '');

export default function Checkout() {
  const { t, lang, num } = useLang();
  const { lines, orderType, totalBags, meetsMinimum, setQty, clearCart, catalog } = useShop();
  const [form, setForm] = useState({ name: '', phone: '', address: '', district: '', upazila: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const keyRef = useRef(newKey());

  const items = useMemo(() => lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })), [lines]);

  // Server price check whenever the order or district changes.
  useEffect(() => {
    if (!items.length || !meetsMinimum) {
      setQuote(null);
      return undefined;
    }
    let stale = false;
    const timer = setTimeout(() => {
      api('/quote', { method: 'POST', body: { order_type: orderType, items, district: form.district || undefined } })
        .then((q) => {
          if (!stale) {
            setQuote(q);
            setQuoteError('');
          }
        })
        .catch((e) => {
          if (!stale) {
            setQuote(null);
            setQuoteError(e.message);
          }
        });
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [items, orderType, form.district, meetsMinimum]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('checkout.errName');
    if (!normalizeBdPhone(form.phone)) e.phone = t('checkout.errPhone');
    if (form.address.trim().length < 5) e.address = t('checkout.errAddress');
    if (!form.district) e.district = t('checkout.errDistrict');
    if (form.upazila.trim().length < 2) e.upazila = t('checkout.errUpazila');
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus();
      return false;
    }
    return true;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    setSubmitError('');
    if (!validate() || !meetsMinimum || !items.length) return;
    setSubmitting(true);
    try {
      const out = await api('/orders', {
        method: 'POST',
        body: { order_type: orderType, items, customer: form, idempotency_key: keyRef.current },
      });
      clearCart();
      keyRef.current = newKey();
      navigate(`/receipt/${out.receipt_token}`, { replace: true });
    } catch (e) {
      const f = e.data?.fields;
      if (f) {
        const map = { name: 'errName', phone: 'errPhone', address: 'errAddress', district: 'errDistrict', upazila: 'errUpazila' };
        setErrors(Object.fromEntries(Object.keys(f).map((k) => [k, t(`checkout.${map[k]}`)])));
      }
      setSubmitError(e.status === 400 || e.status === 429 ? e.message : t('checkout.errGeneric'));
      setSubmitting(false);
    }
  };

  const err = (k) => (errors[k] ? 'border-rose-400' : 'border-forest-900/12');
  const dl = quote?.delivery;

  if (catalog.status === 'ready' && lines.length === 0) {
    return (
      <Container className="flex min-h-[70svh] flex-col items-center justify-center pt-28 text-center">
        <p className="font-display text-3xl text-forest-950">{t('checkout.emptyCart')}</p>
        <button type="button" onClick={() => goToSection('order')} className="mt-6 rounded-full bg-forest-800 px-6 py-3 font-semibold text-cream">
          {t('checkout.shopNow')}
        </button>
      </Container>
    );
  }

  return (
    <div className="bg-production min-h-screen pb-24 pt-28 lg:pt-32">
      <Container>
        <button type="button" onClick={() => goToSection('order')} className="inline-flex items-center gap-2 text-sm font-medium text-forest-800 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t('checkout.back')}
        </button>
        <h1 className="mt-4 font-display text-4xl text-forest-950 sm:text-5xl">{t('checkout.title')}</h1>

        <form onSubmit={submit} noValidate className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* customer details */}
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-[1.75rem] bg-white/85 p-6 shadow-[0_24px_50px_-40px_rgba(11,53,32,0.5)] ring-1 ring-forest-900/[0.06] sm:p-8">
              <h2 className="font-display text-2xl text-forest-950">{t('checkout.orderType')}</h2>
              <div className="mt-4">
                <OrderTypeToggle compact />
              </div>
            </section>

            <section className="rounded-[1.75rem] bg-white/85 p-6 shadow-[0_24px_50px_-40px_rgba(11,53,32,0.5)] ring-1 ring-forest-900/[0.06] sm:p-8">
              <h2 className="font-display text-2xl text-forest-950">{t('checkout.yourDetails')}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field id="name" label={t('checkout.name')} required error={errors.name}>
                  <input id="name" autoComplete="name" className={`${inputCls} ${err('name')}`} placeholder={t('checkout.namePh')} value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
                </Field>
                <Field id="phone" label={t('checkout.phone')} required error={errors.phone}>
                  <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className={`${inputCls} ${err('phone')}`} placeholder={t('checkout.phonePh')} value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="address" label={t('checkout.address')} required error={errors.address}>
                    <textarea id="address" rows={2} autoComplete="street-address" className={`${inputCls} ${err('address')} resize-none`} placeholder={t('checkout.addressPh')} value={form.address} onChange={set('address')} aria-invalid={!!errors.address} />
                  </Field>
                </div>
                <Field id="district" label={t('checkout.district')} required error={errors.district}>
                  <select id="district" className={`${inputCls} ${err('district')}`} value={form.district} onChange={set('district')} aria-invalid={!!errors.district}>
                    <option value="">{t('checkout.districtPh')}</option>
                    {DISTRICTS.map((d) => (
                      <option key={d.en} value={d.en}>
                        {lang === 'en' ? d.en : `${d.bn} (${d.en})`}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="upazila" label={t('checkout.upazila')} required error={errors.upazila}>
                  <input id="upazila" className={`${inputCls} ${err('upazila')}`} placeholder={t('checkout.upazilaPh')} value={form.upazila} onChange={set('upazila')} aria-invalid={!!errors.upazila} />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="notes" label={t('checkout.notes')}>
                    <textarea id="notes" rows={2} className={`${inputCls} border-forest-900/12 resize-none`} placeholder={t('checkout.notesPh')} value={form.notes} onChange={set('notes')} />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          {/* summary */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28 rounded-[1.75rem] bg-forest-950 p-6 text-cream shadow-[0_40px_70px_-40px_rgba(0,0,0,0.6)] sm:p-8">
              <h2 className="font-display text-2xl">{t('checkout.summary')}</h2>
              <p className="mt-1 text-sm text-cream/60">
                {t(`orderType.${orderType}`)} · {num(totalBags)} {t('shop.bags')}
              </p>

              <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {lines.map((l) => {
                  const ql = quote?.lines.find((x) => x.product_id === l.product.id);
                  const unit = ql?.unit_price ?? l.unit_price;
                  return (
                    <li key={l.product.id} className="flex gap-4 py-4">
                      <img src={l.product.image} alt="" className="h-16 w-14 shrink-0 object-contain" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-snug">{lang === 'en' ? l.product.name_en : l.product.name_bn}</p>
                        <p className="text-xs text-cream/55">
                          {formatKg(l.product.weight_kg, lang)} · {taka(unit, lang)} / {t('shop.bag')}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="[&_button]:border-white/20 [&_button]:bg-white/10 [&_button]:text-cream [&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-cream">
                            <QtyStepper size="sm" value={l.quantity} onChange={(n) => setQty(l.product.id, n)} max={l.product.stock_qty ?? undefined} />
                          </div>
                          <button type="button" onClick={() => setQty(l.product.id, 0)} aria-label={t('shop.remove')} className="text-cream/50 hover:text-rose-300">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 font-semibold">{taka(unit * l.quantity, lang)}</p>
                    </li>
                  );
                })}
              </ul>

              {orderType === 'wholesale' && !meetsMinimum && (
                <p role="alert" className="mt-4 rounded-xl bg-gold/15 px-4 py-3 text-sm text-gold-light">
                  {t('shop.wholesaleMin')} {t('shop.needMore').replace('{n}', num(WHOLESALE_MIN_BAGS - totalBags))}
                </p>
              )}
              {quoteError && <p className="mt-4 rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{quoteError}</p>}

              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-cream/60">{t('checkout.products')}</dt>
                  <dd>{taka(quote?.subtotal ?? lines.reduce((a, l) => a + l.line_total, 0), lang)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-cream/60">{t('checkout.delivery')}</dt>
                  <dd className="text-right">
                    {!form.district
                      ? <span className="text-cream/50">{t('checkout.deliveryPickDistrict')}</span>
                      : dl?.charge == null
                        ? <span className="text-gold-light">{t('checkout.deliveryPending')}</span>
                        : dl.charge === 0 ? t('checkout.free') : taka(dl.charge, lang)}
                  </dd>
                </div>
                <div className="flex items-end justify-between border-t border-white/10 pt-4">
                  <dt className="font-semibold">{t('checkout.grandTotal')}</dt>
                  <dd className="text-right">
                    {quote?.grand_total != null ? (
                      <span className="font-display text-3xl text-gold-light">{taka(quote.grand_total, lang)}</span>
                    ) : (
                      <span className="block max-w-[14rem] text-xs text-gold-light">{t('checkout.pendingTotal')}</span>
                    )}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 flex items-start gap-2 rounded-xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-cream/70">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
                <span>
                  <strong className="text-cream">{t('checkout.payment')}:</strong> {t('shop.cod')}. {t('checkout.agree')}
                </span>
              </p>

              {submitError && (
                <p role="alert" className="mt-4 rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !meetsMinimum || !lines.length || !!quoteError}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-bold text-forest-950 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {submitting ? t('checkout.placing') : t('checkout.confirm')}
              </button>
            </div>
          </aside>
        </form>
      </Container>
    </div>
  );
}
