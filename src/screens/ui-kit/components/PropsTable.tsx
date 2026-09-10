import { Badge } from '@/components';
import styles from './PropsTable.module.css';

type Row = { name: string; type: string; def: string; required?: boolean; note?: string };

/** Локальний компонент UI kit: таблиця пропсів. Показує, що кожен проп має дефолт. */
export function PropsTable({ rows }: { rows: Row[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Проп</th>
          <th>Тип</th>
          <th>Дефолт</th>
          <th>Примітка</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <td>
              <code>{r.name}</code>
            </td>
            <td>
              <code>{r.type}</code>
            </td>
            <td>
              <code>{r.def}</code>
            </td>
            <td className={styles.note}>
              {r.required && <Badge tone="attention">обовʼязковий</Badge>}
              {r.note}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
