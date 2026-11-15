import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { quiz, sources, timeline } from '../../data/history';
import { go } from '../../lib/route';
import { sound } from '../../lib/sound';
import { completeWorld } from '../../lib/store';
import styles from './HistoryWorld.module.scss';

interface Props { reduced: boolean; }

type ChapterId = 'who' | 'birth' | 'time' | 'quiz';

const chapters: { id: ChapterId; title: string; hint: string; slot: string }[] = [
  { id: 'who', title: 'ვინ იყო იაკობი?', hint: 'ცხოვრება, მოღვაწეობა და მთავარი მიღწევები', slot: styles.slotWho },
  { id: 'birth', title: 'როგორ დაიბადა „დედაენა“?', hint: 'წიგნის ისტორია, პირველი გამოცემა და მნიშვნელობა', slot: styles.slotBirth },
  { id: 'time', title: 'დროის მოგზაურობა', hint: 'მთავარი მოვლენები ქრონოლოგიურად', slot: styles.slotTime },
  { id: 'quiz', title: 'შეამოწმე შენი ცოდნა', hint: 'ვიქტორინა და სასწავლო სიგელი', slot: styles.slotQuiz },
];

function asset(file: string) {
  return `${import.meta.env.BASE_URL}art/history/${file}`;
}

function useNarrow() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia('(max-width: 860px)');
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia('(max-width: 860px)').matches,
    () => false,
  );
}

export function HistoryWorld({ reduced }: Props) {
  const narrow = useNarrow();
  const [chapter, setChapter] = useState<ChapterId | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [entered, setEntered] = useState(reduced);

  useEffect(() => {
    if (reduced) return undefined;
    const timer = window.setTimeout(() => setEntered(true), 280);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && chapter === null) setSourcesOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chapter]);

  function openChapter(id: ChapterId) {
    sound.play('open');
    setChapter(id);
    setSourcesOpen(false);
  }

  return (
    <section
      className={styles.viewport}
      data-reduced={reduced ? 'true' : 'false'}
      data-reading={chapter ? 'true' : 'false'}
    >
      <button
        type="button"
        className={styles.back}
        onClick={() => {
          sound.play('click');
          go('home');
        }}
      >
        <ArrowLeft size={18} />
        ოთხ კართან დაბრუნება
      </button>

      <div className={styles.stage}>
        <img className={styles.scene} src={asset('library.jpg')} alt="" />
        {!reduced && Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={styles.mote}
            style={{
              left: `${18 + (index * 7) % 62}%`,
              top: `${8 + (index * 5) % 28}%`,
              animationDelay: `${index * 0.4}s`,
            }}
          />
        ))}

        <header className={styles.title}>
          <p>პირველი კარი · ისტორია</p>
          <h1>იაკობ გოგებაშვილის სამყარო</h1>
          <p>პედაგოგი, რომელმაც ქართული წერა-კითხვა ბავშვის მშობლიურ ენას დაუკავშირა.</p>
        </header>

        <button type="button" className={styles.portrait} onClick={() => openChapter('who')}>
          <img
            src={asset('portrait.jpg')}
            alt="იაკობ გოგებაშვილის ისტორიული ფოტო. ავტორი ალექსანდრე როინაშვილი, თბილისი, 1899 წლამდე."
          />
          <span className={styles.plaque}>
            <strong>იაკობ გოგებაშვილი</strong>
            <span>1840–1912</span>
          </span>
        </button>

        <motion.div
          className={styles.index}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.45 }}
        >
          {chapters.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              className={`${styles.chapter} ${item.slot}`}
              onClick={() => openChapter(item.id)}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 10 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.15 + index * 0.08 }}
            >
              <strong>{item.title}</strong>
              <span>{item.hint}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {narrow && (
        <div className={styles.pocket}>
          <img className={styles.atmosphere} src={asset('library.jpg')} alt="" />
          <article className={styles.leaf}>
            <p className={styles.leafKicker}>პირველი კარი</p>
            <h1>იაკობ გოგებაშვილის სამყარო</h1>
            <div className={styles.leafIntro}>
              <img
                src={asset('portrait.jpg')}
                alt="იაკობ გოგებაშვილის ისტორიული ფოტო. ავტორი ალექსანდრე როინაშვილი, თბილისი, 1899 წლამდე."
              />
              <p>პედაგოგი, რომელმაც ქართული წერა-კითხვა ბავშვის მშობლიურ ენას დაუკავშირა.</p>
            </div>
            <nav className={styles.toc} aria-label="თავები">
              {chapters.map((item, index) => (
                <button key={item.id} type="button" onClick={() => openChapter(item.id)}>
                  <span>{['I', 'II', 'III', 'IV'][index]}</span>
                  <strong>{item.title}</strong>
                </button>
              ))}
            </nav>
          </article>
        </div>
      )}

      {chapter && (
        <BookReader
          id={chapter}
          reduced={reduced}
          onClose={() => setChapter(null)}
          onMove={openChapter}
        />
      )}

      <div className={styles.sourcesDock}>
        <button
          type="button"
          className={styles.sourcesToggle}
          aria-expanded={sourcesOpen}
          onClick={() => {
            sound.play('click');
            setSourcesOpen((open) => !open);
          }}
        >
          წყაროები
        </button>
        {sourcesOpen && (
          <ul className={styles.sources}>
            {sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer">{source.title}</a>
                <span>{source.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

interface Leaf {
  kicker?: string;
  title?: string;
  paragraphs?: string[];
  events?: { year: string; text: string }[];
  figure?: { src: string; alt: string; caption: string };
  link?: { href: string; label: string };
}

interface Spread { left: Leaf; right: Leaf; }

function pairEvents(start: number): Spread {
  const slice = timeline.slice(start, start + 4);
  return {
    left: { events: slice.slice(0, 2) },
    right: { events: slice.slice(2, 4) },
  };
}

function spreadsFor(id: ChapterId): Spread[] {
  if (id === 'who') {
    return [
      {
        left: {
          kicker: 'თავი 1',
          title: 'ვინ იყო იაკობი?',
          paragraphs: [
            'იაკობ გოგებაშვილი ქართველი პედაგოგი, მწერალი და პუბლიცისტი იყო. ეროვნული ბიბლიოთეკის ბიოგრაფიულ ლექსიკონში იგი საქართველოში სამეცნიერო პედაგოგიკის ფუძემდებლად არის მოხსენიებული.',
          ],
        },
        right: {
          title: 'ვარიანი, 1840',
          paragraphs: [
            'დაიბადა 1840 წლის 27 ოქტომბერს, ღარიბი მღვდლის ოჯახში, სოფელ ვარიანში. ვარიანი დღეს გორის მუნიციპალიტეტშია.',
            'კედლის პორტრეტი ალექსანდრე როინაშვილის ფოტოა, 1899 წლამდე. ეროვნული ბიბლიოთეკის კოლექცია, საჯარო საკუთრება.',
          ],
        },
      },
      {
        left: {
          title: 'სწავლა და მასწავლებლობა',
          paragraphs: [
            '1861 წელს თბილისის სასულიერო სემინარია დაამთავრა და სწავლა კიევში განაგრძო. 1863 წელს ჯანმრთელობის გამო დაბრუნდა.',
            '1864 წლიდან თბილისის სასულიერო სასწავლებელში ასწავლიდა, 1868 წლიდან ინსპექტორი იყო. 1874 წელს თანამდებობა ჩამოართვეს.',
          ],
        },
        right: {
          title: 'წერა-კითხვის საზოგადოება',
          paragraphs: [
            '1879–1901 წლებში ქართველთა შორის წერა-კითხვის გამავრცელებელი საზოგადოების გამგეობის წევრი იყო. მისი დაჟინებით წესდებაში ჩაიწერა, რომ საზოგადოების სკოლებში დაწყებითი სწავლება ქართულ ენაზე იქნებოდა.',
          ],
        },
      },
      {
        left: {
          title: '103 წიგნი',
          paragraphs: [
            'ეროვნული ბიბლიოთეკის ცნობით, საზოგადოებამ მისი ავტორობით 103 წიგნი დაბეჭდა, მათ შორის „დედა ენა“ 48 გამოცემად და „ბუნების კარი“ 11 გამოცემად.',
          ],
        },
        right: {
          title: '1912',
          paragraphs: [
            'თარიღები ახალ სტილს მიჰყვება. ძველი სტილით დაბადებას ზოგჯერ 15 ოქტომბერს, გარდაცვალებას კი 1 ივნისს უთითებენ.',
            'გარდაიცვალა 1912 წლის 14 ივნისს თბილისში და მთაწმინდის პანთეონშია დაკრძალული.',
          ],
        },
      },
    ];
  }
  if (id === 'birth') {
    return [
      {
        left: {
          kicker: 'თავი 2',
          figure: {
            src: asset('dedaena-1876-cover.jpg'),
            alt: '„დედა ენის“ 1876 წლის ყდა: სათაური, ქვესათაური და ჩიტის გრავიურა.',
            caption: 'ყდა. Wikimedia Commons ამ სურათს 1876 წლის გამოცემას მიაწერს.',
          },
        },
        right: {
          title: '„დედა ენა“, 1876',
          paragraphs: [
            'სრული სათაურია: „დედა ენა ანუ ანბანი და პირველი საკითხავი წიგნი სახალხო შკოლებისათვის“.',
            'პირველი, სურათებიანი გამოცემა 1876 წელს თბილისში, მელიქიშვილისა და კამპის სტამბაში დაიბეჭდა.',
          ],
        },
      },
      {
        left: {
          figure: {
            src: asset('dedaena-1876-page.jpg'),
            alt: 'სურათებიანი გვერდი თხის ილუსტრაციითა და საკითხავი ტექსტით.',
            caption: 'სურათებიანი გვერდი იმავე ფაილის აღწერით. ჩანაწერი ივერიელშია.',
          },
        },
        right: {
          title: 'ადრინდელი წიგნები',
          paragraphs: [
            'მანამდე გამოსულა „ქართული ენის ანბანი და პირველი საკითხავი წიგნი მოსწავლეთათვის“ 1865 წელს და „ბუნების კარი“ 1868 წელს. „დედა ენა“ ანბანიდან საკითხავ ტექსტამდე მიდის.',
            'პროექტის სახელში „დედაენა“ ერთ სიტყვად იწერება. 1876 წლის სათაურში კი „დედა ენა“ ორ სიტყვადაა.',
          ],
        },
      },
      {
        left: {
          title: '2013',
          paragraphs: [
            '2013 წელს სახელმძღვანელო არამატერიალური კულტურული მემკვიდრეობის ნუსხაშიც მოხვდა. ზუსტი ფორმულირება მასწავლებელმა ოფიციალურ ნუსხასთან უნდა გადაამოწმოს.',
          ],
        },
        right: {
          title: 'ჩანაწერი',
          paragraphs: ['პირველი გამოცემის ბიბლიოგრაფიული ჩანაწერი ივერიელშია დაცული.'],
          link: { href: 'https://dspace.nplg.gov.ge/handle/1234/9190', label: 'პირველი გამოცემის ჩანაწერი ივერიელში' },
        },
      },
    ];
  }
  if (id === 'time') {
    return [0, 4, 8].map((start, index) => {
      const spread = pairEvents(start);
      if (index === 0) spread.left.kicker = 'თავი 3';
      if (index === 0) spread.left.title = 'დროის მოგზაურობა';
      return spread;
    });
  }
  return [];
}

function spreadCount(id: ChapterId) {
  return id === 'quiz' ? quiz.length + 1 : spreadsFor(id).length;
}

function BookReader({
  id,
  reduced,
  onClose,
  onMove,
}: {
  id: ChapterId;
  reduced: boolean;
  onClose: () => void;
  onMove: (id: ChapterId) => void;
}) {
  const order = chapters.map((item) => item.id);
  const chapterIndex = order.indexOf(id);
  const total = spreadCount(id);
  const [page, setPage] = useState(0);
  const [seen, setSeen] = useState(id);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [name, setName] = useState('');
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const landOnEnd = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);

  if (seen !== id) {
    setSeen(id);
    setPage(landOnEnd.current ? spreadCount(id) - 1 : 0);
    setAnswers(quiz.map(() => null));
    setName('');
    setSourcesOpen(false);
    landOnEnd.current = false;
  }

  const waiting = id === 'quiz' && page < quiz.length && answers[page] === null;
  const atStart = page === 0 && chapterIndex === 0;
  const atEnd = page === total - 1 && chapterIndex === order.length - 1;

  function turn(step: 1 | -1) {
    if (step === 1 && waiting) return;
    if (step === 1 && page < total - 1) {
      setDirection(1);
      setPage((value) => value + 1);
      sound.play('click');
      return;
    }
    if (step === -1 && page > 0) {
      setDirection(-1);
      setPage((value) => value - 1);
      sound.play('click');
      return;
    }
    if (step === 1 && chapterIndex < order.length - 1) {
      setDirection(1);
      landOnEnd.current = false;
      sound.play('open');
      onMove(order[chapterIndex + 1]);
      return;
    }
    if (step === -1 && chapterIndex > 0) {
      setDirection(-1);
      landOnEnd.current = true;
      sound.play('open');
      onMove(order[chapterIndex - 1]);
    }
  }

  useEffect(() => {
    dialog.current?.focus();
  }, [id]);

  useEffect(() => {
    if (id === 'quiz' && page === quiz.length) {
      sound.play('win');
      completeWorld('history');
    }
  }, [id, page]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (event.key === 'Escape') (event.target as HTMLElement).blur();
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        if (sourcesOpen) setSourcesOpen(false);
        else onClose();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        turn(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        turn(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const leftNo = page * 2 + 1;
  const rightNo = page * 2 + 2;
  const pageTotal = total * 2;
  const spread = id === 'quiz' ? null : spreadsFor(id)[page];
  const question = id === 'quiz' && page < quiz.length ? quiz[page] : null;
  const picked = question ? answers[page] : null;
  const score = answers.filter((answer, index) => answer === quiz[index].answer).length;
  const visitor = name.trim() || 'მუზეუმის სტუმარი';

  function choose(index: number) {
    if (!question || picked !== null) return;
    sound.play(index === question.answer ? 'check' : 'hurt');
    setAnswers((current) => current.map((answer, place) => (place === page ? index : answer)));
  }

  return (
    <div
      className={styles.reader}
      role="dialog"
      aria-modal="true"
      aria-label={chapters[chapterIndex].title}
      ref={dialog}
      tabIndex={-1}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.book} data-chapter={id} data-spread={page}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${id}-${page}`}
            className={styles.pages}
            initial={reduced ? false : { rotateY: direction > 0 ? -78 : 78, opacity: 0.35 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { rotateY: direction > 0 ? 78 : -78, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 0.8, 0.3, 1] }}
            style={{ transformOrigin: direction > 0 ? 'left center' : 'right center' }}
          >
            {question && (
              <>
                <PageFace
                  folio={String(leftNo)}
                  leaf={{
                    kicker: `კითხვა ${page + 1} / ${quiz.length}`,
                    title: 'შეამოწმე შენი ცოდნა',
                    paragraphs: [
                      `ქულა ამ წუთში: ${score} / ${quiz.length}.`,
                      'აირჩიე ერთი პასუხი მარჯვენა გვერდზე. შემდეგ გვერდი პასუხის შემდეგ გადაიშლება.',
                    ],
                  }}
                />
                <div className={styles.page}>
                  <div className={styles.pageBody}>
                    <h2 id="reader-title">{question.prompt}</h2>
                    <div className={styles.options}>
                      {question.options.map((option, index) => {
                        const state = picked === null ? '' : index === question.answer ? styles.right : index === picked ? styles.wrong : '';
                        return (
                          <button key={option} type="button" className={state} onClick={() => choose(index)} disabled={picked !== null}>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {picked !== null && (
                      <p className={styles.feedback} role="status">
                        {picked === question.answer ? 'სწორია.' : `ეს პასუხი არ არის. სწორია: ${question.options[question.answer]}.`}
                      </p>
                    )}
                  </div>
                  <p className={styles.folio}>{rightNo}</p>
                </div>
              </>
            )}
            {id === 'quiz' && page === quiz.length && (
              <>
                <div className={styles.page}>
                  <div className={`${styles.pageBody} ${styles.certificate}`}>
                    <p id="reader-title">სასწავლო სიგელი</p>
                    <strong>{visitor}</strong>
                    <span>იაკობ გოგებაშვილის სამყარო</span>
                    <b>{score} / {quiz.length}</b>
                  </div>
                  <p className={styles.folio}>{leftNo}</p>
                </div>
                <div className={styles.page}>
                  <div className={styles.pageBody}>
                    <h2>სახელი სიგელზე</h2>
                    <p>სახელი მხოლოდ ამ გვერდზე ჩანს და არ ინახება.</p>
                    <label className={styles.nameField}>
                      სახელი
                      <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} />
                    </label>
                    <button
                      type="button"
                      className={styles.again}
                      onClick={() => {
                        sound.play('click');
                        setAnswers(quiz.map(() => null));
                        setName('');
                        setDirection(-1);
                        setPage(0);
                      }}
                    >
                      თავიდან
                    </button>
                  </div>
                  <p className={styles.folio}>{rightNo}</p>
                </div>
              </>
            )}
            {spread && (
              <PageFace
                leaf={{ ...spread.left, kicker: spread.left.kicker ?? `თავი ${chapterIndex + 1}` }}
                folio={String(leftNo)}
                titled
              />
            )}
            {spread && <PageFace leaf={spread.right} folio={String(rightNo)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className={styles.readerNav}>
        {sourcesOpen && (
          <ul className={styles.sources}>
            {sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer">{source.title}</a>
                <span>{source.detail}</span>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.navRow}>
          <button type="button" onClick={() => turn(-1)} disabled={atStart}>
            {page === 0 ? 'წინა თავი' : 'წინა გვერდი'}
          </button>
          <button type="button" onClick={onClose}>თავფურცელი</button>
          <p className={styles.pageMark} aria-live="polite">
            <span className={styles.spreadMark}>გვერდი {leftNo}–{rightNo} / {pageTotal}</span>
            <span className={styles.sheetMark}>ფურცელი {page + 1} / {total}</span>
            {waiting ? ' · ჯერ პასუხი აირჩიე' : ''}
          </p>
          <button
            type="button"
            className={styles.sourcesToggle}
            aria-expanded={sourcesOpen}
            onClick={() => {
              sound.play('click');
              setSourcesOpen((open) => !open);
            }}
          >
            წყაროები
          </button>
          <button type="button" onClick={() => turn(1)} disabled={atEnd || waiting}>
            {page === total - 1 ? 'შემდეგი თავი' : 'შემდეგი გვერდი'}
          </button>
        </div>
      </footer>
    </div>
  );
}

function PageFace({ leaf, folio, titled = false }: { leaf: Leaf; folio: string; titled?: boolean }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageBody}>
        {leaf.kicker && <p className={styles.kicker}>{leaf.kicker}</p>}
        {leaf.title && (titled ? <h2 id="reader-title">{leaf.title}</h2> : <h2>{leaf.title}</h2>)}
        {leaf.figure && (
          <figure className={styles.plate}>
            <img src={leaf.figure.src} alt={leaf.figure.alt} />
            <figcaption>{leaf.figure.caption}</figcaption>
          </figure>
        )}
        {leaf.paragraphs?.map((text) => <p key={text}>{text}</p>)}
        {leaf.events && (
          <ul className={styles.yearList}>
            {leaf.events.map((event) => (
              <li key={event.year}>
                <strong>{event.year}</strong>
                <span>{event.text}</span>
              </li>
            ))}
          </ul>
        )}
        {leaf.link && (
          <p><a href={leaf.link.href} target="_blank" rel="noreferrer">{leaf.link.label}</a></p>
        )}
      </div>
      <p className={styles.folio}>{folio}</p>
    </div>
  );
}
