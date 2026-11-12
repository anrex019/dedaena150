import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import type { CategoryId } from '../../data/words';
import styles from './WordsWorld.module.scss';

export type WordFilter = 'all' | 'favorites' | CategoryId;

const items: { id: WordFilter; label: string; icon: IconName }[] = [
  { id: 'all', label: 'ყველა', icon: 'stack' },
  { id: 'favorites', label: 'რჩეულები', icon: 'heart' },
  { id: 'nature', label: 'ბუნება', icon: 'leaf' },
  { id: 'animals', label: 'ცხოველები', icon: 'paw' },
  { id: 'sky', label: 'ცა', icon: 'sun' },
  { id: 'family', label: 'ოჯახი', icon: 'family' },
  { id: 'home', label: 'სახლი', icon: 'house' },
  { id: 'study', label: 'სწავლა', icon: 'book' },
  { id: 'body', label: 'სხეული', icon: 'hand' },
  { id: 'society', label: 'საზოგადოება', icon: 'people' },
  { id: 'literature', label: 'მწერლობა', icon: 'scroll' },
];

interface Props {
  query: string;
  filter: WordFilter;
  found: number;
  total: number;
  onQuery: (value: string) => void;
  onFilter: (filter: WordFilter) => void;
  onQuiz: () => void;
}

const UNLOCK_AT = 8;

export function CategoryNav({ query, filter, found, total, onQuery, onFilter, onQuiz }: Props) {
  return (
    <nav className={styles.cabinet} aria-label="სიტყვების კატეგორიები">
      <label className={styles.search}>
        <Search size={16} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="მოძებნე სიტყვა..."
          aria-label="სიტყვის ძიება"
        />
      </label>
      <div className={styles.cats}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.cat}
            aria-pressed={filter === item.id}
            onClick={() => onFilter(item.id)}
          >
            <CategoryIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.questBox}>
        <button
          type="button"
          className={styles.quest}
          disabled={found < Math.min(UNLOCK_AT, total)}
          aria-describedby={found < Math.min(UNLOCK_AT, total) ? 'quest-hint' : undefined}
          onClick={onQuiz}
        >
          გამოიცანი სიტყვა
        </button>
        {found < Math.min(UNLOCK_AT, total) && (
          <p id="quest-hint" className={styles.questHint}>
            კიდევ {Math.min(UNLOCK_AT, total) - found} სიტყვა აღმოაჩინე, და ეს თამაში გაიხსნება.
          </p>
        )}
      </div>
    </nav>
  );
}

type IconName = 'stack' | 'heart' | 'leaf' | 'paw' | 'sun' | 'house' | 'book' | 'hand' | 'people' | 'family' | 'scroll';

function CategoryIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    stack: <path d="M4 8h16M4 12h16M4 16h10" />,
    heart: <path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />,
    leaf: <path d="M5 19C5 10 12 4 20 4 20 14 14 20 5 19zM8 16c2-2 5-5 8-8" />,
    paw: (
      <>
        <circle cx="8" cy="8" r="1.6" />
        <circle cx="12" cy="6.2" r="1.6" />
        <circle cx="16" cy="8" r="1.6" />
        <path d="M8 14c0-2 8-2 8 1 0 3-2 5-4 5s-4-2-4-6z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
      </>
    ),
    house: <path d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z" />,
    book: <path d="M5 5h6a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H5zM19 5h-6a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h6z" />,
    hand: <path d="M8 11V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5.5a1.5 1.5 0 0 1 3 0V11M14 11V7.5a1.5 1.5 0 0 1 3 0V14c0 4-2 6-5 6h-1c-3 0-5-2-5-5v-2" />,
    people: (
      <>
        <circle cx="9" cy="8" r="2.2" />
        <circle cx="16" cy="9" r="1.8" />
        <path d="M4.5 18c.4-3 2.4-4.5 4.5-4.5S13 15 13.4 18M14 14.2c1.6-.4 3.2.4 3.8 3.3" />
      </>
    ),
    family: (
      <>
        <circle cx="9" cy="7" r="2.4" />
        <circle cx="15.5" cy="9" r="1.7" />
        <path d="M4.2 18c.5-3.2 2.6-4.8 4.8-4.8s4.2 1.6 4.6 4.8M13.2 14.4c1.4-.5 3 .2 3.6 3.2" />
      </>
    ),
    scroll: (
      <>
        <path d="M7 6h9a3 3 0 0 1 3 3v9H10a3 3 0 0 0-3 3V6z" />
        <path d="M10 10h6M10 13h5" />
      </>
    ),
  };
  return (
    <svg className={styles.catIcon} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
