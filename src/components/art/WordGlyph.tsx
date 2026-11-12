import type { ReactNode } from 'react';
import type { ArtId } from '../../data/words';

function Disc({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="36" fill="#fff6e4" />
      <circle cx="40" cy="40" r="36" fill="none" stroke="#e7c27a" strokeWidth="2" />
      {children}
    </svg>
  );
}

function Person({ x, y, shirt, scale = 1 }: { x: number; y: number; shirt: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="10" rx="9" ry="12" fill={shirt} />
      <circle cx="0" cy="-6" r="7" fill="#f0c3a0" />
      <path d="M-7 -6a7 7 0 0 1 14 0c-2 3-12 3-14 0z" fill="#5a3824" />
    </g>
  );
}

export function WordGlyph({ art }: { art: ArtId }) {
  const body = (() => {
    switch (art) {
      case 'violet':
        return (
          <g>
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse key={deg} cx="40" cy="22" rx="6" ry="10" fill={deg % 144 === 0 ? '#8d4fd0' : '#c48ae4'} transform={`rotate(${deg} 40 40)`} />
            ))}
            <circle cx="40" cy="40" r="5" fill="#f4d56a" />
          </g>
        );
      case 'finger':
        return (
          <g fill="#f0c3a0" stroke="#c48b6a">
            <rect x="34" y="16" width="12" height="32" rx="6" />
            <ellipse cx="40" cy="52" rx="16" ry="9" />
          </g>
        );
      case 'mountain':
        return (
          <g>
            <path d="M10 62 L28 24 L44 62Z" fill="#6e8cab" />
            <path d="M30 62 L48 28 L68 62Z" fill="#4f6f90" />
            <path d="M28 24 L34 36 L22 36Z" fill="#f7fbff" />
          </g>
        );
      case 'sun':
        return (
          <g>
            {Array.from({ length: 10 }, (_, i) => (
              <line key={i} x1="40" y1="40" x2={40 + Math.cos((i / 10) * Math.PI * 2) * 24} y2={40 + Math.sin((i / 10) * Math.PI * 2) * 24} stroke="#f0b429" strokeWidth="3" strokeLinecap="round" />
            ))}
            <circle cx="40" cy="40" r="10" fill="#ffd35a" />
          </g>
        );
      case 'book':
      case 'reading':
        return (
          <g>
            <rect x="16" y="22" width="48" height="36" rx="3" fill="#8c3d32" />
            <rect x="20" y="26" width="18" height="28" fill="#f6e7c4" />
            <rect x="42" y="26" width="18" height="28" fill="#fff8ea" />
          </g>
        );
      case 'scroll':
        return (
          <g>
            <rect x="18" y="22" width="44" height="36" rx="6" fill="#f3ddb0" />
            <rect x="18" y="22" width="44" height="7" rx="3" fill="#c49a55" />
            <rect x="18" y="51" width="44" height="7" rx="3" fill="#c49a55" />
            <path d="M26 36h22M26 42h16" stroke="#8a6230" strokeWidth="2" />
          </g>
        );
      case 'mother':
        return (
          <g>
            <Person x={30} y={42} shirt="#c45b78" scale={1.15} />
            <Person x={52} y={48} shirt="#f0d7a4" scale={0.8} />
          </g>
        );
      case 'father':
        return <Person x={40} y={44} shirt="#3d6b8a" scale={1.3} />;
      case 'house':
        return (
          <g>
            <path d="M14 38 L40 16 L66 38Z" fill="#a33b32" />
            <rect x="20" y="38" width="40" height="26" fill="#d7b48a" />
            <rect x="36" y="48" width="10" height="16" fill="#6a4630" />
          </g>
        );
      case 'water':
        return <path d="M40 12 C58 32 56 58 40 66 C24 58 22 32 40 12Z" fill="#3aa0d8" />;
      case 'sky':
        return (
          <g>
            <circle cx="40" cy="40" r="24" fill="#8ec4f2" />
            <path d="M22 36 L30 30 L38 36 M42 46 L50 40 L58 46" fill="none" stroke="#355a86" strokeWidth="2" />
          </g>
        );
      case 'star':
        return <polygon points="40,14 46,32 66,32 50,44 56,62 40,50 24,62 30,44 14,32 34,32" fill="#ffe08a" />;
      case 'moon':
        return (
          <g>
            <circle cx="36" cy="40" r="18" fill="#f4e7b0" />
            <circle cx="48" cy="34" r="14" fill="#fff6e4" />
          </g>
        );
      case 'flower':
        return (
          <g fill="#f2d35a">
            {Array.from({ length: 8 }, (_, i) => (
              <circle key={i} cx={40 + Math.cos((i / 8) * Math.PI * 2) * 12} cy={40 + Math.sin((i / 8) * Math.PI * 2) * 12} r="7" />
            ))}
            <circle cx="40" cy="40" r="6" fill="#e07a32" />
          </g>
        );
      case 'tree':
        return (
          <g>
            <rect x="36" y="44" width="8" height="18" fill="#6a4630" />
            <circle cx="40" cy="36" r="18" fill="#3f8a48" />
          </g>
        );
      case 'leaf':
        return <ellipse cx="40" cy="40" rx="14" ry="24" fill="#3f9a4a" transform="rotate(-30 40 40)" />;
      case 'bird':
        return (
          <g fill="#355a86">
            <ellipse cx="44" cy="44" rx="14" ry="9" />
            <path d="M16 42 Q30 22 50 38 Q36 36 16 42Z" />
          </g>
        );
      case 'river':
        return <path d="M10 30c12-8 24 8 36 0s24 8 24 0M10 42c12-8 24 8 36 0s24 8 24 0M10 54c12-8 24 8 36 0s24 8 24 0" fill="none" stroke="#3aa0d8" strokeWidth="4" strokeLinecap="round" />;
      case 'school':
        return (
          <g>
            <rect x="12" y="28" width="56" height="8" fill="#8c3d32" />
            <rect x="14" y="36" width="52" height="28" fill="#d7c4a2" />
            <rect x="22" y="44" width="10" height="10" fill="#7eb6ef" />
            <rect x="48" y="44" width="10" height="10" fill="#7eb6ef" />
            <rect x="35" y="48" width="10" height="16" fill="#6a4630" />
          </g>
        );
      case 'teacher':
        return (
          <g>
            <Person x={28} y={48} shirt="#3d6b8a" />
            <rect x="46" y="24" width="22" height="20" rx="2" fill="#f6e7c4" stroke="#8a6230" />
            <text x="57" y="39" textAnchor="middle" fontSize="14" fill="#3a2a1c" fontFamily="Noto Serif Georgian, serif">ა</text>
          </g>
        );
      case 'pupil':
        return (
          <g>
            <Person x={30} y={48} shirt="#c45b4a" />
            <rect x="48" y="46" width="16" height="12" rx="2" fill="#8c3d32" />
            <rect x="50" y="48" width="12" height="8" fill="#f6e7c4" />
          </g>
        );
      case 'letter':
        return <text x="40" y="52" textAnchor="middle" fontSize="36" fill="#8c3d32" fontFamily="Noto Serif Georgian, serif">ა</text>;
      case 'word':
        return <text x="40" y="48" textAnchor="middle" fontSize="20" fill="#3a2a1c" fontFamily="Noto Serif Georgian, serif">ა ბ გ</text>;
      case 'quill':
        return <path d="M18 64 Q34 36 62 14" fill="none" stroke="#8a6230" strokeWidth="3" />;
      case 'heart':
        return <path d="M40 62 C16 44 18 24 40 32 C62 24 64 44 40 62Z" fill="#c43b4a" />;
      case 'hand':
        return (
          <g fill="#f0c3a0">
            <rect x="26" y="34" width="28" height="24" rx="8" />
            <rect x="24" y="16" width="6" height="24" rx="3" />
            <rect x="32" y="12" width="6" height="26" rx="3" />
            <rect x="40" y="16" width="6" height="22" rx="3" />
            <rect x="48" y="20" width="6" height="18" rx="3" />
          </g>
        );
      case 'eye':
        return (
          <g>
            <ellipse cx="40" cy="40" rx="24" ry="14" fill="#f7fbff" stroke="#3a2a1c" />
            <circle cx="40" cy="40" r="7" fill="#3d6b8a" />
            <circle cx="40" cy="40" r="3" fill="#1a1a1a" />
          </g>
        );
      case 'bread':
        return <ellipse cx="40" cy="44" rx="24" ry="14" fill="#e0a15a" />;
      case 'friends':
        return (
          <g>
            <Person x={28} y={46} shirt="#3d6b8a" />
            <Person x={52} y={46} shirt="#c45b4a" />
          </g>
        );
      case 'homeland':
        return (
          <g>
            <circle cx="58" cy="20" r="7" fill="#ffd35a" />
            <path d="M8 62 L26 34 L40 62Z" fill="#4f8a56" />
            <path d="M32 62 L50 28 L70 62Z" fill="#3e6f8a" />
          </g>
        );
      case 'flag':
        return (
          <g>
            <rect x="22" y="16" width="42" height="28" fill="#f7fbff" />
            <rect x="40" y="16" width="6" height="28" fill="#c43b4a" />
            <rect x="22" y="27" width="42" height="6" fill="#c43b4a" />
            <path d="M29 20h6M31 18v6M51 20h6M53 18v6M29 38h6M31 36v6M51 38h6M53 36v6" stroke="#c43b4a" strokeWidth="1.4" />
            <rect x="18" y="14" width="4" height="50" fill="#6a4630" />
          </g>
        );
      case 'stone':
        return <ellipse cx="40" cy="44" rx="22" ry="14" fill="#8d8478" />;
      case 'door':
        return (
          <g>
            <rect x="26" y="14" width="28" height="50" rx="14" fill="#8c4b32" stroke="#e7c27a" strokeWidth="3" />
            <circle cx="46" cy="42" r="3" fill="#e7c27a" />
          </g>
        );
      case 'light':
        return (
          <g>
            <circle cx="40" cy="42" r="16" fill="#f0d7a4" opacity="0.45" />
            <circle cx="40" cy="42" r="8" fill="#e7c27a" />
            <path d="M40 14v16" stroke="#6a4630" strokeWidth="3" />
          </g>
        );
      case 'night':
        return (
          <g>
            <circle cx="40" cy="40" r="24" fill="#1d2448" />
            <circle cx="34" cy="38" r="8" fill="#f4e7b0" />
            <circle cx="52" cy="26" r="2" fill="#fff6d8" />
            <circle cx="54" cy="48" r="1.6" fill="#fff6d8" />
          </g>
        );
      case 'morning':
        return (
          <g>
            <path d="M16 48a24 24 0 0 1 48 0Z" fill="#ffd35a" />
            <ellipse cx="40" cy="52" rx="26" ry="10" fill="#4f8a56" />
          </g>
        );
      case 'cloud':
        return (
          <g fill="#d7e7f7">
            <circle cx="30" cy="44" r="12" />
            <circle cx="44" cy="38" r="14" />
            <circle cx="56" cy="46" r="10" />
          </g>
        );
      default: {
        const leftover: never = art;
        return leftover;
      }
    }
  })();

  return <Disc>{body}</Disc>;
}
