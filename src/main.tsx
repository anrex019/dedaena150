import { createRoot } from 'react-dom/client';
import { App } from './App';
import { getState, subscribe } from './lib/store';
import { sound } from './lib/sound';
import './styles/global.scss';
import '@fontsource/noto-sans-georgian/400.css';
import '@fontsource/noto-sans-georgian/600.css';
import '@fontsource/noto-sans-georgian/700.css';
import '@fontsource/noto-serif-georgian/700.css';

sound.attachVisibility(() => getState().music);

subscribe(() => {
  const next = getState();
  sound.setSfx(next.sfx);
  sound.setMusic(next.music);
});

let armed = false;
window.addEventListener('pointerdown', () => {
  void sound.unlock().then(() => {
    if (armed) return;
    armed = true;
    sound.setSfx(getState().sfx);
    sound.setMusic(getState().music);
  });
});

createRoot(document.getElementById('root')!).render(<App />);
