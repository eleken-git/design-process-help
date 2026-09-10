import { Badge, Button, Card, CodeHint } from '@/components';
import { StatCard } from './components/StatCard';
import styles from './Dashboard.module.css';

const stats = [
  { label: 'MRR', value: '$12 480', delta: '+8%', trend: 'up' as const },
  { label: 'Активні користувачі', value: '1 284', delta: '+12%', trend: 'up' as const },
  { label: 'Відтік', value: '2,1%', delta: '−0,4 п.п.', trend: 'up' as const },
];

const events = [
  { text: 'Олена Коваль оформила план Team', tone: 'success' as const, tag: 'оплата', time: '12 хв' },
  { text: 'Новий воркспейс «Studio North»', tone: 'accent' as const, tag: 'реєстрація', time: '48 хв' },
  { text: 'Картка **** 4021 відхилена', tone: 'danger' as const, tag: 'оплата', time: '2 год' },
  { text: 'Експорт звіту за серпень завершено', tone: 'neutral' as const, tag: 'система', time: '5 год' },
  { text: 'Тариф Pro → Team для acme.co', tone: 'done' as const, tag: 'апгрейд', time: 'вчора' },
];

export function Dashboard() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Огляд за останні 30 днів</p>
        </div>
        <div className={styles.actions}>
          {/* size="sm" зʼявився в PR #12 (ds/button-size-sm). Дефолт md ніхто не змінював. */}
          <Button variant="secondary" size="sm">
            Експорт CSV
          </Button>
          <Button size="sm">Новий звіт</Button>
        </div>
      </header>

      <div className={styles.stats}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card title="Останні події" actions={<Badge tone="accent">5 нових</Badge>}>
        <ul className={styles.events}>
          {events.map((e) => (
            <li key={e.text} className={styles.event}>
              <span className={styles.eventText}>{e.text}</span>
              <Badge tone={e.tone}>{e.tag}</Badge>
              <span className={styles.time}>{e.time}</span>
            </li>
          ))}
        </ul>
      </Card>

      <CodeHint folder="src/screens/dashboard" branch="feat/dashboard-*" />
    </div>
  );
}
