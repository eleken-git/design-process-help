import type { ReactNode } from 'react';
import styles from './Section.module.css';

type SectionProps = {
  id: string;
  title: string;
  /** Одне-два речення: що це і коли використовувати. */
  description: ReactNode;
  children: ReactNode;
};

/** Локальний компонент UI kit: розділ з заголовком, описом і рамкою для прикладів. */
export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.head}>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.frame}>{children}</div>
    </section>
  );
}
