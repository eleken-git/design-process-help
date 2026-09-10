import { Button, Card } from '@/components';
import styles from './UiKit.module.css';

/**
 * Галерея спільних компонентів. Відкривається як /ui-kit, клієнт її не бачить.
 * Кожен варіант кожного компонента — тут. Ревʼюер PR у src/components
 * дивиться на цей екран замість того, щоб шукати кнопки по всьому продукту.
 */
export function UiKit() {
  return (
    <main className={styles.page}>
      <Card title="Button">
        <div className={styles.row}>
          <Button>Primary · md</Button>
          <Button size="sm">Primary · sm</Button>
          <Button variant="secondary">Secondary · md</Button>
          <Button variant="secondary" size="sm">
            Secondary · sm
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card title="Card">
        <Card title="Картка із заголовком">Контент картки</Card>
      </Card>
    </main>
  );
}
