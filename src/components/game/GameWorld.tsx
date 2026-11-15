import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { levels } from '../../data/levels';
import { lettersOf, wordById } from '../../data/words';
import { artUrl } from '../../game/assets';
import { GameBridge } from '../../game/bridge';
import { go } from '../../lib/route';
import { useStore } from '../../lib/store';
import { sound } from '../../lib/sound';
import { RoomShell } from '../RoomShell';
import styles from './GameWorld.module.scss';

const GameStage = lazy(() => import('../../game/GameStage'));

const covers = ['bg-forest.jpg', 'bg-cave.jpg', 'bg-temple.jpg'];
const marks = ['I', 'II', 'III'];

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', notify);
      return () => media.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

interface Props { reduced: boolean; }

function Heart({ full }: { full: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={full ? styles.heartOn : styles.heartOff}>
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
    </svg>
  );
}

function Spell({ word }: { word: string }) {
  const parts = lettersOf(word);
  if (parts.length < 2) return null;
  return (
    <p className={styles.spell}>
      {parts.map((letter, index) => (
        <span key={`${letter}-${index}`} style={{ animationDelay: `${index * 70}ms` }}>{letter}</span>
      ))}
      <span>= {word}</span>
    </p>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars} aria-label={`${count} ვარსკვლავი 3-დან`}>
      {[0, 1, 2].map((index) => (
        <svg key={index} viewBox="0 0 24 24" className={index < count ? styles.starOn : styles.starOff} aria-hidden="true">
          <path d="M12 3.2 14.7 9l6.3.6-4.8 4.1 1.5 6.1L12 16.8 6.3 19.8 7.8 13.7 3 9.6 9.3 9z" />
        </svg>
      ))}
    </span>
  );
}

export function GameWorld({ reduced }: Props) {
  const store = useStore();
  const narrow = useMedia('(max-width: 860px)');
  const portrait = useMedia('(max-width: 860px) and (orientation: portrait)');
  const bridgeRef = useRef<GameBridge | null>(null);
  if (!bridgeRef.current) bridgeRef.current = new GameBridge();
  const bridge = bridgeRef.current;
  const hud = useSyncExternalStore(bridge.subscribe, bridge.getHud, bridge.getHud);
  const [levelIndex, setLevelIndex] = useState(0);
  const [mode, setMode] = useState<'select' | 'play'>('select');
  const active = levels[levelIndex];
  const found = hud.wordId ? wordById(hud.wordId) : undefined;
  const playing = mode === 'play';

  useEffect(() => {
    document.documentElement.dataset.play = playing ? 'game' : '';
    return () => {
      delete document.documentElement.dataset.play;
    };
  }, [playing]);

  function begin(index: number) {
    setLevelIndex(index);
    bridge.setSuspend(false);
    setMode('play');
  }

  function leave() {
    bridge.setSuspend(true);
    bridge.setTouch({ left: false, right: false, jump: false });
    setMode('select');
  }

  const heldPointers = useRef<Partial<Record<'left' | 'right' | 'jump', number>>>({});

  function hold(key: 'left' | 'right' | 'jump', event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (event.type === 'pointerdown') {
      heldPointers.current[key] = event.pointerId;
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
      event.currentTarget.dataset.down = 'true';
      bridge.setTouch({ [key]: true });
      return;
    }
    if (heldPointers.current[key] !== undefined && event.pointerId !== heldPointers.current[key]) return;
    heldPointers.current[key] = undefined;
    event.currentTarget.dataset.down = 'false';
    bridge.setTouch({ [key]: false });
  }

  if (!playing && narrow) {
    return (
      <section className={styles.gate}>
        <img className={styles.gateArt} src={`${import.meta.env.BASE_URL}art/game/library-game.jpg`} alt="" />
        <button
          type="button"
          className={styles.gateBack}
          onClick={() => {
            sound.play('click');
            go('home');
          }}
        >
          <ArrowLeft size={18} />
          ოთხ კართან დაბრუნება
        </button>
        <header className={styles.gateTitle}>
          <p>მესამე კარი · თამაში</p>
          <h1>ითამაშე ქართულად</h1>
          <p>აირჩიე დონე და დაიწყე მოგზაურობა ქართულ სიტყვებში.</p>
        </header>
        <div className={styles.portals}>
          {levels.map((level, index) => {
            const locked = index > store.levelsCleared;
            const cleared = index < store.levelsCleared;
            const status = locked ? 'ჩაკეტილია' : cleared ? 'გავლილია' : 'შეგიძლია დაიწყო';
            const best = store.best[level.id];
            return (
              <article key={level.id} className={styles.portal} data-locked={locked || undefined}>
                <img src={`${import.meta.env.BASE_URL}art/game/${covers[index]}`} alt="" />
                <div>
                  <p className={styles.badge}>{marks[index]} დონე · {level.difficulty}</p>
                  <h2>{level.title}</h2>
                  <p>{level.summary}</p>
                  <p className={styles.status}>{status}{best ? ` · საუკეთესო ${best}` : ''}</p>
                  <button type="button" disabled={locked} onClick={() => begin(index)}>
                    <Play size={16} aria-hidden="true" />
                    {locked ? 'ჯერ ჩაკეტილია' : cleared ? 'თავიდან თამაში' : 'დაწყება'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (!playing) {
    return (
      <RoomShell
        tone="game"
        kicker="მესამე კარი · თამაში"
        title="ითამაშე ქართულად"
        lede="აირჩიე დონე და დაიწყე მოგზაურობა ქართულ სიტყვებში."
      >
        <p className={styles.orient}>ვერტიკალურ ეკრანზეც ითამაშებ. ჰორიზონტალურზე სურათი უფრო ფართოა.</p>
        <div className={styles.pick}>
          {levels.map((level, index) => {
            const locked = index > store.levelsCleared;
            const cleared = index < store.levelsCleared;
            const status = locked ? 'ჩაკეტილია' : cleared ? 'გავლილია' : 'შეგიძლია დაიწყო';
            const best = store.best[level.id];
            return (
              <article key={level.id} className={styles.card} data-locked={locked || undefined}>
                <img src={`${import.meta.env.BASE_URL}art/game/${covers[index]}`} alt="" />
                <div className={styles.cardBody}>
                  <p className={styles.diff}>{level.difficulty}</p>
                  <h2>{level.title}</h2>
                  <p>{level.summary}</p>
                  <p className={styles.status}>{status}{best ? ` · საუკეთესო ${best}` : ''}</p>
                  <button type="button" disabled={locked} onClick={() => begin(index)}>
                    {locked ? 'ჯერ ჩაკეტილია' : cleared ? 'თავიდან თამაში' : 'დაწყება'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </RoomShell>
    );
  }

  const total = hud.total || active.items.filter((item) => !item.bonus).length;
  const words = hud.words.map((id) => wordById(id)?.word).filter(Boolean);

  return (
    <div className={styles.stage}>
      <div className={styles.viewport}>
        <Suspense fallback={<p className={styles.loading}>თამაში იტვირთება…</p>}>
          <GameStage key={levelIndex} levelIndex={levelIndex} bridge={bridge} reduced={reduced} portrait={portrait} />
        </Suspense>
        <p className={styles.orient}>ჰორიზონტალური ეკრანი თამაშს აფართოებს.</p>
        <div className={styles.hud}>
          <div className={styles.top}>
            <span className={styles.lives} aria-label={`სიცოცხლე ${hud.lives} 3-დან`}>
              <Heart full={hud.lives > 2} />
              <Heart full={hud.lives > 1} />
              <Heart full={hud.lives > 0} />
            </span>
            <span className={styles.meter}>
              <strong>{hud.levelTitle || active.title}</strong>
              <span>{hud.collected}/{total}</span>
            </span>
            <span className={styles.actions}>
              <button type="button" className={styles.textBtn} onClick={leave}>დონეები</button>
              {hud.status === 'play' && (
                <button type="button" className={styles.pause} onClick={() => bridge.togglePause()} aria-label={hud.paused ? 'გაგრძელება' : 'პაუზა'}>
                  {hud.paused ? <Play size={16} /> : <Pause size={16} />}
                </button>
              )}
            </span>
          </div>
          {found && (
            <div className={styles.word} role="status" aria-label={found.word}>
              <div className={styles.wordArt}><img src={artUrl(found.art)} alt="" /></div>
              <div>
                <strong>{found.word}</strong>
                <Spell word={found.word} />
                <p>{found.definition}</p>
              </div>
            </div>
          )}
          {hud.paused && hud.status === 'play' && !hud.question && (
            <div className={styles.overlay}>
              <h2>პაუზა</h2>
              <p>სიარული: ისრები ან A / D. ხტომა: გამოტოვება, W ან ზემოთ ისარი.</p>
              <div className={styles.overlayActions}>
                <button type="button" onClick={() => bridge.togglePause()}><Play size={16} /> გაგრძელება</button>
                <button type="button" onClick={() => bridge.restart()}><RotateCcw size={16} /> თავიდან</button>
                <button type="button" onClick={leave}>დონეები</button>
                <button type="button" onClick={() => { sound.play('click'); go('home'); }}><ArrowLeft size={16} /> მუზეუმი</button>
              </div>
            </div>
          )}
          {hud.hint && !hud.question && !hud.paused && <p className={styles.banner} role="status">{hud.hint}</p>}
          {hud.question && (
            <div className={styles.question} role="dialog" aria-modal="true" aria-labelledby="question-title">
              <h2 id="question-title">{hud.question.prompt}</h2>
              <div>
                {hud.question.options.map((option, index) => (
                  <button key={option} type="button" onClick={() => bridge.choose(index)}>{option}</button>
                ))}
              </div>
              {hud.hint && <p>{hud.hint}</p>}
            </div>
          )}
          {hud.status === 'win' && (
            <div className={styles.overlay}>
              <h2>{levelIndex === levels.length - 1 ? 'მოგზაურობა დასრულდა' : 'დონე დასრულდა'}</h2>
              <Stars count={hud.stars} />
              <p>ერთი ვარსკვლავი დონის გავლაზეა. ორი — თუ ორი სიცოცხლე მაინც დაგრჩა. სამი — თუ სამივე სიცოცხლე შეგინარჩუნდა.</p>
              {words.length > 0 && <p>შეგროვებული სიტყვები: {words.join(', ')}</p>}
              {hud.secretTotal > 0 && <p>საიდუმლოები: {hud.secrets} / {hud.secretTotal}</p>}
              <p>ქულა: {hud.score}</p>
              <div className={styles.overlayActions}>
                <button type="button" onClick={() => bridge.restart()}><RotateCcw size={16} /> თავიდან</button>
                {levelIndex < levels.length - 1 && (
                  <button type="button" onClick={() => begin(levelIndex + 1)}>შემდეგი დონე</button>
                )}
                <button type="button" onClick={leave}>დონეები</button>
              </div>
            </div>
          )}
          {hud.status === 'lose' && (
            <div className={styles.overlay}>
              <h2>სიცოცხლე ამოიწურა</h2>
              <p>თავიდან სცადე. საგუშაგო ამ ცდაში აღარ ინახება.</p>
              <div className={styles.overlayActions}>
                <button type="button" onClick={() => bridge.restart()}><RotateCcw size={16} /> თავიდან</button>
                <button type="button" onClick={leave}>დონეები</button>
              </div>
            </div>
          )}
        </div>
        <div className={styles.touch}>
          <button type="button" aria-label="მარცხნივ" draggable={false} onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => hold('left', event)} onPointerUp={(event) => hold('left', event)} onPointerCancel={(event) => hold('left', event)} onLostPointerCapture={(event) => hold('left', event)}>
            <ChevronLeft />
          </button>
          <button type="button" aria-label="მარჯვნივ" draggable={false} onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => hold('right', event)} onPointerUp={(event) => hold('right', event)} onPointerCancel={(event) => hold('right', event)} onLostPointerCapture={(event) => hold('right', event)}>
            <ChevronRight />
          </button>
          <button type="button" aria-label="ხტომა" draggable={false} onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => hold('jump', event)} onPointerUp={(event) => hold('jump', event)} onPointerCancel={(event) => hold('jump', event)} onLostPointerCapture={(event) => hold('jump', event)}>
            <ArrowUp />
            <span>ხტომა</span>
          </button>
        </div>
      </div>
    </div>
  );
}
