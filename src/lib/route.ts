import { useEffect, useState } from 'react';

export type Room = 'home' | 'history' | 'words' | 'game' | 'future';

const rooms: readonly Room[] = ['home', 'history', 'words', 'game', 'future'];

export function isRoom(value: string): value is Room {
  return rooms.includes(value as Room);
}

export function readRoom(): Room {
  const raw = window.location.hash.replace(/^#\/?/, '').split(/[?#]/)[0];
  if (raw === '' || raw === 'home') return 'home';
  return isRoom(raw) ? raw : 'home';
}

export function go(room: Room) {
  const next = room === 'home' ? '#/' : `#/${room}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}

export function useRoom() {
  const [room, setRoom] = useState<Room>(() => readRoom());
  useEffect(() => {
    const onChange = () => setRoom(readRoom());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return room;
}
