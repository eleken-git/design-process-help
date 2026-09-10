import styles from './CodeHint.module.css';

type CodeHintProps = {
  /** Папка екрана, напр. 'src/screens/dashboard' */
  folder: string;
  /** Шаблон назви гілки, напр. 'feat/dashboard-*' */
  branch: string;
};

/**
 * Навчальна підказка внизу кожного екрана: де лежить код і як назвати гілку.
 * Спільний компонент, бо потрібен трьом екранам («правило двох»).
 */
export function CodeHint({ folder, branch }: CodeHintProps) {
  return (
    <p className={styles.hint}>
      <span className={styles.k}>код</span> {folder}/
      <span className={styles.sep}>·</span>
      <span className={styles.k}>гілка</span> {branch}
      <span className={styles.sep}>·</span>
      змінюй сміливо — інші екрани це не зачепить
    </p>
  );
}
