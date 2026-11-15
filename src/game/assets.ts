import type { ArtId } from '../data/words';

/**
 * Painted files in public/art/game.
 * These are original storybook illustrations made for this project.
 * They follow the homepage's palette, but they are not crops of the reference board.
 * Replace a file in place to swap art without changing the scene code.
 */
export const gameFiles = {
  'hero-idle': 'student-idle.svg',
  'hero-run1': 'student-run1.svg',
  'hero-run2': 'student-run2.svg',
  'hero-jump': 'student-jump.svg',
  'hero-fall': 'student-fall.svg',
  'hero-land': 'student-land.svg',
  'hero-win': 'student-win.svg',
  'bg-forest': 'bg-forest.jpg',
  'bg-cave': 'bg-cave.jpg',
  'bg-temple': 'bg-temple.jpg',
  'platform-grass': 'platform-grass.png',
  'item-violet': 'item-violet.png',
  'item-book': 'item-book.png',
  'item-crystal': 'item-crystal.png',
  'item-sun': 'item-sun.png',
  'prop-lantern': 'prop-lantern.png',
  portal: 'portal.png',
} as const;

export type GameTexture = keyof typeof gameFiles;

/** The collect pose briefly uses the student's reaching/jumping silhouette. */
export const collectTexture: GameTexture = 'hero-jump';

export function textureForArt(art: ArtId): GameTexture {
  if (art === 'violet' || art === 'flower' || art === 'leaf') return 'item-violet';
  if (art === 'sun' || art === 'sky' || art === 'star' || art === 'light' || art === 'morning') return 'item-sun';
  if (art === 'book' || art === 'scroll' || art === 'letter' || art === 'word' || art === 'reading' || art === 'quill' || art === 'school') return 'item-book';
  return 'item-crystal';
}

export function artUrl(art: ArtId) {
  return `${import.meta.env.BASE_URL}art/game/${gameFiles[textureForArt(art)]}`;
}
