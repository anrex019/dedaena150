import { debugGame } from './debug';
import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { LevelScene } from './LevelScene';
import type { GameBridge } from './bridge';

interface Props {
  levelIndex: number;
  bridge: GameBridge;
  reduced: boolean;
  /** Portrait phones show a narrower slice of the same 540-tall world. */
  portrait: boolean;
}

interface View { width: number; height: number; }

function portraitView(width: number, height: number): View {
  const viewW = Math.round(Math.min(900, Math.max(260, 540 * (width / height))));
  return { width: viewW, height: 540 };
}

export default function GameStage({ levelIndex, bridge, reduced, portrait }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [view, setView] = useState<View | null>(null);
  const viewRef = useRef(view);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  viewRef.current = view;

  useEffect(() => {
    const parent = host.current;
    if (!parent) return undefined;
    const apply = () => {
      if (!portrait) {
        setView((prev) => (prev?.width === 960 && prev.height === 540 ? prev : { width: 960, height: 540 }));
        return;
      }
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width < 80 || height < 80) return;
      const next = portraitView(width, height);
      // Ignore tiny Safari viewport changes caused by browser chrome and HUD layout.
      // A meaningful orientation/layout change still updates the game viewport.
      setView((prev) => (prev && Math.abs(prev.width - next.width) < 48 && prev.height === next.height ? prev : next));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [portrait]);

  const ready = view !== null;

  useEffect(() => {
    const parent = host.current;
    if (!parent || !view) return undefined;
    let cancelled = false;

    debugGame('phaser:create', { levelIndex, view });
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: view.width,
      height: view.height,
      backgroundColor: '#8ec7f2',
      banner: false,
      audio: { noAudio: true },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 1100 }, debug: false },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [LevelScene],
    });
    gameRef.current = game;

    const start = () => {
      if (cancelled) return;
      const current = viewRef.current;
      if (current && (game.scale.width !== current.width || game.scale.height !== current.height)) {
        game.scale.setGameSize(current.width, current.height);
      }
      debugGame('phaser:scene-start', { levelIndex });
      game.scene.start('level', { levelIndex, bridge, reduced: reducedRef.current });
    };
    if (game.isBooted) start();
    else game.events.once(Phaser.Core.Events.READY, start);

    return () => {
      cancelled = true;
      debugGame('phaser:destroy', { levelIndex });
      game.destroy(true);
      if (gameRef.current === game) gameRef.current = null;
    };
    // The measured size is read once, when play begins. Later HUD or Safari
    // toolbar changes must not destroy the game: that runs LevelScene.create
    // again and puts the player back on the spawn point.
  }, [levelIndex, bridge, ready]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !view || !game.isBooted) return;
    const widthChanged = Math.abs(game.scale.width - view.width) >= 48;
    const heightChanged = Math.abs(game.scale.height - view.height) >= 160;
    if (widthChanged || heightChanged) {
      debugGame('phaser:resize', { from: { width: game.scale.width, height: game.scale.height }, to: view });
      game.scale.setGameSize(view.width, view.height);
    }
    // Avoid refresh() on every minor ResizeObserver event. On iOS Safari,
    // transient toolbar/layout shifts otherwise visibly jump the camera.
  }, [view]);

  return <div ref={host} className="game-host" />;
}
