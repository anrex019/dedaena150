import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FutureWorld } from './components/future/FutureWorld';
import { GameWorld } from './components/game/GameWorld';
import { HistoryWorld } from './components/history/HistoryWorld';
import { MuseumEntrance } from './components/home/MuseumEntrance';
import { Opening } from './components/home/Opening';
import { SecretDoor } from './components/home/SecretDoor';
import { InfoModal } from './components/InfoModal';
import { TopBar } from './components/TopBar';
import { DoorMusic } from './components/music/DoorMusic';
import { WordsWorld } from './components/words/WordsWorld';
import { useReducedMotion } from './lib/a11y';
import { sound } from './lib/sound';
import { go, readRoom, useRoom } from './lib/route';
import { allWorldsComplete, patch, useStore } from './lib/store';

const INTRO_SEEN = 'dedaena150.introSeen';

function introPending() {
  try {
    return sessionStorage.getItem(INTRO_SEEN) !== '1';
  } catch {
    return false;
  }
}

const titles = {
  home: 'დედაენა 150 — ციფრული მუზეუმი',
  history: 'იაკობ გოგებაშვილის სამყარო — დედაენა 150',
  words: 'ქართული სიტყვების საგანძური — დედაენა 150',
  game: 'ითამაშე ქართულად — დედაენა 150',
  future: 'ქართული ენა მომავალში — დედაენა 150',
} as const;

export function App() {
  const room = useRoom();
  const reduced = useReducedMotion();
  const progress = useStore();
  const unlocked = allWorldsComplete(progress);
  const [info, setInfo] = useState(false);
  const [gate, setGate] = useState<'welcome' | 'cinema' | 'off'>(() => (
    readRoom() === 'home' && introPending() ? 'welcome' : 'off'
  ));
  const [secretReplay, setSecretReplay] = useState(false);
  const [holding, setHolding] = useState(false);
  const [chamber, setChamber] = useState(false);

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN, '1');
    } catch {
      /* Private mode can block session storage. The doors still open. */
    }
    setGate('off');
  }, []);

  const replayIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(INTRO_SEEN);
    } catch {
      /* The welcome screen still opens for this click. */
    }
    setInfo(false);
    setHolding(false);
    setChamber(false);
    setSecretReplay(false);
    if (readRoom() !== 'home') go('home');
    setGate('welcome');
  }, []);

  const replaySecret = useCallback(() => {
    setInfo(false);
    setChamber(false);
    setSecretReplay(true);
    setHolding(true);
    if (readRoom() !== 'home') go('home');
  }, []);

  useEffect(() => {
    document.title = titles[room];
    sound.setRoom(room);
    window.scrollTo(0, 0);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [room]);

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduce' : 'ok';
  }, [reduced]);

  useEffect(() => {
    if (unlocked && !progress.guardianAt) patch({ guardianAt: new Date().toISOString() });
  }, [unlocked, progress.guardianAt]);

  useEffect(() => {
    if (!unlocked || progress.guardianSeen || room === 'home' || room === 'future') return;
    go('home');
  }, [unlocked, progress.guardianSeen, room]);

  useEffect(() => {
    if (gate !== 'off' || room !== 'home') return;
    if (!unlocked || progress.guardianSeen) return;
    if (secretReplay) return;
    setHolding(true);
  }, [gate, room, unlocked, progress.guardianSeen, secretReplay]);

  const reveal = holding && room === 'home' && gate === 'off' && !chamber;
  const launcher = unlocked && progress.guardianSeen && !reveal && !chamber && room === 'home' && gate === 'off';

  const page = (
    <>
      {room === 'home' && <MuseumEntrance reduced={reduced} />}
      {room === 'history' && <HistoryWorld reduced={reduced} />}
      {room === 'words' && <WordsWorld reduced={reduced} />}
      {room === 'game' && <GameWorld reduced={reduced} />}
      {room === 'future' && <FutureWorld reduced={reduced} />}
    </>
  );

  return (
    <ErrorBoundary>
      <TopBar solid={room !== 'home' && room !== 'history' && room !== 'words' && room !== 'future'} onInfo={() => setInfo(true)} />
      <AnimatePresence mode="wait">
        <motion.div
          key={room}
          className="page"
          aria-hidden={gate !== 'off'}
          inert={gate !== 'off' ? true : undefined}
          initial={{ opacity: 0, y: reduced || gate !== 'off' ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -8 }}
          transition={{ duration: reduced || gate !== 'off' ? 0 : 0.35 }}
        >
          {page}
        </motion.div>
      </AnimatePresence>
      {gate !== 'off' && (
        <Opening phase={gate} reduced={reduced} onBegin={() => setGate('cinema')} onFinish={finishIntro} />
      )}
      <p className="sr" aria-live="polite">{titles[room]}</p>
      {reveal && (
        <SecretDoor
          mode="reveal"
          reduced={reduced}
          completedAt={progress.guardianAt}
          onEnter={() => { setHolding(false); setSecretReplay(false); setChamber(true); }}
          onStay={() => { setHolding(false); setSecretReplay(false); }}
          onClose={() => { setHolding(false); setSecretReplay(false); }}
        />
      )}
      {chamber && room === 'home' && gate === 'off' && (
        <SecretDoor
          mode="chamber"
          reduced={reduced}
          completedAt={progress.guardianAt}
          onEnter={() => undefined}
          onStay={() => undefined}
          onClose={() => setChamber(false)}
        />
      )}
      {launcher && (
        <SecretDoor
          mode="launcher"
          reduced={reduced}
          completedAt={progress.guardianAt}
          onEnter={() => setChamber(true)}
          onStay={() => undefined}
          onClose={() => undefined}
        />
      )}
      {gate === 'off' && <DoorMusic room={room} />}
      {info && (
        <InfoModal
          onClose={() => setInfo(false)}
          onReplay={replayIntro}
          onShowSecret={unlocked ? replaySecret : undefined}
        />
      )}
    </ErrorBoundary>
  );
}
