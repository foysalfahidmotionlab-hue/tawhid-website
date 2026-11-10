import { useId } from 'react';

/**
 * Temporary woven rice-sack mockup drawn in SVG.
 * Pass `image` to show a real sack photo instead.
 */
export default function RiceSack({ title = 'Miniket', color = '#1d321a', image = null, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const label = title.toLowerCase().startsWith('rice') ? title : `${title} Rice`;

  if (image) {
    return <img src={image} alt={`${label} sack`} className={`object-contain ${className}`} loading="lazy" />;
  }

  const body = 'M28 34 C 80 24, 160 24, 212 34 C 226 120, 228 220, 218 300 C 160 312, 80 312, 22 300 C 12 220, 14 120, 28 34 Z';
  const serif = { fontFamily: 'Fraunces, Georgia, serif', fontVariationSettings: '"SOFT" 100' };
  const sans = { fontFamily: '"DM Sans", sans-serif' };

  return (
    <svg viewBox="0 0 240 330" className={className} role="img" aria-label={`${label} sack mockup`}>
      <defs>
        <linearGradient id={`sk${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fbf6e9" />
          <stop offset="1" stopColor="#ebdfc2" />
        </linearGradient>
        <linearGradient id={`se${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#6b5530" stopOpacity="0.25" />
          <stop offset="0.15" stopColor="#6b5530" stopOpacity="0" />
          <stop offset="0.85" stopColor="#6b5530" stopOpacity="0" />
          <stop offset="1" stopColor="#6b5530" stopOpacity="0.3" />
        </linearGradient>
        <pattern id={`wv${uid}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M0 2.5 H5 M2.5 0 V5" stroke="#c9b68a" strokeOpacity="0.35" strokeWidth="0.8" />
        </pattern>
        <filter id={`sb${uid}`} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <ellipse cx="120" cy="312" rx="100" ry="10" fill="#0d1a0f" opacity="0.3" filter={`url(#sb${uid})`} />
      <path d={body} fill={`url(#sk${uid})`} />
      <path d={body} fill={`url(#wv${uid})`} />
      <path d="M30 46 C 80 38, 160 38, 210 46" fill="none" stroke="#a8925f" strokeWidth="1.4" strokeDasharray="5 3" />

      {/* paddy plant */}
      <g fill="none" stroke="#7b9a3c" strokeWidth="2.4" strokeLinecap="round">
        <path d="M120 176 C 104 160, 88 152, 70 152" />
        <path d="M120 176 C 136 160, 152 152, 170 152" />
        <path d="M120 176 C 118 136, 108 104, 92 82" />
        <path d="M120 176 C 121 132, 120 100, 120 70" />
        <path d="M120 176 C 122 136, 132 104, 148 82" />
      </g>
      <g fill="#d6ad4f">
        {[
          [92, 82], [98, 92], [104, 102], [120, 70], [120, 82], [120, 94], [148, 82], [142, 92], [136, 102],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="3.2" ry="6.4" transform={`rotate(${x < 120 ? -30 : x > 120 ? 30 : 0} ${x} ${y})`} />
        ))}
      </g>

      {/* logo + name */}
      <circle cx="120" cy="212" r="23" fill="none" stroke={color} strokeWidth="2.2" />
      <text x="120" y="216" textAnchor="middle" fill={color} fontSize="12" fontWeight="800" style={serif}>Zinia</text>
      <text x="120" y="258" textAnchor="middle" fill={color} fontSize="17" fontWeight="700" style={serif}>{label}</text>
      <text x="120" y="275" textAnchor="middle" fill={color} fillOpacity="0.7" fontSize="6.6" fontWeight="700" letterSpacing="2" style={sans}>
        BEST QUALITY RICE
      </text>

      <path d={body} fill={`url(#se${uid})`} />
    </svg>
  );
}
