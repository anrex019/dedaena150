import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Feather, Heart, Shield, Sparkles, Sprout } from 'lucide-react';
import { motto, students } from '../../data/students';
import { go } from '../../lib/route';
import { sound } from '../../lib/sound';
import { addLetter, clearLetters, completeWorld, seeFutureMission, useStore } from '../../lib/store';
import styles from './FutureWorld.module.scss';

interface Props { reduced: boolean; }

const intro = [
  'ძვირფასო ბავშვებო 2126 წლის საქართველოდან.',
  'დღეს, 2026 წელს, „დედა ენის“ პირველი გამოცემიდან 150 წელი გავიდა. ეს წიგნი პირველად 1876 წელს დაიბეჭდა. ჩვენ, დაბა ლაითურის საჯარო სკოლის VIII კლასის მოსწავლეები — ბეგი დიასამიძე, შაკო გოგიტიძე და გიორგი დუმბაძე — გწერთ ამ წერილს. გვინდა, რომ ქართული ენა და ჩვენი სიტყვა 2126 წელსაც ცოცხალი, ძვირფასი და მომავალი თაობებისთვის საამაყო იყოს.',
  'ეს არის სიმბოლური გზავნილი მომავალი თაობებისთვის.',
];

const missions = [
  {
    id: 'keep',
    title: 'ენის შენარჩუნება',
    body: 'ჩვენ, დაბა ლაითურის საჯარო სკოლის VIII კლასის მოსწავლეები — ბეგი დიასამიძე, შაკო გოგიტიძე და გიორგი დუმბაძე — გვჯერა, რომ ქართული ენა ჩვენი ყველაზე ძვირფასი საგანძურია. გვსურს, 2126 წელსაც ისმოდეს ქართული სიტყვა, იკითხებოდეს ქართული წიგნი და მომავალმა თაობებმა სიყვარულით შეინარჩუნონ ჩვენი დედაენა.',
    Icon: Shield,
  },
  {
    id: 'grow',
    title: 'ენის განვითარება',
    body: '„დედა ენის“ პირველი გამოცემა 1876 წელს დაიბეჭდა. 2026 წელი ამ წიგნის 150 წლისთავია. ენა მაშინ იზრდება, როცა ახალი თაობა ძველ სიტყვებს ინახავს.',
    Icon: Sprout,
  },
  {
    id: 'write',
    title: 'წერილის წერა',
    body: 'ძვირფასო ბავშვებო 2126 წლის საქართველოდან. ეს წერილი იმისთვის იწერება, რომ მომავალმა თაობამ იცოდეს: ქართული ენა ჩვენთვის საგანძური იყო.',
    Icon: Feather,
  },
  {
    id: 'love',
    title: 'ენის სიყვარული',
    body: `${motto} სიყვარული აქ იმას ნიშნავს, რომ სიტყვას ყურადღებით ვეპყრობით.`,
    Icon: Heart,
  },
  {
    id: 'ahead',
    title: 'ენა მომავალში',
    body: 'რას ვეტყოდით ბავშვებს, რომლებიც 2126 წელს ქართულად ისაუბრებენ? ეს არის სიმბოლური გზავნილი მომავალი თაობებისთვის.',
    Icon: Sparkles,
  },
] as const;

const skyLetters = ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ', 'ზ', 'თ', 'ი', 'კ', 'ლ', 'მ', 'ნ', 'ო', 'პ'];
const orbitLetters = ['ქ', 'ა', 'რ', 'თ', 'უ', 'ლ', 'ი'];

type Phase = 'write' | 'flying' | 'done';

interface Flight {
  x: number;
  y: number;
  dx: number;
  dy: number;
  mx: number;
  my: number;
  text: string;
}

export function FutureWorld({ reduced }: Props) {
  const { letters, futureSeen } = useStore();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<{ name?: string; text?: string }>({});
  const [phase, setPhase] = useState<Phase>('write');
  const [flight, setFlight] = useState<Flight | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [archive, setArchive] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const celebrateRef = useRef<HTMLDivElement>(null);
  const missionButtonRef = useRef<HTMLButtonElement | null>(null);
  const flightDone = useRef(false);
  const nameErrorId = useId();
  const textErrorId = useId();
  const mission = missions.find((item) => item.id === missionId) ?? null;
  const flying = phase === 'flying';

  useEffect(() => {
    if (!mission) return undefined;
    const node = dialogRef.current;
    node?.focus();
    const returnTo = missionButtonRef.current;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMissionId(null);
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>('button, [href], input, textarea')];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      returnTo?.focus();
    };
  }, [mission]);

  useEffect(() => {
    if (phase !== 'done') return undefined;
    const node = celebrateRef.current;
    node?.querySelector('button')?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>('button')];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase]);

  function finishFlight() {
    if (flightDone.current) return;
    flightDone.current = true;
    setPhase('done');
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (phase !== 'write') return;
    const next: { name?: string; text?: string } = {};
    if (!name.trim()) next.name = 'სახელი ჩაწერე.';
    if (!text.trim()) next.text = 'გზავნილი ცარიელი ვერ გაიგზავნება.';
    setErrors(next);
    if (next.name || next.text) {
      (next.name ? nameRef : textRef).current?.focus();
      return;
    }
    const message = text.trim();
    addLetter(name, message);
    completeWorld('future');
    sound.play('click');
    setMissionId(null);
    if (reduced) {
      setPhase('done');
      return;
    }
    const from = textRef.current?.getBoundingClientRect() ?? formRef.current?.getBoundingClientRect();
    const to = portalRef.current?.getBoundingClientRect();
    if (!from || !to) {
      setPhase('done');
      return;
    }
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const length = Math.hypot(dx, dy) || 1;
    const bend = Math.min(110, length * 0.22);
    flightDone.current = false;
    setFlight({
      x: from.left + from.width / 2,
      y: from.top + from.height / 2,
      dx,
      dy,
      mx: dx * 0.46 + (-dy / length) * bend,
      my: dy * 0.42 + (dx / length) * bend,
      text: message,
    });
    setPhase('flying');
  }

  function replay() {
    setPhase('write');
    setFlight(null);
    setName('');
    setText('');
    setErrors({});
    window.setTimeout(() => nameRef.current?.focus(), 0);
  }

  function printCertificate() {
    document.body.dataset.certificate = 'true';
    const clear = () => {
      delete document.body.dataset.certificate;
      window.removeEventListener('afterprint', clear);
    };
    window.addEventListener('afterprint', clear);
    window.print();
  }

  function openMission(id: string, button: HTMLButtonElement) {
    sound.play('click');
    missionButtonRef.current = button;
    seeFutureMission(id);
    setMissionId(id);
  }

  return (
    <section className={styles.viewport} data-phase={phase}>
      <div className={styles.flow}>
      <img className={styles.scene} src={`${import.meta.env.BASE_URL}art/future/night.jpg`} alt="" />
      <img className={styles.sky} src={`${import.meta.env.BASE_URL}art/future/night-mobile.jpg`} alt="" />
      {!reduced && skyLetters.map((mark, index) => (
        <span
          key={mark}
          className={styles.skyLetter}
          style={{
            left: index < 8 ? `${3 + (index % 4) * 4.2}%` : `${82 + (index % 4) * 3.6}%`,
            top: `${26 + (index % 5) * 10}%`,
            animationDelay: `${index * 0.35}s`,
          }}
          aria-hidden="true"
        >
          {mark}
        </span>
      ))}
      {!reduced && Array.from({ length: 10 }, (_, index) => (
        <span
          key={index}
          className={styles.spark}
          style={{
            left: index < 5 ? `${6 + index * 3}%` : `${78 + (index % 5) * 3}%`,
            top: `${30 + (index * 6) % 42}%`,
            animationDelay: `${index * 0.4}s`,
          }}
          aria-hidden="true"
        />
      ))}

      <button type="button" className={styles.back} onClick={() => { sound.play('click'); go('home'); }}>
        <ArrowLeft size={18} />
        ოთხ კართან დაბრუნება
      </button>

      <header className={styles.title}>
        <p>მეოთხე კარი · მომავალი</p>
        <h1>ქართული ენა მომავალში</h1>
        <p className={styles.lede}>რას ვეტყოდით ბავშვებს, რომლებიც 2126 წელს ქართულად ისაუბრებენ?</p>
        <p className={styles.ledePhone}>რას ეტყოდით ბავშვებს, რომლებიც 2126 წელს ქართულად ისაუბრებენ?</p>
      </header>

      <div className={styles.stage}>
        <article className={styles.book} data-glow={flying ? 'true' : 'false'}>
          <img className={styles.bookArt} src={`${import.meta.env.BASE_URL}art/future/open-book.png`} alt="" />
          <div className={`${styles.leaf} ${styles.introLeaf}`}>
            <p className={styles.kicker}>მოგზაურობა მომავალში</p>
            <h2>წერილი 2126 წელს</h2>
            {intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p className={styles.mottoLine}>{motto}</p>
          </div>
          <div className={styles.spine} aria-hidden="true" />
          <form ref={formRef} className={`${styles.leaf} ${styles.formLeaf}`} noValidate onSubmit={submit}>
            <p className={styles.kicker}>შენი გზავნილი მომავალ თაობას</p>
            <label>
              სახელი
              <input
                ref={nameRef}
                value={name}
                maxLength={40}
                autoComplete="name"
                placeholder="შეიყვანე შენი სახელი"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? nameErrorId : undefined}
                disabled={phase !== 'write'}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                }}
              />
              {errors.name && <span id={nameErrorId} className={styles.error} role="alert">{errors.name}</span>}
            </label>
            <label>
              გზავნილი
              <textarea
                ref={textRef}
                value={text}
                maxLength={280}
                placeholder="მიწერე წერილი მომავალ თაობას..."
                aria-invalid={Boolean(errors.text)}
                aria-describedby={errors.text ? textErrorId : undefined}
                disabled={phase !== 'write'}
                onChange={(event) => {
                  setText(event.target.value);
                  if (errors.text) setErrors((current) => ({ ...current, text: undefined }));
                }}
              />
              {errors.text && <span id={textErrorId} className={styles.error} role="alert">{errors.text}</span>}
            </label>
            <button type="submit" className={styles.send} disabled={phase !== 'write'}>
              გზავნილის გაგზავნა
            </button>
            <p className={styles.note}>სიმბოლური გზავნილია. ამ ბრაუზერში რჩება და ინტერნეტში არ იგზავნება.</p>
            {letters.length > 0 && phase === 'write' && (
              <button type="button" className={styles.archiveToggle} onClick={() => setArchive((open) => !open)} aria-expanded={archive}>
                ამ ბრაუზერის გზავნილები ({letters.length})
              </button>
            )}
          </form>
        </article>

        <div className={styles.portalWrap}>
          <div ref={portalRef} className={styles.portal} data-hot={flying ? 'true' : 'false'}>
            <img src={`${import.meta.env.BASE_URL}art/future/city.jpg`} alt="მომავლის ქალაქი პორტალში" />
            <span className={styles.ticks} aria-hidden="true" />
            <span className={styles.ring} />
            <span className={`${styles.ring} ${styles.ringMid}`} />
            <span className={`${styles.ring} ${styles.ringOuter}`} />
            {!reduced && orbitLetters.map((mark, index) => (
              <span
                key={mark}
                className={styles.orbit}
                style={{ ['--spin' as string]: `${index * 51}deg` }}
                aria-hidden="true"
              >
                {mark}
              </span>
            ))}
            {!reduced && Array.from({ length: 8 }, (_, index) => (
              <span
                key={index}
                className={styles.mote}
                style={{ ['--spin' as string]: `${index * 45}deg` }}
                aria-hidden="true"
              />
            ))}
            {flying && !reduced && Array.from({ length: 8 }, (_, index) => (
              <span
                key={index}
                className={styles.burst}
                style={{ ['--spin' as string]: `${index * 45 + 12}deg` }}
                aria-hidden="true"
              />
            ))}
            <p className={styles.year}>2126</p>
          </div>
        </div>
      </div>

      {archive && letters.length > 0 && phase === 'write' && (
        <div className={styles.archive}>
          <div className={styles.archiveHead}>
            <h2>ამ მოწყობილობაზე დარჩენილი გზავნილები</h2>
            <button type="button" onClick={() => { sound.play('click'); clearLetters(); setArchive(false); }}>გასუფთავება</button>
          </div>
          {letters.map((item) => (
            <blockquote key={item.id}>
              <p>„{item.text}“</p>
              <footer>{item.name}</footer>
            </blockquote>
          ))}
        </div>
      )}

      <footer className={styles.finale}>
        <p className={styles.banner}>{motto}</p>
        <ul className={styles.missions}>
          {missions.map((item, index) => {
            const seen = futureSeen.includes(item.id) || (item.id === 'keep' && futureSeen.includes('build'));
            const Icon = item.Icon;
            const open = missionId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.mission}
                  data-done={seen ? 'true' : 'false'}
                  data-open={open ? 'true' : 'false'}
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  onClick={(event) => openMission(item.id, event.currentTarget)}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{students[index]}</span>
                  <strong>{item.title}</strong>
                  {seen && <span className="sr">გახსნილია</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className={styles.caveat}>სახელები ჯერ ადგილს იკავებს და წარდგენამდე უნდა შეიცვალოს.</p>
      </footer>

      <AnimatePresence>
        {flying && flight && (
          <motion.div
            className={styles.scrollFly}
            style={{ left: flight.x, top: flight.y }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.72 }}
            animate={{
              x: [0, flight.mx, flight.dx],
              y: [0, flight.my, flight.dy],
              opacity: [0, 1, 0],
              scale: [0.72, 1, 0.22],
            }}
            transition={{ duration: 1.85, times: [0, 0.22, 1], ease: [0.42, 0, 0.2, 1] }}
            onAnimationComplete={finishFlight}
          >
            <p>{flight.text}</p>
            <span aria-hidden="true">ქ · ა · რ</span>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'done' && (
        <div className={styles.shade}>
          <div
            ref={celebrateRef}
            className={styles.celebration}
            role="dialog"
            aria-modal="true"
            aria-labelledby="future-done-title"
          >
            {!reduced && orbitLetters.map((mark, index) => (
              <span key={mark} className={styles.celebrateLetter} style={{ ['--spin' as string]: `${index * 51}deg` }} aria-hidden="true">
                {mark}
              </span>
            ))}
            <div className={styles.badge}>
              <span>დედაენა</span>
              <strong>150</strong>
            </div>
            <h2 id="future-done-title">შენი სიტყვები მომავალს მიემართება!</h2>
            <p className={styles.mottoLine}>{motto}</p>
            <p className={styles.note}>ეს სიმბოლური გზავნილია. მომავალში არ გაგზავნილა.</p>
            <div className={styles.doneActions}>
              <button type="button" onClick={() => { sound.play('click'); go('home'); }}>მთავარ გვერდზე დაბრუნება</button>
              <button type="button" onClick={replay}>თავიდან დაწყება</button>
            </div>
            <button type="button" className={styles.textButton} onClick={printCertificate}>სიგელის ბეჭდვა</button>
          </div>
        </div>
      )}

      {mission && (
        <div className={styles.shade} onMouseDown={(event) => { if (event.target === event.currentTarget) setMissionId(null); }}>
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-title"
            tabIndex={-1}
          >
            <p className={styles.kicker}>{students[missions.findIndex((item) => item.id === mission.id)]}</p>
            <h2 id="mission-title">{mission.title}</h2>
            <p>{mission.body}</p>
            <p className={styles.note}>სახელი ჯერ ადგილს იკავებს და წარდგენამდე უნდა შეიცვალოს.</p>
            <button type="button" onClick={() => setMissionId(null)}>დახურვა</button>
          </div>
        </div>
      )}

      </div>
      <section className={styles.certificate} aria-hidden="true">
        <p>სასწავლო სიგელი</p>
        <h2>{name.trim() || 'მუზეუმის სტუმარი'}</h2>
        <p>შენი სიტყვები მომავალს მიემართება!</p>
        <p>{motto}</p>
        <p>ეს სიგელი მხოლოდ ამ გვერდიდან იბეჭდება და ოფიციალური დოკუმენტი არ არის.</p>
      </section>
    </section>
  );
}
