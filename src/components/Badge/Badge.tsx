import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeProps = {
  /** Дефолт 'neutral' — сірий. Новий tone додається як новий клас, існуючі не змінюються. */
  tone?: 'neutral' | 'success' | 'accent' | 'danger' | 'done' | 'attention';
  children: ReactNode;
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
