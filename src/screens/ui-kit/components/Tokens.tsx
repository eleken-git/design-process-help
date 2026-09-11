import { useEffect, useRef, useState } from 'react';
import styles from './Tokens.module.css';

/**
 * Локальні компоненти UI kit для розділу «Основа»: показують токени з src/tokens.
 * Значення читаються з CSS наживо (getComputedStyle), тому нічого не дублюємо руками
 * і сторінка не застаріє, коли токен зміниться.
 */

function useTokenValue(token: string) {
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
  }, [token]);
  return value;
}

export function ColorGroup({ title, tokens }: { title: string; tokens: string[] }) {
  return (
    <div>
      <p className={styles.groupTitle}>{title}</p>
      <div className={styles.swatches}>
        {tokens.map((t) => (
          <ColorSwatch key={t} token={t} />
        ))}
      </div>
    </div>
  );
}

function ColorSwatch({ token }: { token: string }) {
  const value = useTokenValue(token);
  return (
    <div className={styles.swatch}>
      <span className={styles.color} style={{ background: `var(${token})` }} />
      <code className={styles.tokenName}>{token}</code>
      <span className={styles.tokenValue}>{value}</span>
    </div>
  );
}

export function TypeScale({ tokens, text }: { tokens: string[]; text: string }) {
  return (
    <div className={styles.typeList}>
      {tokens.map((t) => (
        <TypeSpecimen key={t} token={t} text={text} />
      ))}
    </div>
  );
}

function TypeSpecimen({ token, text }: { token: string; text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [meta, setMeta] = useState('');
  useEffect(() => {
    if (!ref.current) return;
    const s = getComputedStyle(ref.current);
    setMeta(`${s.fontWeight} ${parseFloat(s.fontSize)}/${parseFloat(s.lineHeight)}`);
  }, [token]);

  return (
    <div className={styles.type}>
      <p ref={ref} className={styles.sample} style={{ font: `var(${token})` }}>
        {text}
      </p>
      <div className={styles.typeMeta}>
        <code className={styles.tokenName}>{token}</code>
        <span className={styles.tokenValue}>{meta}</span>
      </div>
    </div>
  );
}

export function SpaceScale({ tokens }: { tokens: string[] }) {
  return (
    <div className={styles.spaceList}>
      {tokens.map((t) => (
        <SpaceBar key={t} token={t} />
      ))}
    </div>
  );
}

function SpaceBar({ token }: { token: string }) {
  const value = useTokenValue(token);
  return (
    <div className={styles.space}>
      <code className={styles.tokenName}>{token}</code>
      <span className={styles.bar} style={{ width: `var(${token})` }} />
      <span className={styles.tokenValue}>{value}</span>
    </div>
  );
}

export function RadiusScale({ tokens }: { tokens: string[] }) {
  return (
    <div className={styles.radii}>
      {tokens.map((t) => (
        <RadiusBox key={t} token={t} />
      ))}
    </div>
  );
}

function RadiusBox({ token }: { token: string }) {
  const value = useTokenValue(token);
  return (
    <div className={styles.radius}>
      <span className={styles.radiusBox} style={{ borderRadius: `var(${token})` }} />
      <code className={styles.tokenName}>{token}</code>
      <span className={styles.tokenValue}>{value}</span>
    </div>
  );
}
