import React from 'react';

export type GarmentType =
  | 'tshirt'
  | 'jeans'
  | 'jacket'
  | 'dress'
  | 'shoes'
  | 'hat'
  | 'sweater'
  | 'sneakers'
  | 'shorts'
  | 'skirt'
  | 'scarf'
  | 'socks';

interface ClothingSvgProps {
  garment: GarmentType;
  color: string;
  accentColor?: string;
  className?: string;
  title?: string;
}

const OUTLINE = '#1E293B';

export const ClothingSvg: React.FC<ClothingSvgProps> = ({
  garment,
  color,
  accentColor = '#F8FAFC',
  className = 'w-28 h-28',
  title,
}) => {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title || garment}
    >
      {title ? <title>{title}</title> : null}

      {garment === 'tshirt' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M52 28 L30 38 L18 66 L40 76 L46 60 V132 H114 V60 L120 76 L142 66 L130 38 L108 28 C102 38 92 42 80 42 C68 42 58 38 52 28 Z"
            fill={color}
          />
          <path d="M62 30 C67 39 74 42 80 42 C86 42 93 39 98 30" fill="none" />
          <path d="M46 60 V50" opacity="0.35" />
          <path d="M114 60 V50" opacity="0.35" />
        </g>
      )}

      {garment === 'jeans' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M44 24 H116 L124 136 H94 L80 74 L66 136 H36 L44 24 Z"
            fill={color}
          />
          <path d="M44 38 H116" />
          <path d="M80 24 V52" />
          <path d="M50 48 C56 54 62 54 65 44" fill="none" />
          <path d="M110 48 C104 54 98 54 95 44" fill="none" />
          <rect x="74" y="27" width="12" height="8" rx="2" fill={accentColor} strokeWidth="2.5" />
        </g>
      )}

      {garment === 'jacket' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M52 28 L26 42 L18 96 L40 100 L46 64 V134 H114 V64 L120 100 L142 96 L134 42 L108 28 L96 22 H64 L52 28 Z"
            fill={color}
          />
          <path d="M80 42 V134" />
          <path d="M56 26 L70 46 L80 42 L90 46 L104 26" fill={accentColor} />
          <path d="M54 96 H68" />
          <path d="M92 96 H106" />
          <circle cx="72" cy="64" r="3" fill={accentColor} strokeWidth="2" />
          <circle cx="72" cy="82" r="3" fill={accentColor} strokeWidth="2" />
        </g>
      )}

      {garment === 'dress' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M56 24 L46 62 L28 134 H132 L114 62 L104 24 L92 24 C90 36 86 42 80 42 C74 42 70 36 68 24 Z"
            fill={color}
          />
          <path d="M50 66 H110" strokeWidth="3.5" />
          <rect x="52" y="62" width="56" height="8" rx="3" fill={accentColor} strokeWidth="2.5" />
          <path d="M62 90 L56 128" opacity="0.25" />
          <path d="M98 90 L104 128" opacity="0.25" />
        </g>
      )}

      {garment === 'shoes' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          {/* Left shoe */}
          <path
            d="M24 94 L32 64 L58 64 L64 82 C76 84 84 90 84 102 V112 H22 V94 Z"
            fill={color}
          />
          <path d="M22 106 H84" fill="none" />
          <rect x="22" y="106" width="62" height="8" rx="2" fill={accentColor} strokeWidth="3" />
          {/* Right shoe */}
          <path
            d="M78 106 L86 76 L112 76 L118 94 C130 96 138 102 138 114 V124 H76 V106 Z"
            fill={color}
          />
          <rect x="76" y="118" width="62" height="8" rx="2" fill={accentColor} strokeWidth="3" />
        </g>
      )}

      {garment === 'hat' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M40 94 C40 56 56 38 80 38 C104 38 120 56 120 94 Z" fill={color} />
          <path d="M36 94 C54 88 114 88 140 100 C138 112 118 114 96 108 C72 102 48 104 34 102 Z" fill={color} />
          <circle cx="80" cy="34" r="5" fill={accentColor} strokeWidth="3" />
          <path d="M80 38 C76 58 76 74 78 90" opacity="0.3" />
        </g>
      )}

      {garment === 'sweater' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M54 28 L26 44 L16 104 L38 108 L46 66 V132 H114 V66 L122 108 L144 104 L134 44 L106 28 C100 38 90 42 80 42 C70 42 60 38 54 28 Z"
            fill={color}
          />
          <path d="M58 26 C64 38 72 42 80 42 C88 42 96 38 102 26" strokeWidth="6" />
          <rect x="46" y="120" width="68" height="12" rx="2" fill={accentColor} strokeWidth="3" />
          <path d="M60 68 L70 78 L80 68 L90 78 L100 68" stroke={accentColor} strokeWidth="4" />
        </g>
      )}

      {garment === 'sneakers' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M22 100 L30 58 L54 58 L64 78 L112 86 C128 88 138 96 138 110 V116 H22 Z"
            fill={color}
          />
          <path d="M22 114 H138 V126 H22 Z" fill={accentColor} />
          <path d="M68 79 L76 71" stroke={accentColor} strokeWidth="4" />
          <path d="M80 81 L88 73" stroke={accentColor} strokeWidth="4" />
          <path d="M92 83 L100 76" stroke={accentColor} strokeWidth="4" />
          <path d="M36 96 C48 84 62 84 74 96" stroke={accentColor} strokeWidth="4" />
        </g>
      )}

      {garment === 'shorts' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M38 36 H122 L130 112 H90 L80 78 L70 112 H30 L38 36 Z"
            fill={color}
          />
          <rect x="38" y="36" width="84" height="14" rx="2" fill={accentColor} strokeWidth="3.5" />
          <path d="M80 50 V78" />
          <path d="M76 50 L72 62" strokeWidth="3" />
          <path d="M84 50 L88 62" strokeWidth="3" />
        </g>
      )}

      {garment === 'skirt' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M48 34 H112 L134 126 H26 L48 34 Z" fill={color} />
          <rect x="48" y="34" width="64" height="14" rx="2" fill={accentColor} strokeWidth="3.5" />
          <path d="M66 52 L58 124" opacity="0.35" />
          <path d="M80 52 V124" opacity="0.35" />
          <path d="M94 52 L102 124" opacity="0.35" />
        </g>
      )}

      {garment === 'scarf' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M46 42 C46 32 114 32 114 42 V66 C114 76 46 76 46 66 Z" fill={color} />
          <path d="M52 68 V128 H76 V70" fill={color} />
          <path d="M84 68 V116 H108 V66" fill={color} />
          <path d="M52 104 H76" stroke={accentColor} strokeWidth="5" />
          <path d="M84 94 H108" stroke={accentColor} strokeWidth="5" />
          <path d="M56 128 V138 M64 128 V138 M72 128 V138" />
          <path d="M88 116 V126 M96 116 V126 M104 116 V126" />
        </g>
      )}

      {garment === 'socks' && (
        <g stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          {/* Left sock */}
          <path
            d="M36 28 H62 V88 L82 106 C88 112 84 124 74 124 H42 C34 124 32 116 32 108 V28 Z"
            fill={color}
          />
          <rect x="34" y="28" width="28" height="14" fill={accentColor} strokeWidth="3" />
          {/* Right sock */}
          <path
            d="M84 36 H110 V96 L130 114 C136 120 132 132 122 132 H90 C82 132 80 124 80 116 V36 Z"
            fill={color}
          />
          <rect x="82" y="36" width="28" height="14" fill={accentColor} strokeWidth="3" />
        </g>
      )}
    </svg>
  );
};
