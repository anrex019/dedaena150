import { useSyncExternalStore } from 'react';

export interface Letter {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export interface State {
  sfx: boolean;
  music: boolean;
  motion: 'system' | 'reduce' | 'full';
  favorites: string[];
  letters: Letter[];
  levelsCleared: number;
  best: Record<string, number>;
  /** Word ids the player has already opened in the game. */
  seen: string[];
  /** Word ids opened in the dictionary. Each id is stored once. */
  discovered: string[];
  /** Mission ids opened in the future room. */
  futureSeen: string[];
  /** Worlds finished by a real task, not by opening the page. */
  worldsDone: Array<'history' | 'words' | 'future'>;
  /** The secret-door reveal has already played. */
  guardianSeen: boolean;
  /** When the four worlds were first completed. */
  guardianAt: string | null;
}

const KEY = 'dedaena150.v1';

const initial: State = {
  sfx: false,
  music: false,
  motion: 'system',
  favorites: [],
  letters: [],
  levelsCleared: 0,
  best: {},
  seen: [],
  discovered: [],
  futureSeen: [],
  worldsDone: [],
  guardianSeen: false,
  guardianAt: null,
};

function isLetter(value: unknown): value is Letter {
  if (!value || typeof value !== 'object') return false;
  const letter = value as Letter;
  return (
    typeof letter.id === 'string' &&
    typeof letter.name === 'string' &&
    typeof letter.text === 'string' &&
    typeof letter.createdAt === 'string'
  );
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<State>;
    const motion =
      parsed.motion === 'reduce' || parsed.motion === 'full' || parsed.motion === 'system'
        ? parsed.motion
        : 'system';
    const letters = Array.isArray(parsed.letters) ? parsed.letters.filter(isLetter).slice(0, 40) : [];
    const worlds = new Set<'history' | 'words' | 'future'>();
    if (Array.isArray(parsed.worldsDone)) {
      for (const id of parsed.worldsDone) {
        if (id === 'history' || id === 'words' || id === 'future') worlds.add(id);
      }
    }
    if (letters.length > 0) worlds.add('future');
    const best: Record<string, number> = {};
    if (parsed.best && typeof parsed.best === 'object') {
      for (const [id, score] of Object.entries(parsed.best)) {
        if (typeof score === 'number' && Number.isFinite(score)) best[id] = score;
      }
    }
    return {
      sfx: Boolean(parsed.sfx),
      music: Boolean(parsed.music),
      motion,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter((id) => typeof id === 'string') : [],
      letters,
      levelsCleared:
        typeof parsed.levelsCleared === 'number' ? Math.max(0, Math.min(3, Math.floor(parsed.levelsCleared))) : 0,
      best,
      seen: Array.isArray(parsed.seen) ? parsed.seen.filter((id) => typeof id === 'string') : [],
      discovered: Array.isArray(parsed.discovered)
        ? parsed.discovered.filter((id) => typeof id === 'string')
        : [],
      futureSeen: Array.isArray(parsed.futureSeen)
        ? parsed.futureSeen.filter((id) => typeof id === 'string')
        : [],
      worldsDone: [...worlds],
      guardianSeen: parsed.guardianSeen === true,
      guardianAt: typeof parsed.guardianAt === 'string' ? parsed.guardianAt : null,
    };
  } catch {
    return initial;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Storage can be unavailable in private mode. The session still works. */
  }
}

export function getState() {
  return state;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function patch(partial: Partial<State>) {
  state = { ...state, ...partial };
  emit();
}

export function discoverWord(id: string) {
  if (!id || state.discovered.includes(id)) return;
  patch({ discovered: [...state.discovered, id] });
}

export function toggleFavorite(id: string) {
  const favorites = state.favorites.includes(id)
    ? state.favorites.filter((item) => item !== id)
    : [...state.favorites, id];
  patch({ favorites });
}

export function addLetter(name: string, text: string) {
  const clean = text.trim().slice(0, 280);
  if (!clean) return;
  const letter: Letter = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
    name: name.trim().slice(0, 40) || 'სტუმარი',
    text: clean,
    createdAt: new Date().toISOString(),
  };
  patch({ letters: [letter, ...state.letters].slice(0, 40) });
}

export function clearLetters() {
  patch({ letters: [] });
}

export function seeFutureMission(id: string) {
  if (!id || state.futureSeen.includes(id)) return;
  patch({ futureSeen: [...state.futureSeen, id] });
}

/** World 3 reports a cleared level here. The secret door reads levelsCleared >= 3. */
export function noteLevelClear(levelIndex: number, levelId: string, score: number) {
  const cleared = Math.max(state.levelsCleared, Math.min(3, levelIndex + 1));
  const previous = state.best[levelId] ?? 0;
  patch({
    levelsCleared: cleared,
    best: { ...state.best, [levelId]: Math.max(previous, score) },
  });
}

export function completeWorld(id: 'history' | 'words' | 'future') {
  if (state.worldsDone.includes(id)) return;
  patch({ worldsDone: [...state.worldsDone, id] });
}

export function allWorldsComplete(current: State = state) {
  return (
    current.worldsDone.includes('history')
    && current.worldsDone.includes('words')
    && current.levelsCleared >= 3
    && current.worldsDone.includes('future')
  );
}

export function markGuardianSeen() {
  if (state.guardianSeen) return;
  patch({ guardianSeen: true, guardianAt: state.guardianAt ?? new Date().toISOString() });
}

export function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}
