import { useEffect, useState } from 'react';
import { Dashboard } from '@/screens/dashboard/Dashboard';
import { Settings } from '@/screens/settings/Settings';
import { UiKit } from '@/screens/ui-kit/UiKit';
import { Logo } from '@/components';
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
            <Logo name />
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
