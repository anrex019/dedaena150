/** Visitor-facing door titles. Keep these four strings unchanged. */
import type { Room } from '../lib/route';

export interface DoorInfo {
  id: Exclude<Room, 'home'>;
  title: string;
  numeral: string;
}

export const doors: DoorInfo[] = [
  { id: 'history', title: 'იაკობ გოგებაშვილის სამყარო', numeral: 'I' },
  { id: 'words', title: 'ქართული სიტყვების საგანძური', numeral: 'II' },
  { id: 'game', title: 'ითამაშე ქართულად', numeral: 'III' },
  { id: 'future', title: 'ქართული ენა მომავალში', numeral: 'IV' },
];
