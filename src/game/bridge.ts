export interface QuestionView {
  prompt: string;
  options: string[];
}

export interface Hud {
  levelTitle: string;
  collected: number;
  total: number;
  lives: number;
  score: number;
  paused: boolean;
  wordId: string | null;
  hint: string | null;
  question: QuestionView | null;
  status: 'play' | 'win' | 'lose';
  words: string[];
  stars: number;
  secrets: number;
  secretTotal: number;
  /** First time this word is found, the card stays until the player continues. */
  freshWord: boolean;
}

export function blankHud(): Hud {
  return {
    levelTitle: '',
    collected: 0,
    total: 0,
    lives: 3,
    score: 0,
    paused: false,
    wordId: null,
    hint: null,
    question: null,
    status: 'play',
    words: [],
    stars: 0,
    secrets: 0,
    secretTotal: 0,
    freshWord: false,
  };
}

export class GameBridge {
  private hud: Hud = blankHud();
  private listeners = new Set<() => void>();
  private paused = false;
  /** Holds the world still behind the start card. */
  private suspended = true;
  touch = { left: false, right: false, jump: false };
  onChoose: ((index: number) => void) | null = null;
  onRestart: (() => void) | null = null;
  onDismiss: (() => void) | null = null;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getHud = () => this.hud;

  emit(partial: Partial<Hud>) {
    this.hud = { ...this.hud, ...partial, paused: partial.paused ?? this.paused };
    this.listeners.forEach((listener) => listener());
  }

  reset(levelTitle: string, total: number) {
    this.paused = false;
    this.touch = { left: false, right: false, jump: false };
    this.onChoose = null;
    this.onRestart = null;
    this.onDismiss = null;
    this.hud = { ...blankHud(), levelTitle, total, paused: this.suspended };
    this.listeners.forEach((listener) => listener());
  }

  isPaused() {
    return this.paused || this.suspended;
  }

  setSuspend(on: boolean) {
    this.suspended = on;
    if (!on) this.paused = false;
    this.emit({ paused: this.isPaused() });
  }

  togglePause() {
    this.paused = !this.paused;
    this.emit({ paused: this.paused });
  }

  setTouch(partial: Partial<GameBridge['touch']>) {
    Object.assign(this.touch, partial);
  }

  choose(index: number) {
    this.onChoose?.(index);
  }

  dismissWord() {
    this.emit({ wordId: null, freshWord: false });
    this.onDismiss?.();
  }

  restart() {
    this.onRestart?.();
  }
}
