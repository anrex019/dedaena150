import { useEffect, useState } from 'react';
import { useStore } from './store';

function systemReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion() {
  const motion = useStore().motion;
  const [system, setSystem] = useState(systemReduced);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSystem(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  if (motion === 'reduce') return true;
  if (motion === 'full') return false;
  return system;
}
