import { useEffect, useState } from 'react';
import { findCommonsPhoto } from './commonsPhotos';
import type { ArtId } from '../../data/words';
import { WordGlyph } from '../art/WordGlyph';
import styles from './WordsWorld.module.scss';

interface Props {
  art: ArtId;
  word: string;
  file?: string;
  plain?: boolean;
  eager?: boolean;
  photoId?: string;
}

export function WordMark({ art, word, file, plain, eager, photoId }: Props) {
  const [photo, setPhoto] = useState<{ url: string; page: string } | null>(null);
  useEffect(() => {
    let live = true;
    setPhoto(null);
    if (photoId) void findCommonsPhoto(photoId).then((result) => { if (live) setPhoto(result); });
    return () => { live = false; };
  }, [photoId]);
  const [failed, setFailed] = useState(false);
  if (photo) {
    return <span className={styles.mark} aria-label={`${word} — ფოტო Wikimedia Commons-იდან`}>
      {eager ? (
        <a href={photo.page} target="_blank" rel="noopener noreferrer" title="ფოტოს წყარო და ავტორი Wikimedia Commons-ზე">
          <img src={photo.url} alt={word} width={512} height={512} loading="eager" decoding="async" />
        </a>
      ) : <img src={photo.url} alt={word} width={512} height={512} loading="lazy" decoding="async" />}
    </span>;
  }
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
