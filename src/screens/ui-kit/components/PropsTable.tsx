import styles from './PropsTable.module.css';

type Row = { name: string; type: string; def: string; required?: boolean; note?: string };

/**
 * Локальний компонент UI kit: таблиця пропсів під прикладами.
 * Обовʼязковий проп не має дефолту — так і показуємо в колонці «Дефолт».
 */
export function PropsTable({ rows }: { rows: Row[] }) {
  return (
    <div className={styles.scroll}>
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
              <td className={styles.name}>
                <code>{r.name}</code>
              </td>
              <td className={styles.type}>
                <code>{r.type}</code>
              </td>
              <td className={styles.def}>
                {r.required ? <span className={styles.required}>обовʼязковий</span> : <code>{r.def}</code>}
              </td>
              <td className={styles.note}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
