import Phaser from 'phaser';
import { artIds, type ArtId } from '../data/words';

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  const radii = Array.isArray(r) ? r : [r, r, r, r];
  const tl = radii[0] ?? 0;
  const tr = radii[1] ?? tl;
  const br = radii[2] ?? tl;
  const bl = radii[3] ?? tl;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.arcTo(x + w, y, x + w, y + h, tr);
  ctx.arcTo(x + w, y + h, x, y + h, br);
  ctx.arcTo(x, y + h, x, y, bl);
  ctx.arcTo(x, y, x + w, y, tl);
  ctx.closePath();
}

function make(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  draw(ctx);
  return canvas;
}

function add(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement) {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, canvas);
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const ax = x + Math.cos(angle) * r;
    const ay = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(ax, ay);
    else ctx.lineTo(ax, ay);
    const inner = angle + Math.PI / 5;
    ctx.lineTo(x + Math.cos(inner) * r * 0.42, y + Math.sin(inner) * r * 0.42);
  }
  ctx.closePath();
  ctx.fill();
}

function figure(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, shirt: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.ellipse(0, 10, 9, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f0c3a0';
  ctx.beginPath();
  ctx.arc(0, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a3824';
  ctx.beginPath();
  ctx.arc(0, -9, 7, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

function drawArt(ctx: CanvasRenderingContext2D, art: ArtId) {
  ctx.clearRect(0, 0, 64, 64);
  const disc = ctx.createRadialGradient(32, 30, 4, 32, 32, 30);
  disc.addColorStop(0, 'rgba(255,248,230,0.95)');
  disc.addColorStop(1, 'rgba(255,248,230,0)');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  switch (art) {
    case 'violet': {
      ['#8d4fd0', '#b56ae0', '#6d3cb8', '#d9a6ff', '#9a5ad4'].forEach((color, i) => {
        const a = (i / 5) * Math.PI * 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(32 + Math.cos(a) * 8, 30 + Math.sin(a) * 8, 7, 11, a, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#f4d56a';
      ctx.beginPath();
      ctx.arc(32, 30, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'finger': {
      ctx.fillStyle = '#f0c3a0';
      ctx.beginPath();
      rounded(ctx, 24, 14, 10, 28, 5);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(32, 46, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c48b6a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }
    case 'mountain': {
      ctx.fillStyle = '#6e8cab';
      ctx.beginPath();
      ctx.moveTo(6, 50);
      ctx.lineTo(24, 18);
      ctx.lineTo(40, 50);
      ctx.fill();
      ctx.fillStyle = '#4f6f90';
      ctx.beginPath();
      ctx.moveTo(22, 50);
      ctx.lineTo(40, 22);
      ctx.lineTo(58, 50);
      ctx.fill();
      ctx.fillStyle = '#f7fbff';
      ctx.beginPath();
      ctx.moveTo(24, 18);
      ctx.lineTo(29, 28);
      ctx.lineTo(19, 28);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(40, 22);
      ctx.lineTo(46, 32);
      ctx.lineTo(34, 32);
      ctx.fill();
      break;
    }
    case 'sun': {
      ctx.strokeStyle = '#f0b429';
      ctx.lineWidth = 3;
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(32 + Math.cos(a) * 12, 32 + Math.sin(a) * 12);
        ctx.lineTo(32 + Math.cos(a) * 22, 32 + Math.sin(a) * 22);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd35a';
      ctx.beginPath();
      ctx.arc(32, 32, 10, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'book':
    case 'reading': {
      ctx.fillStyle = '#8c3d32';
      ctx.fillRect(14, 18, 36, 28);
      ctx.fillStyle = '#f6e7c4';
      ctx.fillRect(16, 20, 15, 24);
      ctx.fillRect(33, 20, 15, 24);
      ctx.strokeStyle = '#c45a4a';
      ctx.strokeRect(16, 20, 15, 24);
      ctx.strokeRect(33, 20, 15, 24);
      break;
    }
    case 'scroll': {
      ctx.fillStyle = '#f3ddb0';
      ctx.beginPath();
      rounded(ctx, 16, 18, 32, 28, 4);
      ctx.fill();
      ctx.fillStyle = '#c49a55';
      ctx.fillRect(16, 18, 32, 5);
      ctx.fillRect(16, 41, 32, 5);
      ctx.fillStyle = '#8a6230';
      ctx.fillRect(20, 28, 18, 2);
      ctx.fillRect(20, 33, 14, 2);
      break;
    }
    case 'mother':
      figure(ctx, 24, 34, 1.15, '#c45b78');
      figure(ctx, 40, 40, 0.82, '#f0d7a4');
      break;
    case 'father':
      figure(ctx, 32, 34, 1.25, '#3d6b8a');
      break;
    case 'house': {
      ctx.fillStyle = '#d7b48a';
      ctx.fillRect(16, 30, 32, 22);
      ctx.fillStyle = '#a33b32';
      ctx.beginPath();
      ctx.moveTo(12, 32);
      ctx.lineTo(32, 14);
      ctx.lineTo(52, 32);
      ctx.fill();
      ctx.fillStyle = '#6a4630';
      ctx.fillRect(28, 38, 8, 14);
      break;
    }
    case 'water': {
      ctx.fillStyle = '#3aa0d8';
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.bezierCurveTo(48, 28, 46, 46, 32, 52);
      ctx.bezierCurveTo(18, 46, 16, 28, 32, 10);
      ctx.fill();
      break;
    }
    case 'sky': {
      const sky = ctx.createLinearGradient(0, 12, 0, 52);
      sky.addColorStop(0, '#7eb6ef');
      sky.addColorStop(1, '#d7ecff');
      ctx.fillStyle = sky;
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#355a86';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 28);
      ctx.lineTo(26, 24);
      ctx.lineTo(32, 28);
      ctx.moveTo(36, 36);
      ctx.lineTo(42, 32);
      ctx.lineTo(48, 36);
      ctx.stroke();
      break;
    }
    case 'star':
      star(ctx, 32, 32, 16, '#ffe08a');
      break;
    case 'moon': {
      ctx.fillStyle = '#f4e7b0';
      ctx.beginPath();
      ctx.arc(30, 32, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1d2448';
      ctx.beginPath();
      ctx.arc(38, 28, 13, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'flower': {
      ctx.fillStyle = '#f2d35a';
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(32 + Math.cos(a) * 10, 32 + Math.sin(a) * 10, 6, 8, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#e07a32';
      ctx.beginPath();
      ctx.arc(32, 32, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'tree': {
      ctx.fillStyle = '#6a4630';
      ctx.fillRect(28, 36, 8, 16);
      ctx.fillStyle = '#3f8a48';
      ctx.beginPath();
      ctx.arc(32, 28, 16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'leaf': {
      ctx.fillStyle = '#3f9a4a';
      ctx.beginPath();
      ctx.ellipse(32, 32, 12, 20, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e7f6c8';
      ctx.beginPath();
      ctx.moveTo(24, 42);
      ctx.quadraticCurveTo(32, 32, 42, 20);
      ctx.stroke();
      break;
    }
    case 'bird': {
      ctx.fillStyle = '#355a86';
      ctx.beginPath();
      ctx.ellipse(34, 34, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(18, 34);
      ctx.quadraticCurveTo(28, 18, 40, 30);
      ctx.quadraticCurveTo(30, 28, 18, 34);
      ctx.fill();
      ctx.fillStyle = '#f0b429';
      ctx.beginPath();
      ctx.moveTo(44, 32);
      ctx.lineTo(52, 34);
      ctx.lineTo(44, 36);
      ctx.fill();
      break;
    }
    case 'river': {
      ctx.strokeStyle = '#3aa0d8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (const y of [24, 34, 44]) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.bezierCurveTo(22, y - 6, 40, y + 6, 54, y);
        ctx.stroke();
      }
      break;
    }
    case 'school': {
      ctx.fillStyle = '#d7c4a2';
      ctx.fillRect(12, 26, 40, 26);
      ctx.fillStyle = '#8c3d32';
      ctx.fillRect(12, 22, 40, 8);
      ctx.fillStyle = '#7eb6ef';
      ctx.fillRect(18, 34, 8, 8);
      ctx.fillRect(38, 34, 8, 8);
      ctx.fillStyle = '#6a4630';
      ctx.fillRect(28, 38, 8, 14);
      break;
    }
    case 'teacher':
      figure(ctx, 22, 38, 1.1, '#3d6b8a');
      ctx.fillStyle = '#f6e7c4';
      ctx.fillRect(36, 20, 18, 16);
      ctx.fillStyle = '#3a2a1c';
      ctx.font = '700 12px "Noto Serif Georgian", serif';
      ctx.fillText('ა', 40, 32);
      break;
    case 'pupil':
      figure(ctx, 26, 36, 1.05, '#c45b4a');
      ctx.fillStyle = '#8c3d32';
      ctx.fillRect(38, 36, 14, 10);
      ctx.fillStyle = '#f6e7c4';
      ctx.fillRect(40, 38, 10, 6);
      break;
    case 'letter':
      ctx.fillStyle = '#f6e7c4';
      ctx.beginPath();
      rounded(ctx, 14, 14, 36, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#8c3d32';
      ctx.font = '700 26px "Noto Serif Georgian", serif';
      ctx.textAlign = 'center';
      ctx.fillText('ა', 32, 40);
      break;
    case 'word':
      ctx.fillStyle = '#3a2a1c';
      ctx.font = '700 16px "Noto Serif Georgian", serif';
      ctx.textAlign = 'center';
      ctx.fillText('ა ბ გ', 32, 38);
      break;
    case 'quill': {
      ctx.strokeStyle = '#f4e7c8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 50);
      ctx.quadraticCurveTo(30, 28, 48, 12);
      ctx.stroke();
      ctx.fillStyle = '#e7c27a';
      ctx.beginPath();
      ctx.ellipse(40, 20, 8, 14, -0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'heart': {
      ctx.fillStyle = '#c43b4a';
      ctx.beginPath();
      ctx.moveTo(32, 50);
      ctx.bezierCurveTo(8, 34, 14, 14, 32, 24);
      ctx.bezierCurveTo(50, 14, 56, 34, 32, 50);
      ctx.fill();
      break;
    }
    case 'hand': {
      ctx.fillStyle = '#f0c3a0';
      ctx.beginPath();
      rounded(ctx, 22, 28, 20, 22, 6);
      ctx.fill();
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        rounded(ctx, 20 + i * 6, 12, 5, 20, 3);
        ctx.fill();
      }
      break;
    }
    case 'eye': {
      ctx.fillStyle = '#f7fbff';
      ctx.beginPath();
      ctx.ellipse(32, 32, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a2a1c';
      ctx.stroke();
      ctx.fillStyle = '#3d6b8a';
      ctx.beginPath();
      ctx.arc(32, 32, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(32, 32, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'bread': {
      ctx.fillStyle = '#e0a15a';
      ctx.beginPath();
      ctx.ellipse(32, 36, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a86b32';
      ctx.beginPath();
      ctx.moveTo(18, 34);
      ctx.quadraticCurveTo(32, 26, 46, 34);
      ctx.stroke();
      break;
    }
    case 'friends':
      figure(ctx, 22, 36, 1, '#3d6b8a');
      figure(ctx, 42, 36, 1, '#c45b4a');
      break;
    case 'homeland': {
      ctx.fillStyle = '#ffd35a';
      ctx.beginPath();
      ctx.arc(46, 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4f8a56';
      ctx.beginPath();
      ctx.moveTo(8, 50);
      ctx.lineTo(24, 28);
      ctx.lineTo(36, 50);
      ctx.fill();
      ctx.fillStyle = '#3e6f8a';
      ctx.beginPath();
      ctx.moveTo(28, 50);
      ctx.lineTo(44, 24);
      ctx.lineTo(58, 50);
      ctx.fill();
      break;
    }
    case 'flag': {
      ctx.fillStyle = '#f7fbff';
      ctx.fillRect(14, 16, 36, 24);
      ctx.fillStyle = '#c43b4a';
      ctx.fillRect(29, 16, 6, 24);
      ctx.fillRect(14, 25, 36, 6);
      for (const [x, y] of [
        [20, 19],
        [38, 19],
        [20, 34],
        [38, 34],
      ] as const) {
        ctx.fillRect(x, y, 6, 2);
        ctx.fillRect(x + 2, y - 2, 2, 6);
      }
      ctx.fillStyle = '#6a4630';
      ctx.fillRect(14, 16, 3, 34);
      break;
    }
    case 'stone': {
      ctx.fillStyle = '#8d8478';
      ctx.beginPath();
      ctx.ellipse(32, 36, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b7aea2';
      ctx.beginPath();
      ctx.ellipse(26, 32, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'door': {
      ctx.fillStyle = '#8c4b32';
      ctx.beginPath();
      rounded(ctx, 20, 14, 24, 38, [12, 12, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = '#f0d7a4';
      ctx.stroke();
      ctx.fillStyle = '#f0d7a4';
      ctx.beginPath();
      ctx.arc(38, 34, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'light': {
      ctx.fillStyle = '#f0d7a4';
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(32, 34, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e7c27a';
      ctx.beginPath();
      ctx.arc(32, 34, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6a4630';
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(32, 24);
      ctx.stroke();
      break;
    }
    case 'night': {
      ctx.fillStyle = '#1d2448';
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4e7b0';
      ctx.beginPath();
      ctx.arc(28, 30, 8, 0, Math.PI * 2);
      ctx.fill();
      star(ctx, 42, 22, 4, '#fff6d8');
      star(ctx, 44, 40, 3, '#fff6d8');
      break;
    }
    case 'morning': {
      ctx.fillStyle = '#ffd35a';
      ctx.beginPath();
      ctx.arc(32, 36, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#4f8a56';
      ctx.beginPath();
      ctx.ellipse(32, 44, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'cloud': {
      ctx.fillStyle = '#f7fbff';
      ctx.beginPath();
      ctx.arc(24, 36, 10, 0, Math.PI * 2);
      ctx.arc(36, 32, 12, 0, Math.PI * 2);
      ctx.arc(46, 38, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      const leftover: never = art;
      return leftover;
    }
  }
  return undefined;
}

function drawPlayer(pose: 'idle' | 'run1' | 'run2' | 'jump') {
  return make(64, 80, (ctx) => {
    const lift = pose === 'jump' ? -6 : 0;
    const leg = pose === 'run1' ? 8 : pose === 'run2' ? -8 : 0;
    ctx.fillStyle = '#b4333a';
    ctx.beginPath();
    ctx.moveTo(18, 30 + lift);
    ctx.quadraticCurveTo(8, 48 + lift, 16, 66);
    ctx.lineTo(28, 58 + lift);
    ctx.fill();
    ctx.fillStyle = '#f4e2bf';
    ctx.beginPath();
    rounded(ctx, 22, 32 + lift, 22, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#6a4630';
    ctx.fillRect(22, 48 + lift, 22, 4);
    ctx.fillStyle = '#6d5344';
    ctx.fillRect(26 + (pose === 'run2' ? 4 : 0), 54 + lift, 6, 14 - Math.max(0, leg));
    ctx.fillRect(36 - (pose === 'run1' ? 2 : 0), 54 + lift, 6, 14 + Math.min(0, leg));
    ctx.fillStyle = '#4a3428';
    ctx.fillRect(24, 66 + lift, 10, 5);
    ctx.fillRect(34, 66 + lift, 10, 5);
    ctx.fillStyle = '#f0c3a0';
    ctx.beginPath();
    ctx.arc(34, 24 + lift, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a3824';
    ctx.beginPath();
    ctx.arc(34, 20 + lift, 11, Math.PI, 0);
    ctx.quadraticCurveTo(34, 28 + lift, 23, 22 + lift);
    ctx.fill();
    ctx.fillStyle = '#3a2a1c';
    ctx.beginPath();
    ctx.arc(38, 24 + lift, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a86b52';
    ctx.beginPath();
    ctx.arc(39, 28 + lift, 3, 0.1, 1.2);
    ctx.stroke();
  });
}

export function paintTextures(scene: Phaser.Scene) {
  add(scene, 'pixel', make(4, 4, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 4, 4);
  }));
  add(scene, 'sky', make(32, 540, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 540);
    sky.addColorStop(0, '#6ea6e4');
    sky.addColorStop(0.55, '#b7d4f4');
    sky.addColorStop(1, '#f3d7b0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 32, 540);
  }));
  add(scene, 'moon', make(64, 64, (ctx) => {
    ctx.fillStyle = '#fff1c9';
    ctx.beginPath();
    ctx.arc(32, 32, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(24, 24, 6, 0, Math.PI * 2);
    ctx.fill();
  }));
  add(scene, 'mountains', make(800, 220, (ctx) => {
    ctx.fillStyle = '#6d7ea6';
    ctx.beginPath();
    ctx.moveTo(0, 220);
    for (let x = 0; x <= 800; x += 80) {
      ctx.lineTo(x + 20, 80 + (x % 160 === 0 ? 0 : 36));
      ctx.lineTo(x + 70, 220);
    }
    ctx.fill();
    ctx.fillStyle = '#f7fbff';
    for (let x = 0; x <= 800; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x + 20, 80);
      ctx.lineTo(x + 36, 112);
      ctx.lineTo(x + 4, 112);
      ctx.fill();
    }
  }));
  add(scene, 'hills', make(800, 180, (ctx) => {
    ctx.fillStyle = '#6ea86a';
    ctx.beginPath();
    ctx.moveTo(0, 180);
    for (let x = 0; x <= 800; x += 100) {
      ctx.quadraticCurveTo(x + 50, 40, x + 100, 120);
    }
    ctx.lineTo(800, 180);
    ctx.fill();
  }));
  add(scene, 'trees', make(700, 140, (ctx) => {
    for (let x = 20; x < 700; x += 70) {
      ctx.fillStyle = '#5b3a28';
      ctx.fillRect(x + 16, 70, 8, 50);
      ctx.fillStyle = x % 140 === 20 ? '#3f7d45' : '#4e9460';
      ctx.beginPath();
      ctx.arc(x + 20, 62, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b56ae0';
      ctx.beginPath();
      ctx.arc(x + 8, 58, 4, 0, Math.PI * 2);
      ctx.arc(x + 28, 50, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }));
  add(scene, 'ground', make(64, 72, (ctx) => {
    const stone = ctx.createLinearGradient(0, 18, 0, 72);
    stone.addColorStop(0, '#8d7b6a');
    stone.addColorStop(1, '#5c4d42');
    ctx.fillStyle = stone;
    ctx.fillRect(0, 16, 64, 56);
    ctx.strokeStyle = 'rgba(40,28,22,0.35)';
    ctx.strokeRect(3, 22, 58, 18);
    ctx.strokeRect(3, 44, 58, 20);
    const grass = ctx.createLinearGradient(0, 0, 0, 22);
    grass.addColorStop(0, '#d7ef8a');
    grass.addColorStop(1, '#4f9a45');
    ctx.fillStyle = grass;
    ctx.fillRect(0, 6, 64, 16);
    ctx.fillStyle = '#3d7c38';
    for (let i = 0; i < 8; i += 1) ctx.fillRect(4 + i * 8, 2 + (i % 3), 2, 8);
    ctx.fillStyle = '#b05cc4';
    ctx.beginPath();
    ctx.arc(16, 10, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2d35a';
    ctx.beginPath();
    ctx.arc(46, 9, 2, 0, Math.PI * 2);
    ctx.fill();
  }));
  add(scene, 'idle', drawPlayer('idle'));
  add(scene, 'run1', drawPlayer('run1'));
  add(scene, 'run2', drawPlayer('run2'));
  add(scene, 'jump', drawPlayer('jump'));
  add(scene, 'flag', make(36, 64, (ctx) => {
    ctx.fillStyle = '#6a4630';
    ctx.fillRect(6, 8, 4, 56);
    ctx.fillStyle = '#c43b4a';
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(32, 18);
    ctx.lineTo(10, 28);
    ctx.fill();
  }));
  add(scene, 'goal', make(52, 76, (ctx) => {
    ctx.fillStyle = '#6a4630';
    ctx.beginPath();
    rounded(ctx, 8, 8, 36, 64, [18, 18, 4, 4]);
    ctx.fill();
    ctx.strokeStyle = '#e7c27a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#e7c27a';
    ctx.beginPath();
    ctx.arc(36, 42, 3, 0, Math.PI * 2);
    ctx.fill();
  }));
  add(scene, 'goal-open', make(52, 76, (ctx) => {
    ctx.fillStyle = '#2a211c';
    ctx.beginPath();
    rounded(ctx, 8, 8, 36, 64, [18, 18, 4, 4]);
    ctx.fill();
    ctx.fillStyle = '#f0d7a4';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(26, 40, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#e7c27a';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 36, 64);
  }));

  for (const art of artIds) {
    add(scene, `art-${art}`, make(64, 64, (ctx) => {
      drawArt(ctx, art);
    }));
  }

  if (!scene.anims.exists('run')) {
    scene.anims.create({
      key: 'run',
      frames: [{ key: 'run1' }, { key: 'run2' }],
      frameRate: 8,
      repeat: -1,
    });
  }
}
