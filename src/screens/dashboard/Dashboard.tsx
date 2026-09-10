import { Button, Card } from '@/components';
import { StatCard } from './components/StatCard';
import styles from './Dashboard.module.css';

export function Dashboard() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        {/* size="sm" зʼявився в PR #12 (ds/button-size-sm). Дефолт md ніхто не змінював. */}
        <Button variant="secondary" size="sm">
          Експорт
        </Button>
      </header>

      <div className={styles.stats}>
        <StatCard label="Активні користувачі" value="1 284" delta="+12%" />
        <StatCard label="Замовлення" value="342" delta="+4%" />
        <StatCard label="Повернення" value="7" delta="−2" />
      </div>

      <Card title="Останні події">{/* список подій */}</Card>
    </main>
  );
}
