import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getState, patch, subscribe } from '../../lib/store';
import { sound } from '../../lib/sound';
import styles from './Opening.module.scss';

interface Props {
  phase: 'welcome' | 'cinema';
  reduced: boolean;
  onBegin: () => void;
  onFinish: () => void;
}

const letters = ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ', 'ზ', 'თ'];
const sparks = Array.from({ length: 14 }, (_, index) => index);

function asset(file: string) {
  return `${import.meta.env.BASE_URL}art/history/${file}`;
}

export function Opening({ phase, reduced, onBegin, onFinish }: Props) {
  const startRef = useRef<HTMLButtonElement>(null);
  const started = useRef(false);
  const musicTouched = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    let last = getState().music;
    const unsubscribe = subscribe(() => {
      const next = getState().music;
      if (next !== last) musicTouched.current = true;
      last = next;
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'welcome') return undefined;
    startRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (document.activeElement !== startRef.current) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      void begin();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'cinema') return undefined;
    const cue = window.setTimeout(() => sound.play('open'), reduced ? 0 : 2100);
    const end = window.setTimeout(() => onFinishRef.current(), reduced ? 1600 : 10000);
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (document.querySelector('[role="dialog"]')) return;
      event.preventDefault();
      onFinishRef.current();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(cue);
      window.clearTimeout(end);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase, reduced]);

  async function begin() {
    if (started.current) return;
    started.current = true;
    await sound.unlock();
    if (!musicTouched.current && !getState().music) patch({ music: true });
    if (getState().music) sound.beginCinematic();
    onBegin();
  }

  return (
    <section className={styles.veil} data-phase={phase} data-reduced={reduced ? 'true' : 'false'}>
      <img className={styles.library} src={asset('library.jpg')} alt="" />
      <div className={styles.vignette} />
      <div className={styles.shade} />
      {!reduced && sparks.map((index) => (
        <span
          key={index}
          className={styles.spark}
          style={{
            left: `${8 + (index * 7) % 84}%`,
            top: `${12 + (index * 11) % 70}%`,
            animationDelay: `${index * 0.35}s`,
          }}
          aria-hidden="true"
        />
      ))}
      <span className={styles.flower} style={{ left: '4%', bottom: '8%' }} aria-hidden="true" />
      <span className={styles.flower} style={{ right: '5%', top: '18%' }} aria-hidden="true" />

      <div className={styles.stage}>
        <div className={styles.book} data-open={phase === 'cinema' && !reduced ? 'true' : 'false'}>
          <div className={styles.pages} aria-hidden="true" />
          <div className={styles.cover}>
            <img src={asset('dedaena-1876-cover.jpg')} alt="„დედა ენის“ 1876 წლის ყდა" />
          </div>
          {phase === 'cinema' && !reduced && letters.map((mark, index) => (
            <span
              key={mark}
              className={styles.letter}
              style={{ ['--i' as string]: String(index) }}
              aria-hidden="true"
            >
              {mark}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === 'welcome' ? (
            <motion.div
              key="welcome"
              className={styles.copy}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.55 }}
            >
              <h1>დედაენა 150</h1>
              <p>150 წელი — ერთი ენა, უსასრულო ისტორია</p>
              <button ref={startRef} type="button" className={styles.start} onClick={() => { void begin(); }}>
                <span className={styles.mote} aria-hidden="true" />
                მოგზაურობის დაწყება
                <span className={styles.mote} aria-hidden="true" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="cinema" className={styles.caption} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.4 }}>
              <p className={styles.years}>1876 — 2026</p>
              <p>150 წელი ქართული სიტყვის სამსახურში</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'cinema' && (
        <button type="button" className={styles.skip} onClick={() => onFinishRef.current()}>
          გამოტოვება
        </button>
      )}
    </section>
  );
}
