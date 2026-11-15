/** Opt-in production diagnostics: open the game with ?debugGame=1#/game and inspect Safari console. */
export function debugGame(event: string, details?: unknown) {
  if (typeof window === 'undefined') return;
  if (new URLSearchParams(window.location.search).get('debugGame') !== '1') return;
  console.info('[dedaena-game]', event, details ?? '');
}
