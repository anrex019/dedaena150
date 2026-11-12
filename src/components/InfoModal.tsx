import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { patch, useStore } from '../lib/store';
import styles from './InfoModal.module.scss';

interface Props {
  onClose: () => void;
  onReplay: () => void;
  onShowSecret?: () => void;
}

export function InfoModal({ onClose, onReplay, onShowSecret }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const motion = useStore().motion;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="დახურვა">
          <X size={18} />
        </button>
        <h2 id="info-title">დედაენა 150</h2>
        <p>ქართული სიტყვის ციფრული მუზეუმი. ოთხი კარი ერთ თავგადასავალში აერთიანებს ისტორიას, სიტყვებს, თამაშს და მომავლის წერილს.</p>
        <button type="button" className={styles.replay} onClick={onReplay}>შესავლის თავიდან ნახვა</button>
        {onShowSecret && (
          <button type="button" className={styles.replay} onClick={onShowSecret}>საიდუმლო კარის ჩვენება</button>
        )}
        <ul>
          <li>კარები იხსნება თაგვით, შეხებით ან კლავიატურის Tab და Enter ღილაკებით.</li>
          <li>თამაშში სიარული ისრებით ან A / D-ითაა, ხტომა — ზემოთ ისრით, W-ით ან გამოტოვების ღილაკით. Esc აჩერებს თამაშს.</li>
          <li>ხმა თავიდან გამორთულია. მოგზაურობის დაწყება მუსიკას ჩართავს, თუ მანამდე არ გამორთე. მუსიკა სინთეზურია — პროექტში ჩანაწერი არ დევს.</li>
          <li>სიტყვის მოსმენა მხოლოდ მაშინ ჩანს, თუ მოწყობილობაზე ქართული ხმა დგას.</li>
          <li>რჩეულები, წერილები და თამაშის პროგრესი მხოლოდ ამ ბრაუზერში ინახება.</li>
          <li>პორტრეტი და სათამაშო სურათები ნახატია. საარქივო ფოტოები პროექტში არ დევს.</li>
        </ul>
        <fieldset>
          <legend>მოძრაობა</legend>
          <div className={styles.choices}>
            {([
              ['system', 'სისტემის პარამეტრი'],
              ['reduce', 'შემცირებული'],
              ['full', 'სრული'],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={motion === id} onClick={() => patch({ motion: id })}>
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
