import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { site } from '../../config/site';
import { useLang } from '../../i18n/LanguageContext';
import { useActiveSection } from '../../hooks/useActiveSection';
import { Container, ease } from '../ui/primitives';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import LangToggle from '../ui/LangToggle';

const ids = site.nav.map((n) => n.href.slice(1));

export default function Header() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,padding,box-shadow] duration-500 ${
          scrolled ? 'bg-cream/90 py-3 shadow-[0_1px_0_rgba(17,32,19,0.08)] backdrop-blur-xl' : 'py-6'
        }`}
      >
        <Container className="flex items-center justify-between gap-6">
          <Logo tone="dark" />

          <div className="flex items-center gap-6 xl:gap-8">
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-6 xl:gap-8">
                {site.nav.map((item) => {
                  const isActive = active === item.href.slice(1);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`relative block py-1 text-[0.85rem] font-medium transition-colors duration-300 ${
                          isActive ? 'text-forest-950' : 'text-ink/55 hover:text-forest-950'
                        }`}
                      >
                        {t(`nav.${item.key}`)}
                        {isActive && (
                          <motion.span
                            layoutId="nav-line"
                            className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <LangToggle tone="dark" id="header-lang" />
              <span className="hidden sm:block">
                <Button href="#contact" variant="accent" size="sm">
                  {t('nav.quote')}
                </Button>
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t('nav.openMenu')}
                aria-expanded={open}
                className="grid h-11 w-11 place-items-center rounded-full bg-forest-900 text-cream transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </motion.header>

      <AnimatePresence>{open && <MobileMenu active={active} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function MobileMenu({ active, onClose }) {
  const { t, tr, num } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-hero fixed inset-0 z-[70] flex flex-col overflow-y-auto text-forest-950 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <Container className="relative flex items-center justify-between py-5">
        <Logo tone="dark" />
        <button
          type="button"
          onClick={onClose}
          aria-label={t('nav.closeMenu')}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/70 ring-1 ring-forest-900/10"
        >
          <X className="h-5 w-5" />
        </button>
      </Container>

      <Container className="relative flex flex-1 flex-col justify-between pb-10 pt-8">
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {site.nav.map((item, i) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.6, ease }}
              >
                <a
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-baseline gap-4 py-2 font-display text-[2.3rem] font-light leading-tight ${
                    active === item.href.slice(1) ? 'text-forest-950' : 'text-forest-950/45'
                  }`}
                >
                  <span className="font-sans text-xs font-semibold tracking-widest text-gold-dark">{num(`0${i + 1}`)}</span>
                  {t(`nav.${item.key}`)}
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="mt-10 space-y-6"
        >
          <LangToggle tone="dark" id="menu-lang" />
          <Button href="#contact" variant="accent" size="lg" onClick={onClose} className="w-full">
            {t('nav.quote')}
          </Button>
          <div className="flex flex-col gap-2 text-sm text-ink/60">
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{tr(site.contact.phone)}</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{tr(site.contact.email)}</span>
          </div>
        </motion.div>
      </Container>
    </motion.div>
  );
}
