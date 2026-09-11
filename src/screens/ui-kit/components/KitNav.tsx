import { useEffect, useMemo, useState } from 'react';
import styles from './KitNav.module.css';

export type NavGroup = { title: string; items: { id: string; label: string }[] };

/**
 * Локальний компонент UI kit: бічна навігація по розділах.
 * Прокручує до розділу без зміни хеш-роуту (#/ui-kit має лишитися) і підсвічує той,
 * що зараз на екрані.
 */
export function KitNav({ groups }: { groups: NavGroup[] }) {
  const ids = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups]);
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(ids[ids.length - 1]);
        return;
      }
      const line = window.innerHeight / 3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  const go = (id: string) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav className={styles.nav} aria-label="Розділи UI kit">
      {groups.map((g) => (
        <div key={g.title} className={styles.group}>
          <p className={styles.groupTitle}>{g.title}</p>
          {g.items.map((i) => (
            <button
              key={i.id}
              type="button"
              className={i.id === active ? `${styles.link} ${styles.active}` : styles.link}
              aria-current={i.id === active ? 'true' : undefined}
              onClick={() => go(i.id)}
            >
              {i.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
