import { useEffect, useState } from 'react';
import { Dashboard } from '@/screens/dashboard/Dashboard';
import { Settings } from '@/screens/settings/Settings';
import { UiKit } from '@/screens/ui-kit/UiKit';
import styles from './App.module.css';

/**
 * Оболонка застосунку: верхня панель і перемикання екранів за #/route.
 * Це «спільний» файл: якщо двоє одночасно змінять один рядок тут — буде конфлікт.
 */
type Route = 'dashboard' | 'settings' | 'ui-kit';

const routes: { id: Route; label: string; folder: string }[] = [
  { id: 'dashboard', label: 'Dashboard', folder: 'src/screens/dashboard' },
  { id: 'settings', label: 'Settings', folder: 'src/screens/settings' },
  { id: 'ui-kit', label: 'UI kit', folder: 'src/screens/ui-kit' },
];

function readRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return routes.some((r) => r.id === hash) ? (hash as Route) : 'dashboard';
}

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function App() {
  const route = useHashRoute();
  const current = routes.find((r) => r.id === route) ?? routes[0];

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.inner}>
          <a className={styles.brand} href="#/dashboard">
            <svg className={styles.logo} viewBox="0 0 30 22" aria-hidden="true">
              <rect x="2" y="6" width="12" height="6" rx="3" fill="var(--color-success)" />
              <circle cx="5" cy="6" r="3.5" fill="var(--color-success)" />
              <circle cx="9" cy="4.5" r="4.2" fill="var(--color-success)" />
              <circle cx="13" cy="6.5" r="3" fill="var(--color-success)" />
              <rect x="9" y="11" width="18" height="8" rx="4" fill="var(--color-accent)" />
              <circle cx="13" cy="11" r="5" fill="var(--color-accent)" />
              <circle cx="19" cy="9" r="6.2" fill="var(--color-accent)" />
              <circle cx="25" cy="12" r="4.5" fill="var(--color-accent)" />
            </svg>
            Nimbus
          </a>
          <nav className={styles.tabs} aria-label="Екрани">
            {routes.map((r) => (
              <a key={r.id} href={`#/${r.id}`} className={r.id === route ? styles.active : undefined}>
                {r.label}
              </a>
            ))}
          </nav>
          <span className={styles.path}>{current.folder}/</span>
        </div>
      </header>
      <main className={styles.inner}>
        {route === 'dashboard' && <Dashboard />}
        {route === 'settings' && <Settings />}
        {route === 'ui-kit' && <UiKit />}
      </main>
    </div>
  );
}
