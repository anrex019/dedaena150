import { useEffect, useState } from 'react';
import type { Room } from '../../lib/route';
import { sound } from '../../lib/sound';
import styles from './DoorMusic.module.scss';

const tracks: Partial<Record<Room, { title: string; video?: string; audio?: string; source: string }>> = {
  history: { title: 'ნიაზ დიასამიძე & 33ა — ადე, შახედე ქვეყანას', video: 'tlPdO1nUVrE', source: 'https://www.youtube.com/watch?v=tlPdO1nUVrE' },
  words: { title: 'თავისუფლება — ქართული ინსტრუმენტული შესრულება', audio: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tavisupleba%20instrumental.ogg', source: 'https://commons.wikimedia.org/wiki/File:Tavisupleba_instrumental.ogg' },
  game: { title: 'სუხიშვილები — ხანჯლური', video: 'TNKRZ8JNCzE', source: 'https://www.youtube.com/watch?v=TNKRZ8JNCzE' },
  future: { title: 'ნიაზ დიასამიძე & 33ა — სიპი', video: '1oHPcVuqa5E', source: 'https://www.youtube.com/watch?v=1oHPcVuqa5E' },
};

export function DoorMusic({ room }: { room: Room }) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const track = tracks[room];
  useEffect(() => {
    setOpen(false);
    sound.setMusic(false);
  }, [room]);
  if (!track) return null;
  return (
    <aside className={styles.dock} aria-label="კარის ქართული მუსიკა">
      <button type="button" className={styles.toggle} onClick={() => {
        setEnabled((value) => !value);
        sound.setMusic(false);
      }}>
        {enabled ? '♫ მუსიკის გამორთვა' : '♫ მუსიკის ჩართვა'}
      </button>
      {enabled && track.video && (
        <iframe
          key={room}
          className={open ? styles.player : styles.hiddenPlayer}
          title={track.title}
          src={`https://www.youtube-nocookie.com/embed/${track.video}?autoplay=1&playsinline=1&controls=1&loop=1&playlist=${track.video}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
      {enabled && track.audio && (
        <audio key={room} src={track.audio} autoPlay loop controls={open} />
      )}
      <button type="button" className={styles.details} onClick={() => setOpen(!open)}>
        {open ? 'პლეერის დამალვა' : 'თუ ხმა არ ისმის — პლეერის გახსნა'}
      </button>
      {open && <div className={styles.panel}>
        <strong>{track.title}</strong>
        <a href={track.source} target="_blank" rel="noopener noreferrer">წყაროს გახსნა ↗</a>
        <small>ბრაუზერმა შეიძლება ხმით ავტომატური დაკვრა დაბლოკოს. ასეთ შემთხვევაში დააჭირე Play-ს. YouTube-ის ჩაშენების შეზღუდვაც შესაძლებელია.</small>
      </div>}
    </aside>
  );
}
