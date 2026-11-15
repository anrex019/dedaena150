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
  const [view, setView] = useState<View | null>(null);

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
      setView((prev) => (prev?.width === next.width && prev.height === next.height ? prev : next));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [portrait]);

  useEffect(() => {
    const parent = host.current;
    if (!parent || !view) return undefined;
    let game: Phaser.Game | null = null;
    let cancelled = false;

    game = new Phaser.Game({
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

    const start = () => {
      if (cancelled || !game) return;
      game.scene.start('level', { levelIndex, bridge, reduced });
    };
    if (game.isBooted) start();
    else game.events.once(Phaser.Core.Events.READY, start);

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [levelIndex, bridge, reduced, view]);

  return <div ref={host} className="game-host" />;
}
