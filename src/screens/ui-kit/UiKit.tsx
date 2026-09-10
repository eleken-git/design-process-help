import { useState } from 'react';
import { Badge, Button, Card, CodeHint, Toggle } from '@/components';
import { PropsTable } from './components/PropsTable';
import styles from './UiKit.module.css';

/**
 * Галерея спільних компонентів. Відкривається як #/ui-kit, клієнт її не бачить.
 * Кожен варіант кожного компонента — тут. Ревʼюер PR у src/components
 * дивиться на цей екран замість того, щоб шукати кнопки по всьому продукту.
 */
export function UiKit() {
  const [on, setOn] = useState(true);

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>UI kit</h1>
        <p className={styles.subtitle}>
          Усі спільні компоненти з <code>src/components</code> у всіх станах. Змінив компонент — відкрий цей екран і
          додай скриншот у PR.
        </p>
      </header>

      <Card title="Button" actions={<Badge>src/components/Button</Badge>}>
        <div className={styles.row}>
          <Button>Primary · md</Button>
          <Button size="sm">Primary · sm</Button>
          <Button variant="secondary">Secondary · md</Button>
          <Button variant="secondary" size="sm">
            Secondary · sm
          </Button>
          <Button disabled>Disabled</Button>
        </div>
        <PropsTable
          rows={[
            { name: 'variant', type: "'primary' | 'secondary'", def: "'primary'" },
            { name: 'size', type: "'md' | 'sm'", def: "'md'", note: 'додано в PR #12, дефолт = стара поведінка' },
            { name: 'disabled', type: 'boolean', def: 'false' },
          ]}
        />
      </Card>

      <Card title="Badge" actions={<Badge>src/components/Badge</Badge>}>
        <div className={styles.row}>
          <Badge>neutral</Badge>
          <Badge tone="success">success</Badge>
          <Badge tone="accent">accent</Badge>
          <Badge tone="danger">danger</Badge>
          <Badge tone="done">done</Badge>
        </div>
        <PropsTable
          rows={[{ name: 'tone', type: "'neutral' | 'success' | 'accent' | 'danger' | 'done'", def: "'neutral'" }]}
        />
      </Card>

      <Card title="Toggle" actions={<Badge>src/components/Toggle</Badge>}>
        <div className={styles.row}>
          <Toggle checked={on} onChange={setOn} label="Приклад перемикача" />
          <Toggle checked={false} onChange={() => undefined} label="Вимкнено" disabled />
          <Toggle checked onChange={() => undefined} label="Увімкнено, заблоковано" disabled />
        </div>
        <PropsTable
          rows={[
            { name: 'checked', type: 'boolean', def: '—', note: 'обовʼязковий' },
            { name: 'onChange', type: '(checked: boolean) => void', def: '—', note: 'обовʼязковий' },
            { name: 'label', type: 'string', def: '—', note: 'для скрінрідера' },
            { name: 'disabled', type: 'boolean', def: 'false' },
          ]}
        />
      </Card>

      <Card title="Card" actions={<Badge>src/components/Card</Badge>}>
        <div className={styles.stack}>
          <Card>Без заголовка — тільки контент.</Card>
          <Card title="Із заголовком" actions={<Badge tone="success">actions</Badge>}>
            Заголовок, слот <code>actions</code> праворуч, контент.
          </Card>
        </div>
        <PropsTable
          rows={[
            { name: 'title', type: 'string', def: '—' },
            { name: 'actions', type: 'ReactNode', def: '—' },
          ]}
        />
      </Card>

      <Card title="CodeHint" actions={<Badge>src/components/CodeHint</Badge>}>
        <CodeHint folder="src/screens/<екран>" branch="feat/<екран>-*" />
        <PropsTable
          rows={[
            { name: 'folder', type: 'string', def: '—' },
            { name: 'branch', type: 'string', def: '—' },
          ]}
        />
      </Card>

      <CodeHint folder="src/screens/ui-kit" branch="ds/* разом зі зміною компонента" />
    </div>
  );
}
