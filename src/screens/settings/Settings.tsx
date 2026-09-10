import { useState } from 'react';
import { Badge, Button, Card, CodeHint } from '@/components';
import { SettingRow } from './components/SettingRow';
import styles from './Settings.module.css';

const team = [
  { name: 'Марія Литвин', email: 'maria@nimbus.app', role: 'Owner', tone: 'done' as const },
  { name: 'Олег Ткаченко', email: 'oleh@nimbus.app', role: 'Designer', tone: 'accent' as const },
  { name: 'Ірина Бойко', email: 'iryna@nimbus.app', role: 'Developer', tone: 'neutral' as const },
];

export function Settings() {
  const [notify, setNotify] = useState({ orders: true, failures: true, digest: false });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      <Card title="Сповіщення">
        <SettingRow
          label="Нові оплати"
          description="Лист на пошту, коли клієнт оформлює або продовжує план"
          checked={notify.orders}
          onChange={(v) => setNotify({ ...notify, orders: v })}
        />
        <SettingRow
          label="Невдалі платежі"
          description="Push у той самий момент, коли картку відхилено"
          checked={notify.failures}
          onChange={(v) => setNotify({ ...notify, failures: v })}
        />
        <SettingRow
          label="Щотижневий дайджест"
          description="Підсумок метрик щопонеділка о 9:00"
          checked={notify.digest}
          onChange={(v) => setNotify({ ...notify, digest: v })}
        />
      </Card>

      <Card
        title="Команда"
        actions={
          <Button variant="secondary" size="sm">
            Запросити
          </Button>
        }
      >
        <ul className={styles.team}>
          {team.map((m) => (
            <li key={m.email} className={styles.member}>
              <span className={styles.avatar} aria-hidden="true">
                {m.name[0]}
              </span>
              <span className={styles.who}>
                <span>{m.name}</span>
                <span className={styles.email}>{m.email}</span>
              </span>
              <Badge tone={m.tone}>{m.role}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <div className={styles.footer}>
        <Button variant="secondary">Скасувати</Button>
        {/* Без size → дефолт md. PR #12 цю кнопку не зачепив. */}
        <Button>Зберегти</Button>
      </div>

      <CodeHint folder="src/screens/settings" branch="feat/settings-*" />
    </div>
  );
}
