import type { ArtId } from './words';

/** y is the walking surface. Thickness grows downward from y. */
export interface Platform {
  x: number;
  y: number;
  w: number;
  /** Oscillates around the starting position. Distance is the amplitude in pixels. */
  move?: { axis: 'x' | 'y'; distance: number; period: number };
}

export interface LevelItem {
  id: string;
  art: ArtId;
  x: number;
  platform: number;
  /** Bonus words are not required to open the portal. */
  bonus?: boolean;
  /** Optional find. Always bonus, and shown separately on the result. */
  secret?: boolean;
}

export interface LevelSpot {
  x: number;
  platform: number;
  question?: LevelQuestion;
}

/** A crystal the player can touch. It tosses them upward and does not take a life. */
export interface Hazard {
  x: number;
  y: number;
  w: number;
}

export interface LevelQuestion {
  prompt: string;
  options: string[];
  /** Index into options. Kept in the scene, not rendered as the answer. */
  answer: number;
}

export type LevelTheme = 'forest' | 'cave' | 'temple';

export interface LevelData {
  id: string;
  title: string;
  summary: string;
  theme: LevelTheme;
  difficulty: string;
  width: number;
  spawn: LevelSpot;
  platforms: Platform[];
  items: LevelItem[];
  checkpoints: LevelSpot[];
  goal: LevelSpot;
  question?: LevelQuestion;
  hazards?: Hazard[];
}

export function requiredItems(level: LevelData) {
  return level.items.filter((item) => !item.bonus);
}

export const levels: LevelData[] = [
  {
    id: 'first-words',
    title: 'იების მინდორი',
    summary: 'მზიანი ტყე. შეაგროვე სიტყვები, გადაინაცვლე ნაზ საფეხურზე და მოძებნე დამალული ყვავილი.',
    theme: 'forest',
    difficulty: 'ადვილი',
    width: 4920,
    spawn: { x: 280, platform: 0 },
    platforms: [
      { x: 180, y: 468, w: 500 },
      { x: 760, y: 468, w: 280 },
      { x: 1140, y: 400, w: 260 },
      { x: 1500, y: 468, w: 280 },
      { x: 20, y: 368, w: 130 },
      { x: 1880, y: 468, w: 220 },
      { x: 2140, y: 468, w: 500 },
      { x: 2700, y: 400, w: 240 },
      { x: 3040, y: 320, w: 170 },
      { x: 3040, y: 468, w: 280 },
      { x: 3440, y: 468, w: 280 },
      { x: 3820, y: 408, w: 240 },
      { x: 4160, y: 468, w: 700 },
    ],
    items: [
      { id: 'ia', art: 'violet', x: 880, platform: 1 },
      { id: 'mze', art: 'sun', x: 1260, platform: 2 },
      { id: 'xe', art: 'tree', x: 1620, platform: 3 },
      { id: 'aso', art: 'letter', x: 80, platform: 4, bonus: true, secret: true },
      { id: 'chiti', art: 'bird', x: 2420, platform: 6 },
      { id: 'fotoli', art: 'leaf', x: 2800, platform: 7 },
      { id: 'qvavili', art: 'flower', x: 3120, platform: 8, bonus: true, secret: true },
      { id: 'dila', art: 'morning', x: 3920, platform: 11 },
    ],
    checkpoints: [
      { x: 1620, platform: 3 },
      {
        x: 4040,
        platform: 11,
        question: {
          prompt: 'რომელი ასო აკლია სიტყვას „ი_“?',
          options: ['ა', 'მ', 'ბ'],
          answer: 0,
        },
      },
    ],
    goal: { x: 4620, platform: 12 },
    question: {
      prompt: 'რომელი ასოები ქმნის სიტყვას „ია“?',
      options: ['მ + ზ + ე', 'ი + ა', 'ც + ა'],
      answer: 1,
    },
  },
  {
    id: 'word-path',
    title: 'სიტყვების გამოქვაბული',
    summary: 'გამოქვაბული, მოძრავი საფეხურები და კრისტალები. კრისტალი ზემოთ გაგაგდებს.',
    theme: 'cave',
    difficulty: 'საშუალო',
    width: 4860,
    spawn: { x: 240, platform: 0 },
    platforms: [
      { x: 160, y: 480, w: 300 },
      { x: 540, y: 480, w: 280 },
      { x: 940, y: 410, w: 210 },
      { x: 1260, y: 480, w: 200, move: { axis: 'x', distance: 90, period: 4000 } },
      { x: 1580, y: 480, w: 340 },
      { x: 2040, y: 410, w: 210 },
      { x: 2360, y: 480, w: 240 },
      { x: 2700, y: 400, w: 220 },
      { x: 3020, y: 470, w: 180, move: { axis: 'y', distance: 28, period: 3000 } },
      { x: 3300, y: 420, w: 240 },
      { x: 3640, y: 480, w: 260 },
      { x: 20, y: 380, w: 120 },
      { x: 4000, y: 480, w: 800 },
    ],
    items: [
      { id: 'wigni', art: 'book', x: 660, platform: 1 },
      { id: 'varskvlavi', art: 'star', x: 1040, platform: 2 },
      { id: 'sitqva', art: 'word', x: 1720, platform: 4 },
      { id: 'aso', art: 'letter', x: 2460, platform: 6 },
      { id: 'ena', art: 'scroll', x: 3400, platform: 9 },
      { id: 'leqsi', art: 'quill', x: 80, platform: 11, bonus: true, secret: true },
    ],
    checkpoints: [
      { x: 1720, platform: 4 },
      {
        x: 3760,
        platform: 10,
        question: {
          prompt: 'აირჩიე სწორი სიტყვა. შეკრულ ფურცლებს, რომლებსაც ვკითხულობთ, რა ჰქვია?',
          options: ['წიგნი', 'ქვა', 'ღრუბელი'],
          answer: 0,
        },
      },
    ],
    goal: { x: 4580, platform: 12 },
    hazards: [{ x: 1460, y: 548, w: 100 }],
    question: {
      prompt: 'რომელია ყვავილის სახელი?',
      options: ['მთა', 'ია', 'წიგნი'],
      answer: 1,
    },
  },
  {
    id: 'treasure',
    title: 'დედაენის ტაძარი',
    summary: 'საფეხურები, მცურავი წიგნი და ასოების შეკითხვა. ზემოთ დამალული წიგნიც დევს.',
    theme: 'temple',
    difficulty: 'რთული',
    width: 4680,
    spawn: { x: 120, platform: 0 },
    platforms: [
      { x: 0, y: 480, w: 360 },
      { x: 470, y: 420, w: 190 },
      { x: 760, y: 360, w: 180 },
      { x: 1040, y: 480, w: 230 },
      { x: 1380, y: 420, w: 180 },
      { x: 1660, y: 360, w: 170 },
      { x: 1940, y: 300, w: 160 },
      { x: 2200, y: 360, w: 180 },
      { x: 2480, y: 480, w: 280 },
      { x: 2860, y: 430, w: 180, move: { axis: 'y', distance: 32, period: 2800 } },
      { x: 3180, y: 480, w: 230 },
      { x: 3520, y: 410, w: 200 },
      { x: 3840, y: 330, w: 150 },
      { x: 3840, y: 480, w: 760 },
    ],
    items: [
      { id: 'deda', art: 'mother', x: 560, platform: 1 },
      { id: 'samshoblo', art: 'homeland', x: 840, platform: 2 },
      { id: 'kitxva', art: 'reading', x: 1460, platform: 4 },
      { id: 'guli', art: 'heart', x: 2280, platform: 7 },
      { id: 'dedaena', art: 'book', x: 3280, platform: 10 },
      { id: 'kari', art: 'door', x: 3600, platform: 11 },
      { id: 'wigni', art: 'book', x: 3900, platform: 12, bonus: true, secret: true },
    ],
    checkpoints: [
      { x: 1140, platform: 3 },
      {
        x: 2600,
        platform: 8,
        question: {
          prompt: 'შეაერთე ასოები. რომელია „დ + ე + დ + ა“?',
          options: ['დედა', 'მამა', 'სახლი'],
          answer: 0,
        },
      },
    ],
    goal: { x: 4380, platform: 13 },
    hazards: [{ x: 3080, y: 548, w: 90 }],
    question: {
      prompt: 'რომელი სიტყვა ნიშნავს მშობლიურ ენას?',
      options: ['დედაენა', 'კარი', 'ღამე'],
      answer: 0,
    },
  },
];
