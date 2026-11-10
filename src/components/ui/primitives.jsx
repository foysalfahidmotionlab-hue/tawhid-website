import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { useLang } from '../../i18n/LanguageContext';

export const ease = [0.22, 1, 0.36, 1];

export function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div>;
}

/** Fades and lifts its children into view once. */
export function Reveal({ children, delay = 0, y = 28, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Small label with a golden rule, e.g. "— OUR STORY". */
export function Eyebrow({ children, tone = 'light', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] ${
        tone === 'dark' ? 'text-gold-light' : 'text-gold-dark'
      } ${className}`}
    >
      <span className="h-px w-10 bg-current opacity-70" />
      {children}
    </span>
  );
}

/** Golden emphasis word — italic in English; upright in Bangla (Bangla has no true italic). */
export function Mark({ children, tone = 'light' }) {
  const { lang } = useLang();
  return (
    <em className={`font-normal ${lang === 'en' ? 'italic' : 'not-italic'} ${tone === 'dark' ? 'text-gold-light' : 'text-gold-dark'}`}>
      {children}
    </em>
  );
}

/** Renders a heading written as parts: [{ t }, { t, mark: true }, { br: true }]. */
export function Rich({ parts, tone = 'light' }) {
  if (!Array.isArray(parts)) return parts;
  return parts.map((p, i) => (
    <Fragment key={i}>{p.br ? <br /> : p.mark ? <Mark tone={tone}>{p.t}</Mark> : p.t}</Fragment>
  ));
}

export function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'light', className = '' }) {
  const center = align === 'center';
  const dark = tone === 'dark';
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2
          className={`mt-5 text-balance font-display text-[2.4rem] font-light leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-[3.8rem] ${
            dark ? 'text-cream' : 'text-forest-950'
          }`}
        >
          <Rich parts={title} tone={tone} />
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.12}>
          <p className={`mt-6 text-base leading-relaxed sm:text-lg ${dark ? 'text-cream/65' : 'text-ink/60'} ${center ? 'mx-auto max-w-2xl' : ''}`}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/** Counts up from 0 when scrolled into view; digits follow the active language. */
export function CountUp({ to, duration = 2, className = '' }) {
  const { num } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration, ease, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {num(value)}
    </span>
  );
}
