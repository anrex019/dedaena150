import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Heart } from 'lucide-react';
import type { WordEntry } from '../../data/words';
import { WordMark } from './WordMark';
import styles from './WordsWorld.module.scss';

interface Props {
  words: WordEntry[];
  selectedId: string | null;
  favorites: string[];
  empty: string;
  reduced: boolean;
  onSelect: (id: string, openBook?: boolean) => void;
  onFavorite: (id: string) => void;
}

export function WordList({ words, selectedId, favorites, empty, reduced, onSelect, onFavorite }: Props) {
  const activeRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const node = activeRef.current;
    const list = node?.parentElement;
    if (!node || !list) return;
    const listBox = list.getBoundingClientRect();
    const rowBox = node.getBoundingClientRect();
    if (rowBox.top < listBox.top) list.scrollTop -= listBox.top - rowBox.top;
    else if (rowBox.bottom > listBox.bottom) list.scrollTop += rowBox.bottom - listBox.bottom;
  }, [selectedId]);

  function onKeyDown(event: KeyboardEvent) {
    if (words.length === 0) return;
    const index = Math.max(0, words.findIndex((word) => word.id === selectedId));
    let next = index;
    if (event.key === 'ArrowDown') next = Math.min(words.length - 1, index + 1);
    else if (event.key === 'ArrowUp') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = words.length - 1;
    else return;
    event.preventDefault();
    const id = words[next].id;
    onSelect(id, false);
    document.getElementById(`word-${id}`)?.focus();
  }

  return (
    <section className={styles.listPage} aria-label="სიტყვების სია" onKeyDown={onKeyDown}>
      <h2>სიტყვების სია</h2>
      {words.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <ul className={styles.rows}>
          {words.map((word) => {
            const saved = favorites.includes(word.id);
            const active = word.id === selectedId;
            return (
              <li
                key={word.id}
                ref={active ? activeRef : undefined}
                className={styles.row}
                data-active={active ? 'true' : 'false'}
              >
                <button
                  id={`word-${word.id}`}
                  type="button"
                  className={styles.pick}
                  aria-pressed={active}
                  onClick={() => onSelect(word.id, true)}
                >
                  <WordMark art={word.art} word={word.word} file={word.illustration} photoId={word.id} plain={word.plain} />
                  <strong>{word.word}</strong>
                </button>
                <button
                  type="button"
                  className={styles.heart}
                  aria-pressed={saved}
                  aria-label={saved ? `${word.word} რჩეულებიდან ამოღება` : `${word.word} რჩეულებში შენახვა`}
                  onClick={() => onFavorite(word.id)}
                >
                  <Heart
                    className={saved && !reduced ? styles.heartPop : undefined}
                    size={16}
                    fill={saved ? 'currentColor' : 'none'}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
