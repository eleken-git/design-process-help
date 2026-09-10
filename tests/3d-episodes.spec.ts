import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 3D-епізоди: у кожному розділі жодна плашка чи картка не лягає на текст унизу
 * і на заголовок розділу, нічого не вилазить за кадр, лінії не проходять крізь текст.
 * Кадри кожного розділу зберігаються в test-results/frames/<епізод>/ для перегляду.
 */
const BASE = 'http://127.0.0.1:8765/3d/';
const EPISODES = ['conflict', 'file-states', 'pull-request', 'protected-main'];

type Issue = { t: number; what: string };
type Probe = { issues: string[]; textTop: number | null };

const PROBE = `(T) => {
  const D = window.__deck; D.setTime(T);
  const W = innerWidth, H = innerHeight, pct = (v) => Math.round(v * 100);
  const dom = (sel) => { const e = document.querySelector(sel); if (!e) return null; const st = getComputedStyle(e);
    if (parseFloat(st.opacity) < 0.05 || st.visibility === 'hidden') return null; const b = e.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) return null; return { x0: b.left / W, x1: b.right / W, y0: b.top / H, y1: b.bottom / H }; };
  const bl = dom('.bl'), ch = dom('.chapter');
  const inter = (a, b) => a && b && a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const fmt = (b) => [pct(b.x0), pct(b.x1), pct(b.y0), pct(b.y1)].join('/');
  const toScreen = (v) => { const p = v.clone().project(D.camera); return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 }; };
  const out = [];
  D.scene.traverse((o) => {
    const m = o.material; if (!m || m.opacity < 0.2 || m.blending === THREE.AdditiveBlending) return;
    // плашки (спрайти) і картки (площини з canvas-текстурою)
    if (m.map && m.map.image && m.map.image.getContext) {
      let hw, hh;
      if (o.isSprite) { hw = o.scale.x / 2; hh = o.scale.y / 2; }
      else if (o.geometry && o.geometry.parameters && o.geometry.parameters.width) { hw = o.geometry.parameters.width / 2 * o.scale.x; hh = o.geometry.parameters.height / 2 * o.scale.y; }
      else return;
      const P = o.getWorldPosition(new THREE.Vector3()); let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
      for (const dx of [-hw, hw]) for (const dy of [-hh, hh]) { const s = toScreen(new THREE.Vector3(P.x + dx, P.y + dy, P.z)); x0 = Math.min(x0, s.x); x1 = Math.max(x1, s.x); y0 = Math.min(y0, s.y); y1 = Math.max(y1, s.y); }
      const b = { x0, x1, y0, y1 }; if (b.x1 < 0 || b.x0 > 1 || b.y1 < 0 || b.y0 > 1) return;
      const name = o.isSprite ? 'плашка' : 'картка';
      if (inter(b, bl)) out.push(name + ' ∩ текст ' + fmt(b) + ' op' + m.opacity.toFixed(2));
      if (inter(b, ch)) out.push(name + ' ∩ заголовок ' + fmt(b));
      // за межами кадру: плашки — завжди помилка; картки — якщо зрізано понад чверть і картка не пригашена (сусідні ворота на крупному плані зрізані навмисно)
      const cutX = Math.max(0, -b.x0) + Math.max(0, b.x1 - 1), cutY = Math.max(0, -b.y0) + Math.max(0, b.y1 - 1);
      const cut = Math.max(cutX / (b.x1 - b.x0), cutY / (b.y1 - b.y0));
      if (o.isSprite ? cut > 0.01 : (cut > 0.25 && m.opacity >= 0.5)) out.push(name + ' за межами кадру ' + fmt(b) + ' op' + m.opacity.toFixed(2));
      return;
    }
    // лінії (труби): точки кривої, які не відсічені площиною, не мають потрапляти в текст
    if (o.geometry && o.geometry.type === 'TubeGeometry' && bl && m.opacity >= 0.3) {
      const pts = o.geometry.parameters.path.getPoints(120); const planes = m.clippingPlanes || [];
      let hits = 0;
      for (const p of pts) { const wp = o.localToWorld(p.clone()); if (planes.some((pl) => pl.distanceToPoint(wp) < 0)) continue;
        const s = toScreen(wp); if (s.x > bl.x0 && s.x < bl.x1 && s.y > bl.y0 && s.y < bl.y1) hits++; }
      if (hits) out.push('лінія ∩ текст (' + hits + ' точок) op' + m.opacity.toFixed(2));
    }
  });
  return { issues: out.map((s) => s + (bl ? '  [текст ' + fmt(bl) + ']' : '')), textTop: bl ? pct(bl.y0) : null };
}`;

for (const ep of EPISODES) {
  test(`епізод ${ep}: без накладань у кожному розділі`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${BASE}?ep=${ep}&capture=1`);
    await page.waitForFunction(() => (window as any).__deck && (window as any).__deck.ready, null, { timeout: 60_000 });
    const beats = await page.evaluate(() => (window as any).__deck.beats.map((b: any) => ({ num: b.num, t0: b.t0, t1: b.t1 })));
    expect(beats.length).toBeGreaterThan(3);

    const dir = path.join(info.project.outputDir, 'frames', ep);
    fs.mkdirSync(dir, { recursive: true });
    const issues: Issue[] = [];
    for (const b of beats) {
      if (!b.num) continue;
      const mid = (b.t0 + b.t1) / 2;
      // камера доїжджає до розділу на t0 і рушає далі за ~2.2 с до t1 — беремо лише спокійні кадри
      const times = [b.t0 + 1.5, mid, b.t1 - 2.6].filter((t, i, arr) => t > b.t0 && t < b.t1 && arr.indexOf(t) === i && (i === 0 || t - arr[0] > 0.5));
      for (const t of times) {
        const r = (await page.evaluate(`(${PROBE})(${t})`)) as Probe;
        for (const what of r.issues) issues.push({ t: Math.round(t * 10) / 10, what });
      }
      await page.evaluate(`window.__deck.setTime(${mid})`);
      await page.screenshot({ path: path.join(dir, `${b.num}.png`) });
    }
    expect(errors, 'помилки JS на сторінці').toEqual([]);
    const report = issues.map((i) => `t=${i.t}s  ${i.what}`).join('\n');
    fs.writeFileSync(path.join(dir, 'issues.txt'), report || 'немає');
    await info.attach('накладання', { body: report || 'немає', contentType: 'text/plain' });
    expect(issues, `накладання:\n${report}`).toEqual([]);
  });
}
