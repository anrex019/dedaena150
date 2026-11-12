import { useEffect, useState } from 'react';

export function findGeorgianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  return window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('ka')) ?? null;
}

export function speakGeorgian(text: string): boolean {
  const voice = findGeorgianVoice();
  if (!voice) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.92;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function useGeorgianVoice() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const check = () => setReady(Boolean(findGeorgianVoice()));
    check();
    window.speechSynthesis.addEventListener('voiceschanged', check);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check);
  }, []);
  return ready;
}
