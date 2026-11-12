import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { LevelScene } from './LevelScene';
import type { GameBridge } from './bridge';

interface Props {
  levelIndex: number;
  bridge: GameBridge;
  reduced: boolean;
}

export default function GameStage({ levelIndex, bridge, reduced }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = host.current;
    if (!parent) return undefined;
    let game: Phaser.Game | null = null;
    let cancelled = false;

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: 960,
      height: 540,
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
  }, [levelIndex, bridge, reduced]);

  return <div ref={host} className="game-host" />;
}
