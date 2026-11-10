import { useId } from 'react';

// Deterministic rice-grain positions for the food window (sunflower spiral).
const GRAINS = Array.from({ length: 78 }, (_, i) => {
  const a = i * 2.39996;
  const r = 64 * Math.sqrt((i + 0.5) / 78);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, rot: (i * 53) % 180 };
});

const zigzag = (y, dir, x0 = 18, x1 = 282, step = 8) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += step) d += ` L${x + step / 2} ${y + dir * 6} L${x + step} ${y}`;
  return d;
};

/**
 * Temporary pillow-pouch rice packaging, drawn in SVG.
 * Pass `image` to show a real packaging photo instead.
 */
export default function RiceBag({
  title = 'Katari',
  colors = ['#1d321a', '#456d34'],
  accent = '#c9a14a',
  image = null,
  className = '',
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [dark, light] = colors;
  const label = (title.toLowerCase().startsWith('rice') ? title : `${title} Rice`).toUpperCase();

  if (image) {
    return <img src={image} alt={`${title} rice packaging`} className={`object-contain ${className}`} loading="lazy" />;
  }

  const body = 'M22 40 C 90 33, 210 33, 278 40 C 290 150, 290 270, 278 384 C 210 391, 90 391, 22 384 C 10 270, 10 150, 22 40 Z';
  const sans = { fontFamily: '"DM Sans", sans-serif' };
  const serif = { fontFamily: 'Fraunces, Georgia, serif', fontVariationSettings: '"SOFT" 100' };

  return (
    <svg viewBox="0 0 300 430" className={className} role="img" aria-label={`${title} rice packaging mockup`}>
      <defs>
        <linearGradient id={`top${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fdfaf2" />
          <stop offset="0.7" stopColor="#efe5cc" />
        </linearGradient>
        <linearGradient id={`low${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`edge${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.12" stopColor="#000" stopOpacity="0" />
          <stop offset="0.88" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={`rice${uid}`}>
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#ead7ae" />
        </radialGradient>
        <clipPath id={`clip${uid}`}>
          <path d={body} />
        </clipPath>
        <filter id={`blur${uid}`} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <ellipse cx="150" cy="406" rx="120" ry="12" fill="#0d1a0f" opacity="0.35" filter={`url(#blur${uid})`} />

      <g clipPath={`url(#clip${uid})`}>
        <rect width="300" height="430" fill={`url(#top${uid})`} />
        {/* coloured lower half */}
        <path d="M0 262 C 70 236, 190 292, 300 250 L300 430 L0 430 Z" fill={`url(#low${uid})`} />
        <path d="M0 254 C 70 228, 190 284, 300 242" fill="none" stroke={light} strokeOpacity="0.35" strokeWidth="3" />

        {/* logo */}
        <circle cx="80" cy="100" r="36" fill="#fff" stroke={dark} strokeWidth="2.5" />
        <circle cx="80" cy="100" r="30" fill="none" stroke={dark} strokeOpacity="0.25" />
        <text x="80" y="104" textAnchor="middle" fill={dark} fontSize="17" fontWeight="800" style={serif}>
          Zinia
        </text>
        <text x="80" y="117" textAnchor="middle" fill={dark} fillOpacity="0.7" fontSize="5.4" fontWeight="700" letterSpacing="1" style={sans}>
          AUTO RICE MILL
        </text>

        {/* rice window */}
        <circle cx="198" cy="168" r="76" fill="#fff" />
        <circle cx="198" cy="168" r="70" fill={`url(#rice${uid})`} />
        <g>
          {GRAINS.map((g, i) => (
            <ellipse
              key={i}
              cx={198 + g.x}
              cy={168 + g.y}
              rx="2.4"
              ry="6.2"
              fill="#fffdf6"
              stroke="#d9c393"
              strokeWidth="0.6"
              transform={`rotate(${g.rot} ${198 + g.x} ${168 + g.y})`}
            />
          ))}
        </g>
        <circle cx="198" cy="168" r="79" fill="none" stroke={light} strokeOpacity="0.4" strokeWidth="1.5" />

        {/* quality seal */}
        <circle cx="252" cy="76" r="21" fill={accent} />
        <circle cx="252" cy="76" r="17" fill="none" stroke="#fff" strokeOpacity="0.6" strokeDasharray="2 2" />
        <text x="252" y="74" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="800" style={sans}>BEST</text>
        <text x="252" y="83" textAnchor="middle" fill="#fff" fontSize="5.6" fontWeight="700" style={sans}>QUALITY</text>

        {/* name band */}
        <text x="150" y="318" textAnchor="middle" fill="#fff" fontSize={label.length > 11 ? 23 : 26} fontWeight="800" letterSpacing="0.5" style={serif}>
          {label}
        </text>
        <text x="150" y="340" textAnchor="middle" fill="#fff" fillOpacity="0.85" fontSize="12" fontStyle="italic" style={serif}>
          Premium Quality Rice
        </text>
        <line x1="80" x2="220" y1="354" y2="354" stroke="#fff" strokeOpacity="0.3" />
        <text x="150" y="370" textAnchor="middle" fill="#fff" fillOpacity="0.7" fontSize="7" fontWeight="700" letterSpacing="2.5" style={sans}>
          ZINIA AUTO RICE MILL
        </text>

        {/* gloss + edge shading */}
        <path d="M44 30 L84 30 L44 400 L22 400 Z" fill="#fff" opacity="0.18" />
        <path d="M96 30 L108 30 L70 400 L60 400 Z" fill="#fff" opacity="0.1" />
        <rect width="300" height="430" fill={`url(#edge${uid})`} />
      </g>

      {/* crimped seals */}
      <path d={`${zigzag(22, -1)} L282 46 L18 46 Z`} fill="#f6efdc" />
      <path d={`${zigzag(22, -1)} L282 46 L18 46 Z`} fill={`url(#edge${uid})`} />
      {Array.from({ length: 33 }).map((_, i) => (
        <line key={`t${i}`} x1={22 + i * 8} x2={22 + i * 8} y1="24" y2="44" stroke={dark} strokeOpacity="0.12" />
      ))}
      <path d={`${zigzag(400, 1)} L282 378 L18 378 Z`} fill={dark} />
      {Array.from({ length: 33 }).map((_, i) => (
        <line key={`b${i}`} x1={22 + i * 8} x2={22 + i * 8} y1="380" y2="398" stroke="#fff" strokeOpacity="0.12" />
      ))}
    </svg>
  );
}
