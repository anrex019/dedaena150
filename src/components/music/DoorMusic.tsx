import { useEffect, useState } from 'react';
import type { Room } from '../../lib/route';
import { sound } from '../../lib/sound';
import { getState } from '../../lib/store';
import styles from './DoorMusic.module.scss';

const tracks: Partial<Record<Room, { title: string; video?: string; audio?: string; source: string }>> = {
  history: { title: 'ნიაზ დიასამიძე & 33ა — ადე, შახედე ქვეყანას', video: 'tlPdO1nUVrE', source: 'https://www.youtube.com/watch?v=tlPdO1nUVrE' },
  words: { title: 'თავისუფლება — ქართული ინსტრუმენტული შესრულება', audio: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tavisupleba%20instrumental.ogg', source: 'https://commons.wikimedia.org/wiki/File:Tavisupleba_instrumental.ogg' },
  game: { title: 'სუხიშვილები — ხანჯლური', video: 'TNKRZ8JNCzE', source: 'https://www.youtube.com/watch?v=TNKRZ8JNCzE' },
  future: { title: 'ნიაზ დიასამიძე & 33ა — სიპი', video: '1oHPcVuqa5E', source: 'https://www.youtube.com/watch?v=1oHPcVuqa5E' },
};

export function DoorMusic({ room }: { room: Room }) {
  const [open, setOpen] = useState(false);
  const track = tracks[room];
  useEffect(() => {
    setOpen(false);
    if (getState().music) sound.setMusic(true);
  }, [room]);
  if (!track) return null;
  return (
    <aside className={styles.dock} aria-label="კარის ქართული მუსიკა">
      <button type="button" className={styles.toggle} onClick={() => {
        if (!open) sound.setMusic(false);
        else if (getState().music) sound.setMusic(true);
        setOpen(!open);
      }}>
        {open ? '♫ მუსიკის დახურვა' : '♫ ქართული მუსიკის მოსმენა'}
      </button>
      {open && <div className={styles.panel}>
        <strong>{track.title}</strong>
        {track.video ? (
          <iframe
            title={track.title}
            src={`https://www.youtube-nocookie.com/embed/${track.video}?autoplay=1&playsinline=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : <audio src={track.audio} controls autoPlay loop />}
        <a href={track.source} target="_blank" rel="noopener noreferrer">წყაროს გახსნა ↗</a>
        <small>თუ დაკვრა დაიბლოკა, დააჭირე Play-ს ან გახსენი წყარო.</small>
      </div>}
    </aside>
  );
}
