import styles from './Logo.module.css';

type LogoProps = {
  /** Розмір знака в пікселях. Дефолт 24 — як у топбарі. Нижче 16 плечі монограми зливаються. */
  size?: number;
  /** Показати назву «Nimbus» праворуч від знака. */
  name?: boolean;
};

/**
 * Логотип Nimbus — монограма N: два стовпи з мʼякими плечима зверху (хмара)
 * і рівною основою знизу. Один колір --color-text, без плитки й градієнта,
 * тому знак живе в будь-якому контексті й перефарбовується разом із темою.
 * Спільний компонент: топбар застосунку і екран UI kit («правило двох»).
 */
export function Logo({ size = 24, name = false }: LogoProps) {
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
        <path d="M5 27V9.5A4.5 4.5 0 0 1 9.5 5Q11.25 5 13.18 7.5L21 17.62V5h1.5A4.5 4.5 0 0 1 27 9.5V27h-4.5Q20.75 27 18.82 24.5L11 14.38V27Z" />
      </svg>
      {name && <span className={styles.name}>Nimbus</span>}
    </span>
  );
}
