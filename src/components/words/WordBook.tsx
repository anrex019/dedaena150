import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Volume2 } from 'lucide-react';
import { categoryLabel, lettersOf, type WordEntry } from '../../data/words';
import { WordMark } from './WordMark';
import styles from './WordsWorld.module.scss';

interface Props {
  word: WordEntry | null;
  saved: boolean;
  canSpeak: boolean;
  reduced: boolean;
  empty: string;
  onFavorite: (id: string) => void;
  onSpeak: (text: string) => void;
}

export function WordBook({ word, saved, canSpeak, reduced, empty, onFavorite, onSpeak }: Props) {
  if (!word) {
    return (
      <section className={styles.entry}>
        <p className={styles.empty}>{empty}</p>
      </section>
    );
  }

  const letters = lettersOf(word.word);
  const motionOff = reduced;

  return (
    <section className={styles.entry}>
      <button
        type="button"
        className={saved && !reduced ? `${styles.ribbon} ${styles.ribbonOn}` : styles.ribbon}
        aria-pressed={saved}
        aria-label={saved ? 'რჩეულებიდან ამოღება' : 'რჩეულებში შენახვა'}
        onClick={() => onFavorite(word.id)}
      >
        <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          className={styles.entryBody}
          initial={motionOff ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={motionOff ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: motionOff ? 0 : 0.32, ease: [0.22, 0.8, 0.3, 1] }}
        >
          <div className={styles.plate}>
            <WordMark art={word.art} word={word.word} file={word.illustration} plain={word.plain} eager />
          </div>
          <div className={styles.nameRow}>
            <h2>{word.word}</h2>
            <button
              type="button"
              className={styles.speak}
              disabled={!canSpeak}
              aria-label={canSpeak ? `${word.word}, მოსმენა` : 'ქართული ხმა ამ მოწყობილობაზე არ მოიძებნა'}
              onClick={() => onSpeak(word.word)}
            >
              <Volume2 size={16} aria-hidden="true" />
            </button>
          </div>
          <p className={styles.badge}>{categoryLabel(word.category)}</p>
          <motion.p
            className={styles.definition}
            initial={motionOff ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionOff ? 0 : 0.28, delay: motionOff ? 0 : 0.08 }}
          >
            {word.definition}
          </motion.p>
          <motion.div
            className={styles.example}
            initial={motionOff ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionOff ? 0 : 0.28, delay: motionOff ? 0 : 0.16 }}
          >
            <span>მაგალითი</span>
            <blockquote>„{word.example}“</blockquote>
          </motion.div>
          {letters.length > 1 && (
            <div className={styles.spell} data-long={letters.length > 8 ? 'true' : 'false'}>
              <span>ასოების დაშლა</span>
              <p>
                {letters.map((letter, index) => (
                  <motion.span
                    key={`${word.id}-${index}`}
                    initial={motionOff ? false : { opacity: 0, x: (index - (letters.length - 1) / 2) * 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: motionOff ? 0 : 0.4, delay: motionOff ? 0 : 0.05 * index }}
                  >
                    {index > 0 ? ' + ' : ''}
                    {letter}
                  </motion.span>
                ))}
                <motion.span
                  className={styles.spellWord}
                  initial={motionOff ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: motionOff ? 0 : 0.05 * letters.length + 0.12 }}
                >
                  {` = ${word.word}`}
                </motion.span>
              </p>
            </div>
          )}
          {!canSpeak && (
            <p className={styles.voice}>ამ მოწყობილობაზე ქართული ხმა ვერ მოიძებნა, ამიტომ მოსმენა გამორთულია.</p>
          )}
          <p className="sr" aria-live="polite">{word.word}. {word.definition}</p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
