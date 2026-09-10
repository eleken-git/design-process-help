import { Card } from '@/components';
import styles from './StatCard.module.css';

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  /** 'up' — зелений, 'down' — червоний */
  trend: 'up' | 'down';
};

/** Локальний компонент Dashboard. Переїде в src/components, коли знадобиться другому екрану. */
export function StatCard({ label, value, delta, trend }: StatCardProps) {
  return (
    <Card>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      <p className={trend === 'up' ? styles.up : styles.down}>{delta}</p>
    </Card>
  );
}
