import { Toggle } from '@/components';
import styles from './SettingRow.module.css';

type SettingRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Локальний компонент Settings: підпис + опис + перемикач. */
export function SettingRow({ label, description, checked, onChange }: SettingRowProps) {
  return (
    <div className={styles.row}>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
