import type { ReactNode } from 'react';
import styles from './Canvas.module.css';

type CanvasProps = {
  /** row — інлайнові елементи в ряд; grid — блоки в кілька колонок; stack — один під одним. */
  layout?: 'row' | 'grid' | 'stack';
  children: ReactNode;
};

/** Локальний компонент UI kit: полотно, на якому лежать приклади. */
export function Canvas({ layout = 'row', children }: CanvasProps) {
  return <div className={`${styles.canvas} ${styles[layout]}`}>{children}</div>;
}

type SpecimenProps = {
  /** Пропси, що відрізняють цей екземпляр від дефолтного, напр. size="sm". */
  caption: string;
  children: ReactNode;
};

/** Один екземпляр компонента з підписом під ним — як variant у Figma. */
export function Specimen({ caption, children }: SpecimenProps) {
  return (
    <figure className={styles.specimen}>
      <div className={styles.item}>{children}</div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
