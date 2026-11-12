import { useState } from 'react';
import type { ArtId } from '../../data/words';
import { WordGlyph } from '../art/WordGlyph';
import styles from './WordsWorld.module.scss';

interface Props {
  art: ArtId;
  word: string;
  file?: string;
  plain?: boolean;
  eager?: boolean;
}

export function WordMark({ art, word, file, plain, eager }: Props) {
  const [failed, setFailed] = useState(false);
  if (file && !failed) {
    return (
      <span className={styles.mark} aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}art/words/marks/${file}`}
          alt=""
          width={512}
          height={512}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  if (plain || (file && failed)) {
    return (
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.letterFallback}>{Array.from(word)[0]}</span>
      </span>
    );
  }
  return (
    <span className={styles.mark} aria-hidden="true">
      <WordGlyph art={art} />
    </span>
  );
}
