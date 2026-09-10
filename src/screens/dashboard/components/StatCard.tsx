import { Card } from '@/components';
import styles from './StatCard.module.css';

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
};

/** Локальний компонент Dashboard. Переїде в src/components, коли знадобиться другому екрану. */
export function StatCard({ label, value, delta }: StatCardProps) {
  return (
    <Card>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      <p className={styles.delta}>{delta}</p>
    </Card>
  );
}
