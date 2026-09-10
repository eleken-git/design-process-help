import { Button, Card } from '@/components';
import { NotificationRow } from './components/NotificationRow';
import styles from './Settings.module.css';

export function Settings() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      <Card title="Сповіщення">
        <NotificationRow label="Email про нові замовлення" enabled />
        <NotificationRow label="Push про повернення" enabled={false} />
        <NotificationRow label="Щотижневий звіт" enabled />

        <div className={styles.actions}>
          <Button variant="secondary">Скасувати</Button>
          {/* Без size → дефолт md. PR #12 цю кнопку не зачепив. */}
          <Button>Зберегти</Button>
        </div>
      </Card>
    </main>
  );
}
