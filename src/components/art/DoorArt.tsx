import type { DoorInfo } from '../../data/doors';

export function DoorArt({ id }: { id: DoorInfo['id'] }) {
  if (id === 'history') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="46" r="22" fill="#f0c3a0" />
        <path d="M40 42c2-16 38-16 40 0-6 4-34 4-40 0z" fill="#3a2a22" />
        <path d="M48 58c6 8 18 8 24 0" fill="none" stroke="#3a2a22" strokeWidth="2" />
        <path d="M28 112c4-28 18-40 32-40s28 12 32 40" fill="#4a342c" />
        <path d="M46 78h28v10H46z" fill="#f4e7c8" />
        <path d="M38 112c8-16 36-16 44 0" fill="#6a4630" />
      </svg>
    );
  }
  if (id === 'words') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <path d="M18 28h36c8 8 8 48 0 60H18z" fill="#f6e7c4" />
        <path d="M102 28H66c-8 8-8 48 0 60h36z" fill="#fff8ea" />
        <path d="M60 30v58" stroke="#8c3d32" strokeWidth="3" />
        <text x="36" y="58" textAnchor="middle" fontSize="18" fill="#8c3d32" fontFamily="Noto Serif Georgian, serif">ა</text>
        <text x="84" y="58" textAnchor="middle" fontSize="18" fill="#3d6b4a" fontFamily="Noto Serif Georgian, serif">ბ</text>
        <text x="60" y="104" textAnchor="middle" fontSize="16" fill="#e7c27a" fontFamily="Noto Serif Georgian, serif">გ</text>
      </svg>
    );
  }
  if (id === 'game') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <rect x="18" y="40" width="84" height="46" rx="18" fill="#163a78" stroke="#9fd4ff" strokeWidth="3" />
        <circle cx="78" cy="56" r="5" fill="#9fd4ff" />
        <circle cx="92" cy="68" r="5" fill="#9fd4ff" />
        <path d="M34 63h16M42 55v16" stroke="#d7f4ff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="86" cy="28" r="3" fill="#fff6d0" />
      <circle cx="28" cy="24" r="2" fill="#fff6d0" />
      <circle cx="98" cy="48" r="2" fill="#fff6d0" />
      <path d="M24 86c18-28 36-28 48-6" fill="none" stroke="#d7c4ff" strokeWidth="4" />
      <rect x="58" y="46" width="28" height="10" rx="4" fill="#c9b6ff" transform="rotate(-28 72 51)" />
      <circle cx="48" cy="74" r="10" fill="none" stroke="#f0d7a4" strokeWidth="3" />
      <path d="M22 96h76" stroke="#e7c27a" strokeWidth="3" />
      <path d="M34 96 V78h10v18M58 96V70h16v26M86 96V82h8v14" fill="#d9c8ff" opacity="0.85" />
    </svg>
  );
}
