import { useState } from 'react';
import { Badge, Button, Card, CodeHint, Logo, Toggle } from '@/components';
import { Canvas, Specimen } from './components/Canvas';
import { KitNav, type NavGroup } from './components/KitNav';
import { PropsTable } from './components/PropsTable';
import { Section } from './components/Section';
import { ColorGroup, RadiusScale, SpaceScale, TypeScale } from './components/Tokens';
import styles from './UiKit.module.css';

const nav: NavGroup[] = [
  {
    title: 'Основа',
    items: [
      { id: 'logo', label: 'Логотип' },
      { id: 'colors', label: 'Кольори' },
      { id: 'type', label: 'Шрифти' },
      { id: 'space', label: 'Відступи' },
      { id: 'radius', label: 'Радіуси' },
    ],
  },
  {
    title: 'Компоненти',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'badge', label: 'Badge' },
      { id: 'toggle', label: 'Toggle' },
      { id: 'card', label: 'Card' },
      { id: 'codehint', label: 'CodeHint' },
    ],
  },
];

const colorGroups = [
  { title: 'Поверхні', tokens: ['--color-bg', '--color-surface', '--color-inset'] },
  { title: 'Межі', tokens: ['--color-border', '--color-border-muted'] },
  { title: 'Текст', tokens: ['--color-text', '--color-text-muted', '--color-text-faint'] },
  { title: 'Дія', tokens: ['--color-action', '--color-action-hover', '--color-on-action'] },
  {
    title: 'Статуси й акценти',
    tokens: ['--color-accent', '--color-success', '--color-attention', '--color-danger', '--color-done', '--color-tab-active'],
  },
];

const fontTokens = [
  '--font-display',
  '--font-heading-lg',
  '--font-heading-md',
  '--font-body-md-semibold',
  '--font-body-md',
  '--font-body-sm-semibold',
  '--font-body-sm',
  '--font-mono-sm',
];

const spaceTokens = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-8'];
const radiusTokens = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-full'];

/**
 * Бібліотека компонентів. Відкривається як #/ui-kit, клієнт її не бачить.
 * Кожен варіант кожного спільного компонента — тут, разом із токенами, з яких він зібраний.
 * Ревʼюер PR у src/components дивиться на цей екран замість того, щоб шукати кнопки по всьому продукту.
 */
export function UiKit() {
  const [on, setOn] = useState(true);

  return (
    <div className={styles.page}>
      <KitNav groups={nav} />

      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>UI kit</h1>
          <p className={styles.subtitle}>
            Спільні компоненти з <code>src/components</code> у всіх станах і токени з <code>src/tokens</code>, з яких
            вони зібрані. Змінив компонент — відкрий цей екран і додай скриншот у PR.
          </p>
        </header>

        <Section
          id="logo"
          title="Логотип"
          description={
            <>
              Монограма N: мʼякі плечі зверху — хмара, рівна основа знизу. Один колір <code>--color-text</code>, без
              плитки й градієнта. У топбарі — разом із назвою, масштабується від 16 px.
            </>
          }
        >
          <Canvas>
            <Specimen caption="size={16}">
              <Logo size={16} />
            </Specimen>
            <Specimen caption="дефолт, 24">
              <Logo />
            </Specimen>
            <Specimen caption="size={32}">
              <Logo size={32} />
            </Specimen>
            <Specimen caption="size={48}">
              <Logo size={48} />
            </Specimen>
            <Specimen caption="size={64}">
              <Logo size={64} />
            </Specimen>
            <Specimen caption="name">
              <Logo name />
            </Specimen>
          </Canvas>
          <PropsTable
            rows={[
              { name: 'size', type: 'number', def: '24', note: 'розмір знака в пікселях' },
              { name: 'name', type: 'boolean', def: 'false', note: 'показати назву «Nimbus» поруч' },
            ]}
          />
        </Section>

        <Section
          id="colors"
          title="Кольори"
          description={
            <>
              Семантичні токени з <code>src/tokens/colors.css</code>. Компонент бере колір за роллю, а не за відтінком:
              кнопка — <code>--color-action</code>, не «зелений».
            </>
          }
        >
          <Canvas layout="stack">
            {colorGroups.map((g) => (
              <ColorGroup key={g.title} title={g.title} tokens={g.tokens} />
            ))}
          </Canvas>
        </Section>

        <Section
          id="type"
          title="Шрифти"
          description={
            <>
              Готові пари розмір і висота рядка з <code>src/tokens/typography.css</code>. Пишеться одним рядком:{' '}
              <code>font: var(--font-body-md)</code>.
            </>
          }
        >
          <Canvas layout="stack">
            <TypeScale tokens={fontTokens} text="Огляд за останні 30 днів" />
          </Canvas>
        </Section>

        <Section
          id="space"
          title="Відступи"
          description="Крок 4 px. Між елементами всередині компонента — 1–3, між компонентами — 4–6, між розділами екрана — 8."
        >
          <Canvas layout="stack">
            <SpaceScale tokens={spaceTokens} />
          </Canvas>
        </Section>

        <Section
          id="radius"
          title="Радіуси"
          description="sm — дрібні елементи всередині компонентів, md — кнопки й поля, lg — картки, full — бейджі й перемикачі."
        >
          <Canvas>
            <RadiusScale tokens={radiusTokens} />
          </Canvas>
        </Section>

        <Section
          id="button"
          title="Button"
          description="Одна головна дія на екран — primary, решта — secondary. Розмір sm — для панелей інструментів і заголовків карток."
        >
          <Canvas>
            <Specimen caption="дефолт">
              <Button>Зберегти</Button>
            </Specimen>
            <Specimen caption='variant="secondary"'>
              <Button variant="secondary">Скасувати</Button>
            </Specimen>
            <Specimen caption='size="sm"'>
              <Button size="sm">Новий звіт</Button>
            </Specimen>
            <Specimen caption='variant="secondary" size="sm"'>
              <Button variant="secondary" size="sm">
                Експорт CSV
              </Button>
            </Specimen>
            <Specimen caption="disabled">
              <Button disabled>Зберегти</Button>
            </Specimen>
          </Canvas>
          <PropsTable
            rows={[
              { name: 'variant', type: "'primary' | 'secondary'", def: "'primary'" },
              { name: 'size', type: "'md' | 'sm'", def: "'md'", note: 'додано в PR #12, дефолт = стара поведінка' },
              { name: 'disabled', type: 'boolean', def: 'false' },
            ]}
          />
        </Section>

        <Section
          id="badge"
          title="Badge"
          description="Статус або категорія в одне-два слова. Тон — за змістом події, не для прикраси."
        >
          <Canvas>
            <Specimen caption="дефолт">
              <Badge>система</Badge>
            </Specimen>
            <Specimen caption='tone="success"'>
              <Badge tone="success">оплата</Badge>
            </Specimen>
            <Specimen caption='tone="accent"'>
              <Badge tone="accent">реєстрація</Badge>
            </Specimen>
            <Specimen caption='tone="attention"'>
              <Badge tone="attention">очікує</Badge>
            </Specimen>
            <Specimen caption='tone="danger"'>
              <Badge tone="danger">відхилено</Badge>
            </Specimen>
            <Specimen caption='tone="done"'>
              <Badge tone="done">апгрейд</Badge>
            </Specimen>
          </Canvas>
          <PropsTable
            rows={[
              {
                name: 'tone',
                type: "'neutral' | 'success' | 'accent' | 'attention' | 'danger' | 'done'",
                def: "'neutral'",
              },
            ]}
          />
        </Section>

        <Section
          id="toggle"
          title="Toggle"
          description="Налаштування, яке вмикається одразу, без кнопки «Зберегти». Видимий підпис рендерить екран, label — для скрінрідера."
        >
          <Canvas>
            <Specimen caption="checked, інтерактивний">
              <Toggle checked={on} onChange={setOn} label="Приклад перемикача" />
            </Specimen>
            <Specimen caption="disabled">
              <Toggle checked={false} onChange={() => undefined} label="Вимкнено" disabled />
            </Specimen>
            <Specimen caption="checked disabled">
              <Toggle checked onChange={() => undefined} label="Увімкнено, заблоковано" disabled />
            </Specimen>
          </Canvas>
          <PropsTable
            rows={[
              { name: 'checked', type: 'boolean', def: '—', required: true },
              { name: 'onChange', type: '(checked: boolean) => void', def: '—', required: true },
              { name: 'label', type: 'string', def: '—', required: true, note: 'для скрінрідера' },
              { name: 'disabled', type: 'boolean', def: 'false' },
            ]}
          />
        </Section>

        <Section
          id="card"
          title="Card"
          description="Контейнер для одного блоку контенту. Заголовок і слот actions праворуч — необовʼязкові: без них лишається просто рамка з відступами."
        >
          <Canvas layout="grid">
            <Specimen caption="дефолт">
              <Card>Без заголовка — тільки контент.</Card>
            </Specimen>
            <Specimen caption="title, actions">
              <Card title="Останні події" actions={<Badge tone="accent">5 нових</Badge>}>
                Заголовок, слот <code>actions</code> праворуч, контент.
              </Card>
            </Specimen>
          </Canvas>
          <PropsTable
            rows={[
              { name: 'title', type: 'string', def: '—' },
              { name: 'actions', type: 'ReactNode', def: '—', note: 'кнопки або бейджі праворуч від заголовка' },
            ]}
          />
        </Section>

        <Section
          id="codehint"
          title="CodeHint"
          description="Навчальна підказка внизу кожного екрана: де лежить його код і як назвати гілку."
        >
          <Canvas layout="stack">
            <Specimen caption="folder, branch">
              <CodeHint folder="src/screens/<екран>" branch="feat/<екран>-*" />
            </Specimen>
          </Canvas>
          <PropsTable
            rows={[
              { name: 'folder', type: 'string', def: '—', required: true, note: "папка екрана, напр. 'src/screens/dashboard'" },
              { name: 'branch', type: 'string', def: '—', required: true, note: "шаблон назви гілки, напр. 'feat/dashboard-*'" },
            ]}
          />
        </Section>

        <CodeHint folder="src/screens/ui-kit" branch="ds/* разом зі зміною компонента" />
      </div>
    </div>
  );
}
