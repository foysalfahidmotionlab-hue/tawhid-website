import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, Loader2, Printer, Wheat } from 'lucide-react';
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

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-900',
  confirmed: 'bg-sky-100 text-sky-900',
  processing: 'bg-indigo-100 text-indigo-900',
  shipped: 'bg-violet-100 text-violet-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-rose-100 text-rose-900',
};
const PAY_TONE = { unpaid: 'bg-amber-100 text-amber-900', paid: 'bg-emerald-100 text-emerald-900', refunded: 'bg-slate-200 text-slate-800' };

/** The printable receipt document (also used in the admin panel). */
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

  return (
    <article
      ref={docRef}
      id="receipt-doc"
      className="mx-auto w-full max-w-[52rem] overflow-hidden rounded-[1.5rem] bg-[#fdfcf7] text-[#0e2416] shadow-[0_30px_70px_-40px_rgba(11,53,32,0.55)] ring-1 ring-[#0b3520]/10"
      style={{ fontFamily: '"Anek Bangla", "DM Sans", sans-serif' }}
    >
      <header className="flex flex-wrap items-center justify-between gap-4 bg-[#0b3520] px-6 py-6 text-[#f6faf0] sm:px-9">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-[#e3c57f]/70 text-[#e3c57f]">
            <Wheat className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-2xl leading-tight" style={{ fontFamily: 'Galada, "Anek Bangla", serif' }}>
              {company}
            </p>
            <p className="text-xs text-[#f6faf0]/70">
              {lang === 'en' ? 'Zinia™ — Best Quality Rice' : 'জিনিয়া™ — সেরা মানের চাল'}
              {phone ? ` · ${phone}` : ''}
            </p>
            {address && <p className="text-xs text-[#f6faf0]/60">{address}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-[#e3c57f]">{t('receipt.title')}</p>
          <p className="text-xl font-bold tracking-wide">{o.order_no}</p>
        </div>
      </header>

      <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-9">
        <dl className="space-y-1.5 text-sm">
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.orderId')}</dt><dd className="font-semibold">{o.order_no}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.date')}</dt><dd>{formatDateTime(o.created_at, lang)}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.orderType')}</dt><dd className="font-semibold">{t(`orderType.${o.order_type}`)}</dd></div>
          <div className="flex items-center gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.orderStatus')}</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[o.status]}`}>{t(`status.${o.status}`)}</span></dd></div>
          <div className="flex items-center gap-2"><dt className="w-28 shrink-0 text-[#0e2416]/55">{t('receipt.paymentStatus')}</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAY_TONE[o.payment_status]}`}>{t(`payment.${o.payment_status}`)}</span></dd></div>
        </dl>
        <dl className="space-y-1.5 rounded-2xl bg-[#eef7e4] p-4 text-sm">
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#0e2416]/55">{t('receipt.customer')}</dt><dd className="font-semibold">{o.customer_name}</dd></div>
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#0e2416]/55">{t('receipt.mobile')}</dt><dd>{o.customer_phone}</dd></div>
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#0e2416]/55">{t('receipt.deliverTo')}</dt><dd>{o.address}, {o.upazila}, {district}</dd></div>
        </dl>
      </div>

      <div className="px-6 sm:px-9">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#0b3520] text-left text-xs text-[#0e2416]/60">
              <th className="py-2 pr-2 font-semibold">{t('receipt.product')}</th>
              <th className="px-2 py-2 font-semibold">{t('receipt.weight')}</th>
              <th className="px-2 py-2 text-right font-semibold">{t('receipt.pricePerBag')}</th>
              <th className="px-2 py-2 text-right font-semibold">{t('receipt.qty')}</th>
              <th className="py-2 pl-2 text-right font-semibold">{t('receipt.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((i, k) => (
              <tr key={k} className="border-b border-[#0b3520]/10 align-top">
                <td className="py-3 pr-2 font-semibold">{lang === 'en' ? i.name_en : i.name_bn}</td>
                <td className="px-2 py-3 whitespace-nowrap">{formatKg(i.weight_kg, lang)}</td>
                <td className="px-2 py-3 text-right whitespace-nowrap">{taka(i.unit_price, lang)}</td>
                <td className="px-2 py-3 text-right whitespace-nowrap">{n(i.quantity)}</td>
                <td className="py-3 pl-2 text-right font-semibold whitespace-nowrap">{taka(i.line_total, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex flex-col items-end">
          <dl className="w-full max-w-sm space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-[#0e2416]/60">{t('receipt.totalBags')}</dt><dd className="font-semibold">{n(o.total_bags)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#0e2416]/60">{t('receipt.subtotal')}</dt><dd>{taka(o.subtotal, lang)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#0e2416]/60">{t('receipt.delivery')}</dt><dd>{o.delivery_charge == null ? <span className="font-semibold text-[#94721f]">{t('receipt.deliveryPending')}</span> : taka(o.delivery_charge, lang)}</dd></div>
            <div className="flex items-end justify-between border-t-2 border-[#0b3520] pt-2.5">
              <dt className="font-bold">{t('receipt.grandTotal')}</dt>
              <dd className="text-right">
                {o.grand_total == null ? (
                  <span className="text-xs font-semibold text-[#94721f]">{t('receipt.pendingTotal')}</span>
                ) : (
                  <span className="text-2xl font-bold">{taka(o.grand_total, lang)}</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
        {o.notes && <p className="mt-4 rounded-xl bg-[#f3efe2] px-4 py-3 text-sm"><strong>{t('receipt.notes')}:</strong> {o.notes}</p>}
      </div>

      <footer className="mt-7 border-t border-dashed border-[#0b3520]/25 bg-[#f4f9ee] px-6 py-4 text-xs text-[#0e2416]/60 sm:px-9">
        <p>
          <strong className="text-[#0e2416]">{t('checkout.payment')}:</strong> {t('receipt.method')} · {t('receipt.footer')}
        </p>
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
            <div className="no-print mx-auto mb-6 flex max-w-[52rem] flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-9 w-9 shrink-0 text-forest-600" />
                <div>
                  <p className="font-display text-2xl text-forest-950">{t('receipt.thanks')}</p>
                  <p className="text-sm text-ink/55">{t('receipt.saveLink')}</p>
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
                  className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-700 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {busy ? t('receipt.making') : t('receipt.download')}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full border border-forest-900/20 bg-white px-5 py-2.5 text-sm font-semibold text-forest-900 transition hover:border-forest-700"
                >
                  <Printer className="h-4 w-4" />
                  {t('receipt.print')}
                </button>
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
