import { useId } from 'react';
import styles from './Logo.module.css';

type LogoProps = {
  /** Розмір знака в пікселях. Дефолт 24 — як у топбарі. Нижче 16 форма хмаринки губиться. */
  size?: number;
  /** Показати назву «Nimbus» праворуч від знака. */
  name?: boolean;
};

/**
 * Логотип Nimbus: хмаринка з трьох кіл на плитці з градієнтом accent → done.
 * Спільний компонент: топбар застосунку і екран UI kit («правило двох»).
 * Кольори — тільки з токенів, тому знак перефарбується разом із темою.
 */
export function Logo({ size = 24, name = false }: LogoProps) {
  const gradientId = useId();

  return (
    <span className={styles.logo}>
      <svg
        className={styles.mark}
        width={size}
        height={size}
        viewBox="0 0 32 32"
        role={name ? undefined : 'img'}
        aria-label={name ? undefined : 'Nimbus'}
        aria-hidden={name ? true : undefined}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className={styles.stopStart} />
            <stop offset="1" className={styles.stopEnd} />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
        <g className={styles.cloud}>
          <circle cx="10.5" cy="17.5" r="5" />
          <circle cx="17" cy="14" r="6.5" />
          <circle cx="22" cy="18" r="4.5" />
          <path d="M5.5 17.5V22a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4z" />
        </g>
      </svg>
      {name && <span className={styles.name}>Nimbus</span>}
    </span>
  );
}
