import styles from './NotificationRow.module.css';

type NotificationRowProps = {
  label: string;
  enabled: boolean;
};

/** Локальний компонент Settings. */
export function NotificationRow({ label, enabled }: NotificationRowProps) {
  return (
    <label className={styles.row}>
      <span>{label}</span>
      <input type="checkbox" defaultChecked={enabled} />
    </label>
  );
}
