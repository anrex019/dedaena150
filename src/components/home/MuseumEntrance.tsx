import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { doors, type DoorInfo } from '../../data/doors';
import { go } from '../../lib/route';
import { sound } from '../../lib/sound';
import styles from './MuseumEntrance.module.scss';

interface Props { reduced: boolean; }

/** Measured against public/art/entrance/scene.jpg (1280×720). Replace the files to restyle. */
const slots: Record<DoorInfo['id'], { left: string; top: string; width: string; height: string }> = {
  history: { left: '24.3%', top: '43.2%', width: '10.0%', height: '35.2%' },
  words: { left: '38.0%', top: '43.0%', width: '10.0%', height: '35.4%' },
  game: { left: '51.8%', top: '43.0%', width: '10.0%', height: '35.4%' },
  future: { left: '65.5%', top: '43.2%', width: '10.0%', height: '35.2%' },
};

const lanterns = ['36.1%', '49.8%', '63.6%'];

function asset(file: string) {
  return `${import.meta.env.BASE_URL}art/entrance/${file}`;
}

function useNarrow() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia('(max-width: 800px)');
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia('(max-width: 800px)').matches,
    () => false,
  );
}

export function MuseumEntrance({ reduced }: Props) {
  const narrow = useNarrow();
  const [opening, setOpening] = useState<DoorInfo['id'] | null>(null);
  const timer = useRef<number | null>(null);
  const fireflies = useMemo(
    () => Array.from({ length: 16 }, (_, index) => ({
      id: index,
      left: `${4 + ((index * 17) % 28)}%`,
      top: `${6 + ((index * 13) % 48)}%`,
      delay: `${(index % 8) * 0.45}s`,
      duration: `${5.5 + (index % 4)}s`,
      gold: index % 3 === 0,
    })),
    [],
  );

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function openDoor(id: DoorInfo['id']) {
    if (opening) return;
    sound.play('open');
    if (reduced) {
      go(id);
      return;
    }
    setOpening(id);
    timer.current = window.setTimeout(() => go(id), 880);
  }

  return (
    <section className={styles.stage} data-opening={opening ? 'true' : 'false'} data-reduced={reduced ? 'true' : 'false'}>
      <div className={styles.frame}>
        <img className={styles.scene} src={asset('scene.jpg')} alt="" />
        <img className={styles.canopy} src={asset('scene.jpg')} alt="" aria-hidden="true" />
        {lanterns.map((left) => <span key={left} className={styles.lantern} style={{ left }} />)}
        {fireflies.map((fly) => (
          <span
            key={fly.id}
            className={fly.gold ? styles.fireflyGold : styles.firefly}
            style={{ left: fly.left, top: fly.top, animationDelay: fly.delay, animationDuration: fly.duration }}
          />
        ))}
        <header className={styles.banner}>
          <p className={styles.kicker}>ინტერაქტიული ციფრული მუზეუმი</p>
          <h1>დედაენა <span>150</span></h1>
          <p>ქართული სიტყვის ციფრული მუზეუმი</p>
        </header>
        <div className={styles.doors}>
          {doors.map((door) => (
            <button
              key={door.id}
              type="button"
              className={styles.door}
              style={slots[door.id]}
              data-tone={door.id}
              data-open={opening === door.id}
              aria-label={`${door.title}. კარის გაღება`}
              aria-hidden={narrow || undefined}
              tabIndex={narrow ? -1 : undefined}
              onClick={() => openDoor(door.id)}
            >
              <span className={styles.leaf}>
                <img src={asset(`door-${door.id}.jpg`)} alt="" />
                <span className={styles.plaque}>{door.title}</span>
              </span>
            </button>
          ))}
        </div>
        <p className={styles.hint}>აირჩიე კარი. კლავიატურით: Tab და Enter.</p>
      </div>
      <div className={styles.choices}>
        {doors.map((door) => (
          <button
            key={door.id}
            type="button"
            data-tone={door.id}
            data-open={opening === door.id}
            aria-label={`${door.title}. კარის გაღება`}
            onClick={() => openDoor(door.id)}
          >
            <img src={asset(`door-${door.id}.jpg`)} alt="" />
            <span>{door.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
