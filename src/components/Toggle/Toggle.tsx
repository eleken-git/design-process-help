import styles from './Toggle.module.css';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Підпис для скрінрідера; видимий текст рендерить екран. */
  label: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`${styles.toggle} ${checked ? styles.on : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  );
}
