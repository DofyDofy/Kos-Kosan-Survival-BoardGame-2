import React from 'react';
import { PawnStyleConfig } from '../constants';

interface SvgPawnProps {
  config: PawnStyleConfig;
  isActive: boolean;
  isFinished: boolean;
  isMoving: boolean;
  className?: string;
}

/**
 * Komponen Bidak / Pion Klasik Board Game berbasis SVG Murni.
 * - Desain proporsional, ramping dan elegan.
 * - Kepala bulat dengan kilau highlight.
 * - Leher cincin bertingkat dan badan melengkung khas pion kayu/plastik modern.
 * - Penanda angka 1-5 di tengah badan untuk aksesibilitas kontras tinggi.
 * - Bayangan lembut di bawah dasar agar tampak berdiri di atas petak.
 */
export const SvgPawn: React.FC<SvgPawnProps> = ({
  config,
  isActive,
  isFinished,
  className = '',
}) => {
  const gradientId = `pawn-grad-${config.markerNumber}`;
  const headGradId = `pawn-head-${config.markerNumber}`;
  const ringGradId = `pawn-ring-${config.markerNumber}`;
  const filterId = `pawn-shadow-${config.markerNumber}`;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 44 60"
        className="w-full h-auto overflow-visible drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient Badan Bidak */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.gradientTop} />
            <stop offset="45%" stopColor={config.primaryColor} />
            <stop offset="100%" stopColor={config.gradientBottom} />
          </linearGradient>

          {/* Gradient Kepala Bola Bulat */}
          <radialGradient id={headGradId} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="25%" stopColor={config.gradientTop} />
            <stop offset="70%" stopColor={config.primaryColor} />
            <stop offset="100%" stopColor={config.gradientBottom} />
          </radialGradient>

          {/* Gradient Cincin Leher */}
          <linearGradient id={ringGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.gradientTop} />
            <stop offset="50%" stopColor={config.primaryColor} />
            <stop offset="100%" stopColor={config.gradientBottom} />
          </linearGradient>

          {/* Filter Bayangan Halus di Bawah Bidak */}
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="0" dy="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Bayangan Alas (Contact Shadow) */}
        <ellipse
          cx="22"
          cy="55"
          rx="15"
          ry="4"
          fill="rgba(0, 0, 0, 0.35)"
        />

        {/* Lapisan Utama Bidak */}
        <g filter={`url(#${filterId})`}>
          {/* 2. Piringan Alas Paling Bawah (Base Skirt / Rim) */}
          <ellipse
            cx="22"
            cy="53"
            rx="14"
            ry="4.2"
            fill={`url(#${gradientId})`}
            stroke="#ffffff"
            strokeWidth="0.9"
          />

          {/* 3. Tingkatan Tengah Alas */}
          <path
            d="M 10 52 C 10 49, 13 47, 22 47 C 31 47, 34 49, 34 52 Z"
            fill={config.gradientBottom}
            opacity="0.3"
          />

          {/* 4. Badan Kerucut Melengkung (Bell / Body) */}
          <path
            d="M 17 25 
               C 17 28, 11 43, 8 49 
               C 8 52, 36 52, 36 49 
               C 33 43, 27 28, 27 25 
               Z"
            fill={`url(#${gradientId})`}
            stroke="#ffffff"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />

          {/* Kilau Halus Sisi Kiri Badan */}
          <path
            d="M 18 26 C 18 30, 13 42, 11 48 C 13 48, 17 38, 19 32 Z"
            fill="#ffffff"
            opacity="0.4"
          />

          {/* 5. Cincin Leher (Neck Collar) */}
          <ellipse
            cx="22"
            cy="24"
            rx="6.5"
            ry="2.2"
            fill={`url(#${ringGradId})`}
            stroke="#ffffff"
            strokeWidth="0.8"
          />

          {/* 6. Kepala Bulat Pion (Head Ball) */}
          <circle
            cx="22"
            cy="13"
            r="8.5"
            fill={`url(#${headGradId})`}
            stroke="#ffffff"
            strokeWidth="0.9"
          />

          {/* Kilau Titik Cahaya di Kepala */}
          <ellipse
            cx="19.5"
            cy="10.5"
            rx="2.8"
            ry="1.8"
            transform="rotate(-25 19.5 10.5)"
            fill="#ffffff"
            opacity="0.75"
          />

          {/* 7. Penanda Angka Unik di Tengah Badan (Aksesibilitas Kontras Tinggi) */}
          <circle
            cx="22"
            cy="37"
            r="4.8"
            fill="#ffffff"
            stroke={config.primaryColor}
            strokeWidth="1.2"
            opacity="0.95"
          />
          <text
            x="22"
            y="40.2"
            textAnchor="middle"
            fill={config.textColor === '#ffffff' ? config.primaryColor : '#1c1917'}
            fontSize="7"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {config.markerNumber}
          </text>
        </g>
      </svg>

      {/* Indikator Centang Kecil untuk Pemain yang Sudah Selesai */}
      {isFinished && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white z-20"
          title="Selesai"
        >
          <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Efek Kilau / Cahaya di Bawah Kaki Pion Saat Giliran Aktif */}
      {isActive && (
        <div
          style={{ backgroundColor: config.primaryColor }}
          className="absolute -bottom-1.5 w-6 h-2 rounded-full opacity-70 blur-[3px] animate-pulse"
        />
      )}
    </div>
  );
};
