import { useEffect, useRef, useState } from 'react';
import type { WordEntry } from '../../data/words';
import { completeWorld } from '../../lib/store';
import { WordMark } from './WordMark';
import styles from './WordsWorld.module.scss';

interface Question {
  answer: WordEntry;
  options: WordEntry[];
}

interface Props {
  words: WordEntry[];
  onClose: () => void;
}

const ROUND = 5;

/** Pictures that also depict the other word, so they must not share a question. */
const conflicts: Record<string, string[]> = {
  ia: ['qvavili', 'futkari'],
  qvavili: ['ia', 'futkari'],
  futkari: ['ia', 'qvavili'],
  mtvare: ['mta', 'wyali', 'wigni', 'mze'],
  mta: ['mtvare'],
  wyali: ['mtvare'],
  mze: ['mtvare'],
  wigni: ['megobari', 'deda', 'mama', 'mtvare'],
  megobari: ['wigni', 'deda', 'mama'],
  deda: ['wigni', 'megobari', 'mta'],
  mama: ['wigni', 'megobari', 'mta', 'wyali'],
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function distractors(answer: WordEntry, pool: WordEntry[]) {
  const blocked = new Set(conflicts[answer.id] ?? []);
  const fits = (item: WordEntry) => item.id !== answer.id && !blocked.has(item.id);
  const same = shuffle(pool.filter((item) => fits(item) && item.category === answer.category));
  const other = shuffle(pool.filter((item) => fits(item) && item.category !== answer.category));
  return [...same, ...other].slice(0, 2);
}

function buildRound(pool: WordEntry[]): Question[] {
  const prompts = shuffle(pool.filter((word) => word.illustration && word.id !== 'mtvare'));
  const questions: Question[] = [];
  for (const answer of prompts) {
    const options = distractors(answer, pool);
    if (options.length < 2) continue;
    questions.push({ answer, options: shuffle([answer, ...options]) });
    if (questions.length === ROUND) break;
  }
  return questions;
}

export function WordChallenge({ words, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(() => buildRound(words));
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const question = round[step];
  const done = step >= round.length && round.length > 0;

  useEffect(() => {
    if (done) completeWorld('words');
  }, [done]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return undefined;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>('button:not(:disabled)')];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose, step, done]);

  function choose(option: WordEntry) {
    if (picked || !question) return;
    setPicked(option.id);
    if (option.id === question.answer.id) setScore((value) => value + 1);
  }

  function restart() {
    setRound(buildRound(words));
    setStep(0);
    setPicked(null);
    setScore(0);
  }

  const feedback = !question || !picked
    ? ''
    : picked === question.answer.id
      ? 'სწორია.'
      : `ეს პასუხი არ არის. სწორია: ${question.answer.word}.`;

  return (
    <div className={styles.quiz}>
      <div
        ref={dialogRef}
        className={styles.quizCard}
        role="dialog"
        aria-modal="true"
        aria-label="გამოიცანი სიტყვა"
        tabIndex={-1}
      >
        <div className={styles.quizHead}>
          <h2>გამოიცანი სიტყვა</h2>
          <button type="button" className={styles.quizClose} onClick={onClose}>დახურვა</button>
        </div>
        {done ? (
          <div className={styles.quizResult}>
            <p>შენი ქულა: {score} / {round.length}</p>
            {score === round.length && <p>ყველა სიტყვა გამოიცანი.</p>}
            <button type="button" className={styles.quizNext} onClick={restart}>თავიდან</button>
          </div>
        ) : question && (
          <>
            <p className={styles.quizStep}>კითხვა {step + 1} / {round.length}</p>
            <p className={styles.quizAsk}>რომელი სიტყვაა ამ სურათზე?</p>
            <div className={`${styles.plate} ${styles.quizPlate}`}>
              <WordMark
                art={question.answer.art}
                word={question.answer.word}
                file={question.answer.illustration}
                plain={question.answer.plain}
                eager
              />
            </div>
            <div className={styles.choices}>
              {question.options.map((option) => {
                let result: 'ok' | 'bad' | undefined;
                if (picked) {
                  if (option.id === question.answer.id) result = 'ok';
                  else if (option.id === picked) result = 'bad';
                }
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={styles.choice}
                    data-result={result}
                    disabled={picked !== null}
                    onClick={() => choose(option)}
                  >
                    {option.word}
                  </button>
                );
              })}
            </div>
            <p className={styles.quizFeedback} aria-live="polite">{feedback}</p>
            {picked && (
              <button
                type="button"
                className={styles.quizNext}
                onClick={() => {
                  setPicked(null);
                  setStep((value) => value + 1);
                }}
              >
                {step + 1 === round.length ? 'შედეგი' : 'შემდეგი'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
