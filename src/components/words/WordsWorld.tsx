import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ArrowLeft } from 'lucide-react';
import { words, type WordEntry } from '../../data/words';
import { go } from '../../lib/route';
import { sound } from '../../lib/sound';
import { speakGeorgian, useGeorgianVoice } from '../../lib/speech';
import { discoverWord, toggleFavorite, useStore } from '../../lib/store';
import { CategoryNav, type WordFilter } from './CategoryNav';
import { WordBook } from './WordBook';
import { WordChallenge } from './WordChallenge';
import { WordList } from './WordList';
import styles from './WordsWorld.module.scss';

interface Props { reduced: boolean; }

const knownIds = new Set(words.map((word) => word.id));

function matches(word: WordEntry, filter: WordFilter, favorites: string[]) {
  if (filter === 'favorites') return favorites.includes(word.id);
  if (filter === 'all') return true;
  return word.category === filter;
}

function useNarrow() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia('(max-width: 860px)');
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia('(max-width: 860px)').matches,
    () => false,
  );
}

export function WordsWorld({ reduced }: Props) {
  const { favorites, discovered } = useStore();
  const canSpeak = useGeorgianVoice();
  const narrow = useNarrow();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<WordFilter>('all');
  const [selected, setSelected] = useState(words[0].id);
  const [sheet, setSheet] = useState<'list' | 'book'>('list');
  const [quiz, setQuiz] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim();
    return words.filter((word) => {
      if (!matches(word, filter, favorites)) return false;
      return needle.length === 0 || word.word.includes(needle) || word.definition.includes(needle);
    });
  }, [query, filter, favorites]);

  useEffect(() => {
    if (visible.length === 0) return;
    if (!visible.some((word) => word.id === selected)) setSelected(visible[0].id);
  }, [visible, selected]);

  const active = visible.find((word) => word.id === selected) ?? null;

  useEffect(() => {
    if (active) discoverWord(active.id);
  }, [active]);

  const found = discovered.filter((id) => knownIds.has(id)).length;
  const total = words.length;
  const percent = Math.round((found / total) * 100);
  const complete = found === total;
  const empty = filter === 'favorites' && query.trim().length === 0
    ? 'რჩეული სიტყვა ჯერ არ არის. გულს დააჭირე, რომ შეინახო.'
    : 'ასეთი სიტყვა სიაში არ არის.';

  const choose = useCallback((id: string, openBook = true) => {
    if (openBook) sound.play('click');
    setSelected(id);
    if (openBook && narrow) setSheet('book');
  }, [narrow]);

  const favorite = useCallback((id: string) => {
    sound.play('click');
    toggleFavorite(id);
  }, []);

  const closeQuiz = useCallback(() => setQuiz(false), []);

  return (
    <section className={styles.viewport}>
      <img className={styles.scene} src={`${import.meta.env.BASE_URL}art/words/garden.jpg`} alt="" />
      {narrow && (
        <>
          <img className={styles.grove} src={`${import.meta.env.BASE_URL}art/words/library-words.jpg`} alt="" />
          {!reduced && <span className={styles.lantern} aria-hidden="true" />}
        </>
      )}
      {!reduced && Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className={styles.firefly}
          style={{
            left: `${12 + (index * 9) % 76}%`,
            top: `${8 + (index * 7) % 34}%`,
            animationDelay: `${index * 0.45}s`,
          }}
        />
      ))}

      <div className={styles.mast}>
        <button
          type="button"
          className={styles.back}
          onClick={() => {
            sound.play('click');
            go('home');
          }}
        >
          <ArrowLeft size={18} />
          ოთხ კართან დაბრუნება
        </button>
        <header className={styles.title}>
          <p>მეორე კარი · სიტყვები</p>
          <h1>ქართული სიტყვების საგანძური</h1>
          <p className={styles.ledeDesk}>მოძებნე სიტყვა, წაიკითხე განმარტება და შეინახე რჩეული.</p>
          <p className={styles.ledePhone}>მოძებნე სიტყვა, წაიკითხე განმარტება და შეინახე რჩეულად.</p>
          <p className={styles.progressText}>აღმოჩენილია {found}/{total} სიტყვა · {percent}%</p>
          <div
            className={styles.meter}
            data-done={complete ? 'true' : 'false'}
            role="progressbar"
            aria-valuenow={found}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`აღმოჩენილია ${found} სიტყვა ${total}-დან`}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
          {complete && <p className={styles.complete} role="status">საგანძური სრულია — ყველა სიტყვა აღმოაჩინე.</p>}
        </header>
      </div>

      <div className={styles.desk}>
        <CategoryNav
          query={query}
          filter={filter}
          found={found}
          total={total}
          onQuery={setQuery}
          onFilter={setFilter}
          onQuiz={() => setQuiz(true)}
        />
        {narrow && (
          <div className={styles.sheets} role="tablist" aria-label="სიისა და წიგნის ხედი">
            <button type="button" role="tab" aria-selected={sheet === 'list'} onClick={() => setSheet('list')}>სიტყვების სია</button>
            <button type="button" role="tab" aria-selected={sheet === 'book'} onClick={() => setSheet('book')}>წიგნი</button>
          </div>
        )}
        <div className={styles.book} data-sheet={narrow ? sheet : 'both'}>
          {narrow && (
            <img className={styles.bookArt} src={`${import.meta.env.BASE_URL}art/words/dictionary-book.png`} alt="" />
          )}
          <WordList
            words={visible}
            selectedId={active?.id ?? null}
            favorites={favorites}
            empty={empty}
            reduced={reduced}
            onSelect={choose}
            onFavorite={favorite}
          />
          <WordBook
            word={active}
            saved={active ? favorites.includes(active.id) : false}
            canSpeak={canSpeak}
            reduced={reduced}
            empty={empty}
            onFavorite={favorite}
            onSpeak={(text) => { speakGeorgian(text); }}
            onBack={narrow ? () => setSheet('list') : undefined}
          />
        </div>
      </div>
      {quiz && <WordChallenge words={words} onClose={closeQuiz} />}
    </section>
  );
}
