import { useState } from 'react';
import { Badge, Button, Card, CodeHint, Toggle } from '@/components';
import { PropsTable } from './components/PropsTable';
import styles from './UiKit.module.css';

const sections = [
  { id: 'button', label: 'Button', dot: styles.dotAccent },
  { id: 'badge', label: 'Badge', dot: styles.dotDone },
  { id: 'toggle', label: 'Toggle', dot: styles.dotSuccess },
  { id: 'card', label: 'Card', dot: styles.dotOrange },
  { id: 'codehint', label: 'CodeHint', dot: styles.dotAttention },
];

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
        <span className={styles.kicker}>
          <span className={`${styles.dot} ${styles.dotAccent}`} />
          Design system · {sections.length} компонентів
        </span>
        <h1 className={styles.title}>UI kit</h1>
        <p className={styles.subtitle}>
          Усі спільні компоненти з <code>src/components</code> у всіх станах. Змінив компонент — відкрий цей екран і
          додай скриншот у PR.
        </p>
        <nav className={styles.nav} aria-label="Розділи">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles.navLink}
              onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <span className={`${styles.dot} ${s.dot}`} />
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      <div className={styles.section} id="button">
        <Card title="Button" actions={<Badge>src/components/Button</Badge>}>
          <div className={`${styles.row} ${styles.preview}`}>
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
      </div>

      <div className={styles.section} id="badge">
        <Card title="Badge" actions={<Badge>src/components/Badge</Badge>}>
          <div className={`${styles.row} ${styles.preview}`}>
            <Badge>neutral</Badge>
            <Badge tone="success">success</Badge>
            <Badge tone="accent">accent</Badge>
            <Badge tone="attention">attention</Badge>
            <Badge tone="danger">danger</Badge>
            <Badge tone="done">done</Badge>
          </div>
          <PropsTable
            rows={[
              {
                name: 'tone',
                type: "'neutral' | 'success' | 'accent' | 'attention' | 'danger' | 'done'",
                def: "'neutral'",
              },
            ]}
          />
        </Card>
      </div>

      <div className={styles.section} id="toggle">
        <Card title="Toggle" actions={<Badge>src/components/Toggle</Badge>}>
          <div className={`${styles.row} ${styles.preview}`}>
            <Toggle checked={on} onChange={setOn} label="Приклад перемикача" />
            <Toggle checked={false} onChange={() => undefined} label="Вимкнено" disabled />
            <Toggle checked onChange={() => undefined} label="Увімкнено, заблоковано" disabled />
          </div>
          <PropsTable
            rows={[
              { name: 'checked', type: 'boolean', def: '—', required: true },
              { name: 'onChange', type: '(checked: boolean) => void', def: '—', required: true },
              { name: 'label', type: 'string', def: '—', note: 'для скрінрідера' },
              { name: 'disabled', type: 'boolean', def: 'false' },
            ]}
          />
        </Card>
      </div>

      <div className={styles.section} id="card">
        <Card title="Card" actions={<Badge>src/components/Card</Badge>}>
          <div className={`${styles.stack} ${styles.preview}`}>
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
      </div>

      <div className={styles.section} id="codehint">
        <Card title="CodeHint" actions={<Badge>src/components/CodeHint</Badge>}>
          <div className={styles.preview}>
            <CodeHint folder="src/screens/<екран>" branch="feat/<екран>-*" />
          </div>
          <PropsTable
            rows={[
              { name: 'folder', type: 'string', def: '—' },
              { name: 'branch', type: 'string', def: '—' },
            ]}
          />
        </Card>
      </div>

      <CodeHint folder="src/screens/ui-kit" branch="ds/* разом зі зміною компонента" />
    </div>
  );
}
