import { ArrowUp, MapPin, Phone, Mail } from 'lucide-react';
import { site } from '../../config/site';
import { products } from '../../data/products';
import { images } from '../../data/images';
import { useLang } from '../../i18n/LanguageContext';
import { Container, Rich } from '../ui/primitives';
import Button from '../ui/Button';
import Logo, { BRAND } from '../ui/Logo';
import SocialIcon from '../ui/SocialIcon';
import { useSite } from '../../store/content';

function Column({ title, children }) {
  return (
    <div>
      <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold-light/80">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-cream/60">{children}</ul>
    </div>
  );
}

export default function Footer() {
  const { t, tr, num } = useLang();
  const content = useSite();

  return (
    <footer className="grain relative isolate overflow-hidden bg-forest-800 text-cream">
      <img src={content.footerBanner} alt="" loading="lazy" className="absolute inset-x-0 top-0 -z-20 h-[34rem] w-full object-cover opacity-35" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-gradient-to-b from-forest-800/30 via-forest-800/70 to-forest-800" />

      <Container className="pt-24">
        {/* CTA */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-16 md:flex-row md:items-end">
          <div>
            <p className="font-display text-lg italic text-wheat/80">{t('brand.positioning')}</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-light leading-[1.1] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              <Rich parts={t('footer.tagline')} tone="dark" />
            </h2>
          </div>
          <Button href="/#order" variant="accent" size="lg">{t('shop.orderNow')}</Button>
        </div>

        {/* columns */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="inline-block rounded-2xl bg-cream px-5 py-4 shadow-[0_20px_40px_-25px_rgba(0,0,0,0.6)]">
              <Logo full />
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/50">{t('footer.desc', { cap: num(content.capacity) })}</p>
            <div className="mt-6 flex max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <img src={BRAND.seal} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-full bg-white p-0.5" />
              <p className="text-xs leading-relaxed text-cream/60">
                <span className="block text-sm font-semibold text-cream">{t('brand.trademark')}</span>
                {t('hero.brandOf')}
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              {site.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-gold hover:bg-gold hover:text-forest-950"
                >
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Column title={t('footer.navigation')}>
              {site.nav.map((n) => (
                <li key={n.href}>
                  <a href={`/${n.href}`} className="transition hover:text-gold-light">{t(`nav.${n.key}`)}</a>
                </li>
              ))}
            </Column>
          </div>

          <div className="lg:col-span-2">
            <Column title={t('footer.products')}>
              {products.map((p) => (
                <li key={p.id}>
                  <a href="/#order" className="transition hover:text-gold-light">{tr(p.name)}</a>
                </li>
              ))}
            </Column>
          </div>

          <div className="lg:col-span-4">
            <Column title={t('footer.contact')}>
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4 shrink-0 text-gold-light/70" />{content.contact.address}</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-gold-light/70" />{content.contact.phone}</li>
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-gold-light/70" />{content.contact.email}</li>
            </Column>
          </div>
        </div>
      </Container>

      {/* giant wordmark */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="-mb-[0.24em] text-center font-display text-[24vw] font-light italic leading-none tracking-[-0.04em] text-gold-light/[0.1]">
          {content.brandShort || t('brand.short')}
        </p>
      </div>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-cream/40 sm:flex-row">
          <p>
            {t('footer.rights', { year: num(new Date().getFullYear()) })} <span className="text-cream/55">{t('footer.trademarkNote')}</span>
          </p>
          <a href="/" className="inline-flex items-center gap-2 transition hover:text-cream">
            {t('footer.top')} <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </Container>
      </div>
    </footer>
  );
}
