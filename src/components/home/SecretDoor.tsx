import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { doors } from '../../data/doors';
import { downloadCertificate } from '../../lib/certificatePdf';
import { sound } from '../../lib/sound';
import { markGuardianSeen } from '../../lib/store';
import styles from './SecretDoor.module.scss';

const LETTERS = ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ', 'ზ', 'თ', 'ი', 'კ', 'ლ', 'მ'];
const MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

interface Props {
  mode: 'reveal' | 'chamber' | 'launcher';
  reduced: boolean;
  completedAt: string | null;
  onEnter: () => void;
  onStay: () => void;
  onClose: () => void;
}

function formatDate(value: string | null) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number, size: number, family: string) {
  let next = size;
  ctx.font = `700 ${next}px ${family}`;
  while (next > 28 && ctx.measureText(text).width > max) {
    next -= 2;
    ctx.font = `700 ${next}px ${family}`;
  }
}

async function paintCertificate(name: string, date: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('certificate');
  await document.fonts.load('700 72px "Noto Serif Georgian"');
  await document.fonts.load('400 32px "Noto Sans Georgian"');
  ctx.fillStyle = '#f4e4c4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const wash = ctx.createLinearGradient(0, 0, 0, canvas.height);
  wash.addColorStop(0, '#fff6e2');
  wash.addColorStop(1, '#e7cf9e');
  ctx.fillStyle = wash;
  ctx.fillRect(36, 36, canvas.width - 72, canvas.height - 72);
  ctx.strokeStyle = '#b8862e';
  ctx.lineWidth = 10;
  ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);
  ctx.lineWidth = 2;
  ctx.strokeRect(74, 74, canvas.width - 148, canvas.height - 148);
  ctx.strokeStyle = '#7d4ca8';
  ctx.beginPath();
  ctx.arc(160, 160, 18, 0, Math.PI * 2);
  ctx.arc(canvas.width - 160, 160, 18, 0, Math.PI * 2);
  ctx.stroke();

  const emblem = new Image();
  emblem.src = `${import.meta.env.BASE_URL}art/guardian/emblem.jpg`;
  await emblem.decode().catch(() => undefined);
  if (emblem.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 250, 92, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(emblem, canvas.width / 2 - 92, 158, 184, 184);
    ctx.restore();
  }

  ctx.fillStyle = '#6e2e28';
  ctx.textAlign = 'center';
  fit(ctx, 'ქართული ენის მცველი', 980, 68, '"Noto Serif Georgian"');
  ctx.fillText('ქართული ენის მცველი', canvas.width / 2, 430);
  ctx.fillStyle = '#8a5a18';
  ctx.font = '400 30px "Noto Sans Georgian"';
  ctx.fillText('დედაენა 150', canvas.width / 2, 490);
  ctx.fillStyle = '#3a2410';
  fit(ctx, name, 980, 56, '"Noto Serif Georgian"');
  ctx.fillText(name, canvas.width / 2, 620);
  ctx.fillStyle = '#5c4630';
  ctx.font = '400 32px "Noto Sans Georgian"';
  const lines = [
    'შენ გახდი ქართული ენის მცველი.',
    'შენ ქართული ენის ოთხივე სამყარო აღმოაჩინე.',
    'ქართული ენა ჩვენი საგანძურია — გავუფრთხილდეთ მას!',
  ];
  lines.forEach((line, index) => ctx.fillText(line, canvas.width / 2, 760 + index * 70));
  ctx.fillStyle = '#8a5a18';
  ctx.font = '400 28px "Noto Sans Georgian"';
  ctx.fillText(date, canvas.width / 2, 1080);
  ctx.fillStyle = '#6d5a48';
  ctx.font = '400 24px "Noto Sans Georgian"';
  ctx.fillText('სასწავლო სიგელი. ოფიციალური დოკუმენტი არ არის.', canvas.width / 2, 1560);
  return canvas;
}

export function SecretDoor({ mode, reduced, completedAt, onEnter, onStay, onClose }: Props) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const date = formatDate(completedAt);
  const visitor = name.trim() || 'მუზეუმის სტუმარი';

  useEffect(() => {
    if (mode !== 'reveal') return undefined;
    sound.play('secret');
    markGuardianSeen();
    return undefined;
  }, [mode]);

  useEffect(() => {
    if (mode !== 'chamber') return undefined;
    document.body.dataset.certificate = 'guardian';
    nameRef.current?.focus();
    return () => {
      if (document.body.dataset.certificate === 'guardian') delete document.body.dataset.certificate;
    };
  }, [mode]);

  async function savePdf() {
    setBusy(true);
    setError('');
    try {
      const canvas = await paintCertificate(visitor, date);
      await downloadCertificate(canvas, 'dedaena-150-guardian.pdf');
    } catch {
      setError('სიგელი ვერ შეიქმნა. სცადე თავიდან.');
    } finally {
      setBusy(false);
    }
  }

  function printSheet() {
    document.body.dataset.certificate = 'guardian';
    window.print();
  }

  if (mode === 'launcher') {
    return (
      <button type="button" className={styles.launcher} onClick={onEnter}>
        <img src={`${import.meta.env.BASE_URL}art/guardian/door.jpg`} alt="" />
        <span>საიდუმლო კარი</span>
      </button>
    );
  }

  if (mode === 'reveal') {
    return (
      <div className={styles.reveal} data-reduced={reduced ? 'true' : 'false'} role="dialog" aria-modal="true" aria-labelledby="secret-title">
        <div className={styles.dim} />
        <div className={styles.letters} aria-hidden="true">
          {LETTERS.map((letter, index) => (
            <span key={letter} style={{ '--i': index } as CSSProperties}>{letter}</span>
          ))}
        </div>
        <img className={styles.emblem} src={`${import.meta.env.BASE_URL}art/guardian/emblem.jpg`} alt="" />
        <img className={styles.door} src={`${import.meta.env.BASE_URL}art/guardian/door.jpg`} alt="ოქროს საიდუმლო კარი" />
        <h2 id="secret-title">საიდუმლო კარი გაიხსნა!</h2>
        <p>შენ ქართული ენის ოთხივე სამყარო აღმოაჩინე.</p>
        <div className={styles.actions}>
          <button type="button" onClick={onEnter}>შესვლა</button>
          <button type="button" className={styles.quiet} onClick={onStay}>მუზეუმში დარჩენა</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chamber} role="dialog" aria-modal="true" aria-labelledby="guardian-title">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.letters} aria-hidden="true">
        {LETTERS.map((letter, index) => (
          <span key={letter} style={{ '--i': index } as CSSProperties}>{letter}</span>
        ))}
      </div>
      <img className={styles.emblem} src={`${import.meta.env.BASE_URL}art/guardian/emblem.jpg`} alt="" />
      <p className={styles.hail}>გილოცავთ!</p>
      <h2 id="guardian-title">შენ გახდი ქართული ენის მცველი!</h2>
      <ul className={styles.worlds}>
        {doors.map((door) => (
          <li key={door.id}>{door.numeral}. {door.title}</li>
        ))}
      </ul>
      <p className={styles.motto}>ქართული ენა ჩვენი საგანძურია — გავუფრთხილდეთ მას!</p>
      <form className={styles.sheet} onSubmit={(event) => event.preventDefault()}>
        <img src={`${import.meta.env.BASE_URL}art/guardian/emblem.jpg`} alt="" />
        <p className={styles.project}>დედაენა 150</p>
        <h3>ქართული ენის მცველი</h3>
        <label>
          სახელი
          <input ref={nameRef} value={name} maxLength={40} onChange={(event) => setName(event.target.value)} />
        </label>
        <p className={styles.visitor}>{visitor}</p>
        <p>შენ გახდი ქართული ენის მცველი.</p>
        <p className={styles.motto}>ქართული ენა ჩვენი საგანძურია — გავუფრთხილდეთ მას!</p>
        <p className={styles.when}>{date}</p>
        <p className={styles.note}>სასწავლო სიგელი. ოფიციალური დოკუმენტი არ არის.</p>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={savePdf} disabled={busy}>სიგელის ჩამოტვირთვა</button>
        <button type="button" onClick={printSheet}>სიგელის ბეჭდვა</button>
        <button type="button" className={styles.quiet} onClick={onClose}>მუზეუმში დაბრუნება</button>
      </div>
    </div>
  );
}
