import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Phone, Mail, CircleCheck } from 'lucide-react';
import { site } from '../config/site';
import { products } from '../data/products';
import { useLang } from '../i18n/LanguageContext';
import { Container, SectionHeading, Reveal, ease } from '../components/ui/primitives';
import Button from '../components/ui/Button';
import SocialIcon from '../components/ui/SocialIcon';
import { useSite } from '../store/content';

const chevron = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#284321" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
)}")`;

const empty = { name: '', phone: '', email: '', product: '', message: '' };

const inputCls =
  'w-full rounded-2xl border border-forest-900/10 bg-white/70 px-5 py-3.5 text-[0.95rem] text-ink outline-none transition placeholder:text-ink/35 focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold-light/40';

function Field({ label, id, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-forest-900/70">
        {label} {required && <span className="text-forest-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export default function Contact({ inquiry }) {
  const { t, tr } = useLang();
  const { contact } = useSite();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  // `inquiry` is a product id (or 'bulk'), so the selection survives a language switch.
  useEffect(() => {
    if (inquiry) setForm((f) => ({ ...f, product: inquiry }));
  }, [inquiry]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'errName';
    if (!form.phone.trim()) next.phone = 'errPhone';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'errEmail';
    setErrors(next);
    if (Object.keys(next).length) return;
    // TODO: connect to a form backend / email service here.
    setSent(true);
  };

  const info = [
    { icon: MapPin, label: t('contact.address'), value: contact.address },
    { icon: Phone, label: t('contact.phone'), value: contact.phone },
    { icon: Mail, label: t('contact.email'), value: contact.email },
  ];

  return (
    <section id="contact" className="bg-gradient-to-b from-cream to-sand py-24 lg:py-36">
      <Container>
        <SectionHeading align="center" eyebrow={t('contact.eyebrow')} title={t('contact.title')} description={t('contact.desc')} />

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          {/* info card */}
          <Reveal className="lg:col-span-5">
            <div className="relative isolate flex h-full flex-col justify-between gap-12 overflow-hidden rounded-[2rem] bg-card-tint p-8 text-forest-950 sm:p-10">
              <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
              <div>
                <h3 className="font-display text-4xl font-light leading-[1.1]">{t('contact.cardTitle')}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/60">{t('contact.cardText')}</p>
              </div>
              <ul className="space-y-6">
                {info.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/50 bg-white/60 text-gold-dark">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold-dark">{label}</span>
                      <span className="mt-1 block text-base text-forest-950">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                {site.socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-forest-800 ring-1 ring-forest-900/10 transition hover:bg-gold hover:text-forest-950"
                  >
                    <SocialIcon name={s.name} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* form */}
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-[2rem] bg-cream p-7 shadow-[0_40px_80px_-50px_rgba(17,32,19,0.5)] ring-1 ring-forest-900/[0.06] sm:p-10">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="flex h-full min-h-[26rem] flex-col items-center justify-center text-center"
                  >
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-forest-100 text-forest-700">
                      <CircleCheck className="h-7 w-7" />
                    </span>
                    <h3 className="mt-6 font-display text-4xl font-light text-forest-950">
                      {t('contact.thanks', { name: form.name.trim().split(' ')[0] })}
                    </h3>
                    <p className="mt-3 max-w-sm text-ink/60">{t('contact.thanksText')}</p>
                    <Button
                      variant="outline"
                      icon={false}
                      className="mt-8"
                      onClick={() => {
                        setForm(empty);
                        setSent(false);
                      }}
                    >
                      {t('contact.again')}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="grid gap-5 sm:grid-cols-2">
                    <Field label={t('contact.name')} id="name" required error={errors.name && t(`contact.${errors.name}`)}>
                      <input id="name" className={inputCls} placeholder={t('contact.namePh')} value={form.name} onChange={set('name')} autoComplete="name" />
                    </Field>
                    <Field label={t('contact.phoneNumber')} id="phone" required error={errors.phone && t(`contact.${errors.phone}`)}>
                      <input id="phone" type="tel" className={inputCls} placeholder={t('contact.phonePh')} value={form.phone} onChange={set('phone')} autoComplete="tel" />
                    </Field>
                    <Field label={t('contact.email')} id="email" error={errors.email && t(`contact.${errors.email}`)}>
                      <input id="email" type="email" className={inputCls} placeholder={t('contact.emailPh')} value={form.email} onChange={set('email')} autoComplete="email" />
                    </Field>
                    <Field label={t('contact.product')} id="product">
                      <select
                        id="product"
                        className={`${inputCls} appearance-none bg-[length:18px] bg-[right_1.1rem_center] bg-no-repeat pr-12`}
                        style={{ backgroundImage: chevron }}
                        value={form.product}
                        onChange={set('product')}
                      >
                        <option value="">{t('contact.selectPh')}</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{tr(p.name)}</option>
                        ))}
                        <option value="bulk">{t('contact.bulk')}</option>
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label={t('contact.message')} id="message">
                        <textarea id="message" rows={5} className={`${inputCls} resize-none`} placeholder={t('contact.messagePh')} value={form.message} onChange={set('message')} />
                      </Field>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                      <Button type="submit" variant="primary" size="lg">{t('contact.submit')}</Button>
                      {site.showFormPreviewNotice && <p className="text-xs text-ink/40">{t('contact.notice')}</p>}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
