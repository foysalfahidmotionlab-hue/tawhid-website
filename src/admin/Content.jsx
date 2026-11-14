import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import { images } from '../data/images';
import { products as showcase } from '../data/products';
import { gallery } from '../data/content';
import { strings } from '../i18n/strings';
import { site } from '../config/site';
import { Card, PageHeader, Btn, Field, Notice, UploadButton, inputCls, useLoad } from './ui';

const plain = (parts) => (Array.isArray(parts) ? parts.map((p) => (p.br ? '\n' : p.mark ? `*${p.t}*` : p.t)).join('') : parts);

const TEXT = [
  ['hero_title_bn', 'Hero heading (Bangla)', plain(strings.bn.hero.title), true],
  ['hero_title_en', 'Hero heading (English)', plain(strings.en.hero.title), true],
  ['hero_sub_bn', 'Hero description (Bangla)', strings.bn.hero.sub, true],
  ['hero_sub_en', 'Hero description (English)', strings.en.hero.sub, true],
];
const COMPANY = [
  ['company_name_bn', 'Company name (Bangla)', strings.bn.brand.name],
  ['company_name_en', 'Company name (English)', strings.en.brand.name],
  ['company_short_bn', 'Logo name (Bangla)', strings.bn.brand.short],
  ['company_short_en', 'Logo name (English)', strings.en.brand.short],
  ['capacity', 'Production capacity (tons per day)', String(site.capacity)],
];
const CONTACT = [
  ['contact_address_bn', 'Address (Bangla)', site.contact.address.bn],
  ['contact_address_en', 'Address (English)', site.contact.address.en],
  ['contact_phone', 'Phone', ''],
  ['contact_email', 'Email', ''],
];
const PAYMENT = [
  ['payment_instructions_bn', 'How to send the advance (Bangla)', 'যেমন: বিকাশ/নগদ নম্বর বা ব্যাংক হিসাব, আর রেফারেন্সে অর্ডার নম্বর লিখতে বলুন', true],
  ['payment_instructions_en', 'How to send the advance (English)', 'e.g. bKash/Nagad number or bank account, and ask for the order number as reference', true],
];
const BANNERS = [
  ['hero_bg_image', 'Hero background (paddy field)', images.greenField],
  ['story_banner_image', 'Story banner', images.villageField],
  ['footer_banner_image', 'Footer background', images.heroField],
];

function ImageSlot({ label, value, fallback, onChange, kind }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2 ring-1 ring-forest-900/[0.07]">
      <div className={`grid h-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-forest-50 ${kind === 'pack' ? 'w-14' : 'w-24'}`}>
        {value || fallback ? (
          <img src={value || fallback} alt="" className={`h-full w-full ${kind === 'pack' ? 'object-contain' : 'object-cover'}`} />
        ) : (
          <span className="text-[0.65rem] text-ink/40">Empty</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-forest-950">{label}</p>
        <p className="text-xs text-ink/45">{value ? 'Custom image' : fallback ? 'Default image' : 'Placeholder shown'}</p>
      </div>
      <UploadButton kind={kind} onUploaded={(out) => onChange(out.url)}>{value ? 'Replace' : 'Upload'}</UploadButton>
      {value && (
        <button type="button" title="Back to default" aria-label="Back to default" onClick={() => onChange('')} className="rounded-lg p-2 text-ink/50 hover:bg-forest-50">
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function Content() {
  const { data, error } = useLoad('/admin/content');
  const [c, setC] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ tone: 'ok', text: '' });

  useEffect(() => {
    if (data) setC({ showcase_images: {}, gallery_images: {}, ...data });
  }, [data]);

  if (error) return <Notice>{error}</Notice>;
  if (!c) return <p className="text-ink/50">Loading…</p>;

  const set = (k) => (e) => setC((x) => ({ ...x, [k]: e.target.value }));
  const setMap = (map, slot) => (url) => setC((x) => ({ ...x, [map]: { ...x[map], [slot]: url } }));

  const textField = ([k, label, def, area]) => (
    <Field key={k} label={label} hint={area && k.startsWith('hero_title') ? 'Wrap a word in *stars* to colour it gold. New line = line break.' : undefined}>
      {area ? (
        <textarea rows={2} className={`${inputCls} resize-y`} placeholder={def} value={c[k] || ''} onChange={set(k)} />
      ) : (
        <input className={inputCls} placeholder={def} value={c[k] || ''} onChange={set(k)} />
      )}
    </Field>
  );

  const save = async () => {
    setBusy(true);
    setMsg({ tone: 'ok', text: '' });
    try {
      const out = await api('/admin/content', { method: 'PUT', body: c });
      setC({ showcase_images: {}, gallery_images: {}, ...out });
      setMsg({ tone: 'ok', text: 'Saved — the website now shows these changes.' });
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Website content"
        subtitle="Empty fields use the original website text and images. Uploaded images are resized and converted to WebP automatically."
        actions={<Btn variant="primary" busy={busy} onClick={save}>Save changes</Btn>}
      />
      {msg.text && <div className="mb-4"><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Homepage hero"><div className="space-y-4">{TEXT.map(textField)}</div></Card>
        <Card title="Company information"><div className="grid gap-4 sm:grid-cols-2">{COMPANY.map(textField)}</div></Card>
        <Card title="Contact information"><div className="grid gap-4 sm:grid-cols-2">{CONTACT.map(textField)}</div></Card>
        <Card title="Advance payment instructions">
          <p className="mb-3 text-xs text-ink/50">Shown at checkout and on receipts for 10%, 50%, delivery-charge and full advance orders. Leave empty to say “our team will call you”.</p>
          <div className="space-y-4">{PAYMENT.map(textField)}</div>
        </Card>
        <Card title="Banner images">
          <div className="space-y-2">
            {BANNERS.map(([k, label, def]) => (
              <ImageSlot key={k} label={label} value={c[k]} fallback={def} onChange={(url) => setC((x) => ({ ...x, [k]: url }))} />
            ))}
          </div>
        </Card>
        <Card title="Hero rice showcase images">
          <p className="mb-3 text-xs text-ink/50">The packs that swing through the hero slideshow. Use transparent PNG/WebP images for the best look.</p>
          <div className="space-y-2">
            {showcase.map((p) => (
              <ImageSlot key={p.id} kind="pack" label={p.name.bn} value={c.showcase_images[p.id]} fallback={p.image} onChange={setMap('showcase_images', p.id)} />
            ))}
          </div>
        </Card>
        <Card title="Gallery images">
          <div className="space-y-2">
            {gallery.map((g) => (
              <ImageSlot key={g.id} label={`${g.label.bn} · ${g.label.en}`} value={c.gallery_images[g.id]} fallback={g.src} onChange={setMap('gallery_images', String(g.id))} />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Btn variant="primary" busy={busy} onClick={save}>Save changes</Btn>
      </div>
    </>
  );
}
