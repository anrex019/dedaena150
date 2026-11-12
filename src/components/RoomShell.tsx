import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { go } from '../lib/route';
import { sound } from '../lib/sound';
import styles from './RoomShell.module.scss';

interface Props {
  tone: 'history' | 'words' | 'game' | 'future';
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}

export function RoomShell({ tone, kicker, title, lede, children }: Props) {
  return (
    <section className={styles.room} data-tone={tone}>
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
      <header className={styles.heading}>
        <p>{kicker}</p>
        <h1>{title}</h1>
        <p>{lede}</p>
      </header>
      {children}
    </section>
  );
}
