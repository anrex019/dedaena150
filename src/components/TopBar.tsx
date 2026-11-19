import { Info, Volume2, VolumeX } from 'lucide-react';
import { getState, patch, useStore } from '../lib/store';
import { go } from '../lib/route';
import { sound } from '../lib/sound';
import styles from './TopBar.module.scss';

interface Props {
  solid: boolean;
  onInfo: () => void;
}

export function TopBar({ solid, onInfo }: Props) {
  const { sfx } = useStore();

  return (
    <header className={styles.bar} data-topbar="" data-solid={solid}>
      <div className={styles.group}>
        <button
          type="button"
          className={styles.icon}
          aria-pressed={sfx}
          aria-label={sfx ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}
          onClick={() => {
            void sound.unlock().then(() => patch({ sfx: !getState().sfx }));
          }}
        >
          {sfx ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
      <button type="button" className={styles.brand} onClick={() => go('home')}>
        დედაენა <strong>150</strong>
      </button>
      <div className={styles.group}>
        <button type="button" className={styles.icon} aria-label="პროექტის შესახებ" onClick={onInfo}>
          <Info size={20} />
        </button>
      </div>
    </header>
  );
}
