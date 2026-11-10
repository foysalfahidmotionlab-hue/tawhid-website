import { ArrowUpRight } from 'lucide-react';

// [button classes, icon-chip classes]
const variants = {
  accent: ['bg-gold text-forest-950 hover:bg-gold-light shadow-[0_16px_34px_-16px_rgba(201,161,74,0.9)]', 'bg-forest-950/10'],
  primary: ['bg-forest-800 text-cream hover:bg-forest-700 shadow-[0_16px_34px_-16px_rgba(29,50,26,0.8)]', 'bg-white/15'],
  light: ['bg-cream text-forest-900 hover:bg-white', 'bg-forest-800 text-cream'],
  glass: ['border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20', 'bg-white/15'],
  outline: ['border border-forest-900/15 text-forest-900 hover:border-forest-700 hover:bg-forest-900/[0.03]', 'bg-forest-800 text-cream'],
};

const sizes = {
  sm: { icon: 'py-1.5 pl-5 pr-1.5 text-sm', plain: 'px-5 py-2.5 text-sm', chip: 'h-7 w-7' },
  md: { icon: 'py-2 pl-6 pr-2 text-sm', plain: 'px-7 py-3.5 text-sm', chip: 'h-8 w-8' },
  lg: { icon: 'py-2 pl-7 pr-2 text-[0.95rem]', plain: 'px-8 py-4 text-[0.95rem]', chip: 'h-10 w-10' },
};

export default function Button({
  href,
  variant = 'accent',
  size = 'md',
  icon = true,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const [look, chip] = variants[variant] ?? variants.accent;
  const s = sizes[size];
  const cls = `group inline-flex items-center justify-center gap-3 rounded-full font-semibold tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${look} ${
    icon ? s.icon : s.plain
  } ${className}`;

  const content = (
    <>
      {children}
      {icon && (
        <span className={`grid place-items-center rounded-full ${chip} ${s.chip}`}>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {content}
    </button>
  );
}
