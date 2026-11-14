import { useEffect, useRef, useState } from 'react';
import { Banknote, Check, Download, Loader2, PhoneCall, Printer, Truck } from 'lucide-react';
import '@fontsource/anek-bangla/400.css';
import '@fontsource/anek-bangla/500.css';
import '@fontsource/anek-bangla/600.css';
import '@fontsource/anek-bangla/700.css';
import '@fontsource/galada/400.css';
import { useLang } from '../i18n/LanguageContext';
import { api } from '../lib/api';
import { taka, formatDateTime, formatKg } from '../lib/format';
import { Link } from '../lib/router';
import { districtBn } from '../shared/districts';
import { Container } from '../components/ui/primitives';
import { BRAND } from '../components/ui/Logo';

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-900',
  confirmed: 'bg-sky-100 text-sky-900',
  processing: 'bg-indigo-100 text-indigo-900',
  shipped: 'bg-violet-100 text-violet-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-rose-100 text-rose-900',
};
const PAY_TONE = { unpaid: 'bg-amber-100 text-amber-900', paid: 'bg-emerald-100 text-emerald-900', refunded: 'bg-slate-200 text-slate-800' };

/** The printable receipt document (also used in the admin panel and the PDF). */
export function ReceiptDoc({ o, lang: forcedLang, docRef }) {
  const ctx = useLang();
  const lang = forcedLang || ctx.lang;
  const t = ctx.tFor ? ctx.tFor(lang) : ctx.t;
  const n = (v) => (lang === 'bn' ? new Intl.NumberFormat('bn-BD').format(v) : String(v));
  const c = o.company || {};
  const company = lang === 'en' ? c.company_name_en || 'Tawhid Auto Rice Mill' : c.company_name_bn || 'তাওহীদ অটো রাইস মিল';
  const phone = c.contact_phone;
  const address = lang === 'en' ? c.contact_address_en : c.contact_address_bn;
  const district = lang === 'en' ? o.district : districtBn(o.district);
  const serif = { fontFamily: 'Georgia, "Times New Roman", serif' };
  const script = { fontFamily: 'Galada, "Anek Bangla", serif' };
  const label = 'text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#94721f]';

  return (
    <article
      ref={docRef}
      id="receipt-doc"
      className="relative mx-auto w-full max-w-[52rem] overflow-hidden rounded-[1.5rem] bg-[#fdfcf7] text-[#0e2416] shadow-[0_40px_80px_-45px_rgba(11,53,32,0.6)] ring-1 ring-[#0b3520]/10"
      style={{ fontFamily: '"Anek Bangla", "DM Sans", sans-serif' }}
    >
      {/* brand watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 select-none text-[11rem] italic leading-none text-[#0b3520]/[0.035]"
        style={serif}
      >
        Zinia
      </span>

      <header className="relative flex flex-wrap items-center justify-between gap-5 bg-[#0b3520] px-6 py-7 text-[#f6faf0] sm:px-9">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#fdfcf7] ring-2 ring-[#e3c57f]/70">
            <img src={BRAND.emblem} alt="" className="h-10 w-auto" />
          </span>
          <div>
            <p className="text-[1.65rem] leading-tight" style={script}>{company}</p>
            <p className="mt-0.5 text-sm text-[#e3c57f]">
              <span className="italic" style={serif}>Zinia™</span>
              <span className="text-[#f6faf0]/70"> — {lang === 'en' ? 'Best Quality Rice' : 'সেরা মানের চাল'}</span>
            </p>
            {(phone || address) && (
              <p className="mt-0.5 text-xs text-[#f6faf0]/60">{[phone, address].filter(Boolean).join(' · ')}</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[#e3c57f]/50 px-4 py-2.5 text-right">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#e3c57f]">{t('receipt.title')}</p>
          <p className="mt-0.5 text-xl font-bold tracking-wide">{o.order_no}</p>
        </div>
      </header>
      <div className="h-1 bg-gradient-to-r from-[#94721f] via-[#e3c57f] to-[#94721f]" />

      <div className="relative grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-9">
        <div className="rounded-2xl border border-[#0b3520]/10 bg-white/70 p-4">
          <p className={label}>{t('receipt.orderInfo')}</p>
          <dl className="mt-2.5 space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.date')}</dt><dd>{formatDateTime(o.created_at, lang)}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.orderType')}</dt><dd className="font-semibold">{t(`orderType.${o.order_type}`)}</dd></div>
            <div className="flex items-center gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.orderStatus')}</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[o.status]}`}>{t(`status.${o.status}`)}</span></dd></div>
            <div className="flex items-center gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.paymentStatus')}</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAY_TONE[o.payment_status]}`}>{t(`payment.${o.payment_status}`)}</span></dd></div>
          </dl>
        </div>
        <div className="rounded-2xl bg-[#eef4e6] p-4">
          <p className={label}>{t('receipt.billTo')}</p>
          <dl className="mt-2.5 space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#0e2416]/55">{t('receipt.customer')}</dt><dd className="font-semibold">{o.customer_name}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#0e2416]/55">{t('receipt.mobile')}</dt><dd>{o.customer_phone}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#0e2416]/55">{t('receipt.deliverTo')}</dt><dd>{o.address}, {o.upazila}, {district}</dd></div>
          </dl>
        </div>
      </div>

      <div className="relative px-6 sm:px-9">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0b3520]/[0.06] text-left text-xs text-[#0e2416]/65">
              <th className="rounded-l-lg py-2.5 pl-3 pr-1 font-semibold sm:pr-2">{t('receipt.product')}</th>
              <th className="hidden px-2 py-2.5 font-semibold sm:table-cell">{t('receipt.weight')}</th>
              <th className="px-2 py-2.5 text-right font-semibold">{t('receipt.pricePerBag')}</th>
              <th className="px-2 py-2.5 text-right font-semibold">{t('receipt.qty')}</th>
              <th className="rounded-r-lg py-2.5 pl-2 pr-3 text-right font-semibold">{t('receipt.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((i, k) => (
              <tr key={k} className="border-b border-[#0b3520]/10 align-top">
                <td className="py-3.5 pl-3 pr-2 font-semibold">
                  {lang === 'en' ? i.name_en : i.name_bn}
                  <span className="block text-xs font-normal text-[#0e2416]/55 sm:hidden">{formatKg(i.weight_kg, lang)}</span>
                </td>
                <td className="hidden whitespace-nowrap px-2 py-3.5 sm:table-cell">{formatKg(i.weight_kg, lang)}</td>
                <td className="whitespace-nowrap px-1.5 py-3.5 text-right sm:px-2">{taka(i.unit_price, lang)}</td>
                <td className="whitespace-nowrap px-1.5 py-3.5 text-right sm:px-2">{n(i.quantity)}</td>
                <td className="whitespace-nowrap py-3.5 pl-1.5 pr-3 text-right font-semibold sm:pl-2">{taka(i.line_total, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex flex-col items-end">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#0b3520]/10 bg-white/80">
            <dl className="space-y-1.5 px-4 py-3.5 text-sm">
              <div className="flex justify-between"><dt className="text-[#0e2416]/60">{t('receipt.totalBags')}</dt><dd className="font-semibold">{n(o.total_bags)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#0e2416]/60">{t('receipt.subtotal')}</dt><dd>{taka(o.subtotal, lang)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#0e2416]/60">{t('receipt.delivery')}</dt><dd>{o.delivery_charge == null ? <span className="font-semibold text-[#94721f]">{t('receipt.deliveryPending')}</span> : taka(o.delivery_charge, lang)}</dd></div>
            </dl>
            <div className="flex items-center justify-between gap-3 bg-[#0b3520] px-4 py-3 text-[#f6faf0]">
              <span className="font-bold">{t('receipt.grandTotal')}</span>
              {o.grand_total == null ? (
                <span className="max-w-[12rem] text-right text-xs font-semibold text-[#e3c57f]">{t('receipt.pendingTotal')}</span>
              ) : (
                <span className="text-2xl font-bold text-[#e3c57f]">{taka(o.grand_total, lang)}</span>
              )}
            </div>
          </div>
        </div>
        {o.notes && <p className="mt-5 rounded-xl bg-[#f3efe2] px-4 py-3 text-sm"><strong>{t('receipt.notes')}:</strong> {o.notes}</p>}
      </div>

      <footer className="relative mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-[#0b3520]/25 bg-[#f4f9ee] px-6 py-5 sm:px-9">
        <div className="text-xs text-[#0e2416]/60">
          <p className="text-lg text-[#0b3520]" style={script}>{t('receipt.thankYou')}</p>
          <p className="mt-1">
            <strong className="text-[#0e2416]">{t('checkout.payment')}:</strong> {t('receipt.method')} · {t('receipt.footer')}
          </p>
        </div>
        <img src={BRAND.seal} alt={t('hero.sealAlt')} className="h-20 w-20 rounded-full bg-white p-0.5 ring-1 ring-[#94721f]/30" />
      </footer>
    </article>
  );
}

/** Render the receipt element to an A4 PDF and save it. */
export async function downloadReceiptPdf(node, filename) {
  const pdf = await buildReceiptPdf(node);
  pdf.save(filename);
}

/** Build an A4 jsPDF document from the receipt element (keeps Bangla shaping by rasterising the real page). */
export async function buildReceiptPdf(node) {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
  await document.fonts.ready;
  const canvas = await toCanvas(node, {
    pixelRatio: 2,
    backgroundColor: '#fdfcf7',
    cacheBust: true,
    // the on-page centring margin would otherwise be copied as a fixed offset
    style: { margin: '0', boxShadow: 'none' },
  });
  const png = canvas.toDataURL('image/jpeg', 0.88); // JPEG keeps the file small
  const img = new Image();
  img.src = png;
  await img.decode();
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 10;
  const w = 210 - margin * 2;
  const h = (img.height / img.width) * w;
  const pageH = 297 - margin * 2;
  if (h <= pageH) {
    pdf.addImage(png, 'JPEG', margin, margin, w, h);
  } else {
    // Tall receipt: slice across pages.
    let y = 0;
    const sliceH = (pageH / h) * img.height;
    while (y < img.height) {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = Math.min(sliceH, img.height - y);
      c.getContext('2d').drawImage(img, 0, y, img.width, c.height, 0, 0, img.width, c.height);
      if (y > 0) pdf.addPage();
      pdf.addImage(c.toDataURL('image/jpeg', 0.88), 'JPEG', margin, margin, w, (c.height / img.width) * w);
      y += sliceH;
    }
  }
  return pdf;
}

export default function Receipt({ token }) {
  const { t } = useLang();
  const [o, setO] = useState(null);
  const [state, setState] = useState('loading');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    api(`/receipt/${encodeURIComponent(token)}`)
      .then((d) => {
        setO(d);
        setState('ready');
      })
      .catch(() => setState('missing'));
  }, [token]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="bg-production min-h-screen pb-20 pt-28 lg:pt-32">
      <Container>
        {state === 'loading' && <p className="py-24 text-center text-ink/50">{t('receipt.loading')}</p>}
        {state === 'missing' && (
          <div className="py-24 text-center">
            <p className="text-lg text-ink/70">{t('receipt.notFound')}</p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-3 font-semibold text-cream">{t('receipt.backHome')}</Link>
          </div>
        )}
        {state === 'ready' && (
          <>
            <div className="no-print mx-auto mb-8 max-w-[52rem] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_60px_-45px_rgba(11,53,32,0.55)] ring-1 ring-forest-900/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-5 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-forest-900 text-gold-light ring-4 ring-gold/25">
                    <Check className="h-8 w-8" strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="font-display text-2xl leading-tight text-forest-950 sm:text-3xl">{t('receipt.thanks')}</p>
                    <p className="mt-1 text-sm text-ink/55">
                      {t('receipt.orderNo')}: <span className="font-semibold text-forest-900">{o.order_no}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await downloadReceiptPdf(ref.current, `${o.order_no}.pdf`);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-forest-950 shadow-[0_14px_30px_-16px_rgba(201,161,74,0.9)] transition hover:bg-gold-light disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {busy ? t('receipt.making') : t('receipt.download')}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-full border border-forest-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-forest-900 transition hover:border-forest-700"
                  >
                    <Printer className="h-4 w-4" />
                    {t('receipt.print')}
                  </button>
                </div>
              </div>
              <div className="border-t border-forest-900/[0.07] bg-mint-50/70 px-6 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">{t('receipt.nextTitle')}</p>
                <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                  {t('receipt.next').map((step, i) => {
                    const Icon = [PhoneCall, Truck, Banknote][i];
                    return (
                      <li key={step} className="flex items-start gap-3 text-sm text-forest-900">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-gold-dark ring-1 ring-gold/40">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="pt-1 leading-snug">{step}</span>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-4 text-xs text-ink/50">{t('receipt.saveLink')}</p>
              </div>
            </div>
            <ReceiptDoc o={o} docRef={ref} />
            <div className="no-print mt-8 text-center">
              <Link to="/" className="text-sm font-medium text-forest-800 hover:underline">{t('receipt.backHome')}</Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
