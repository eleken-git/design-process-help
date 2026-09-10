/* Епізод 01 · Три стани файлу: робоча папка → кошик → коміт → GitHub */
window.EPISODES.push({
  id: 'file-states', order: 1, num: '01',
  title: 'Три стани файлу', kicker: 'Git для дизайнерів · епізод 01',
  subtitle: 'Куди дівається робота, коли ти кажеш Claude «збережи» і «запуш». І чому «я щось натиснув і воно пропало» майже неможливо.',
  music: 'episodes/file-states.mp3',
  legend: [{ color: '#D29922', text: 'робоча папка · ноутбук' }, { color: '#58A6FF', text: 'кошик · staged' }, { color: '#A371F7', text: 'локальна історія' }, { color: '#3FB950', text: 'GitHub' }],
  build(ctx) {
    const { THREE, C, HEX, mk, tex, hud } = ctx;
    const { clamp01, lerp, ease, easeOut, win, pulse } = ctx.u;

    const BEATS = [
      { id: 'intro', t0: 0, t1: 6.5, num: '', ttl: '', cap: '', term: [] },
      { id: 'work', t0: 6.5, t1: 17, num: '01', ttl: 'Робоча папка: змінено, але не збережено',
        cap: 'Аня додала картку «Відтік» у Dashboard. Файл змінився на диску — і все. В історії проєкту цього ще немає. Закрий ноутбук — файл лишиться, але git про нього «не знає».',
        term: [{ x: 'git status' }, { x: 'modified:  src/screens/dashboard/Dashboard.tsx', c: 'p' }, { x: 'untracked: notes.md', c: 'c' }] },
      { id: 'add', t0: 17, t1: 27, num: '02', ttl: 'git add: вибираємо, що піде в коміт',
        cap: '<b>Кошик</b> (staged) — це список того, що потрапить у наступний коміт. Dashboard кладемо, а <b>notes.md</b> лишаємо: нотатки в історію не потрібні. Claude робить цей вибір за назвою файлів.',
        term: [{ x: 'git add src/screens/dashboard/Dashboard.tsx' }, { x: 'Changes to be committed:', c: 'c' }, { x: '  Dashboard.tsx', c: 'ok' }, { x: 'Untracked: notes.md', c: 'c' }] },
      { id: 'commit', t0: 27, t1: 39, num: '03', ttl: 'git commit: точка збереження з підписом',
        cap: 'Усе з кошика стає <b>комітом</b> — знімком із підписом «що зроблено». Це вже безпечно: коміт не губиться, до нього можна повернутись. Як Version history у Figma, тільки підписана тобою.',
        term: [{ x: 'git commit -m "dashboard: картка відтоку"' }, { x: '[feat/dashboard-churn 3f2a1c9] dashboard: картка відтоку', c: 'ok' }, { x: ' 1 file changed, 8 insertions(+)', c: 'c' }] },
      { id: 'local', t0: 39, t1: 50, num: '04', ttl: 'Але поки що це тільки на ноутбуку Ані',
        cap: 'Коміт живе в <b>локальній історії</b>. Богдан його не бачить, GitHub про нього не знає. Якщо ноутбук зламається — коміт зникне разом із ним. Тому ще один крок.',
        term: [{ x: 'git log --oneline -1' }, { x: '3f2a1c9 dashboard: картка відтоку', c: 'p' }, { x: '# на GitHub: цього коміта немає', c: 'c' }] },
      { id: 'push', t0: 50, t1: 61, num: '05', ttl: 'git push: коміт летить на GitHub',
        cap: 'Тепер копія є на сервері. Богдан бачить коміт у гілці, з нього можна відкрити Pull Request, а ноутбук Ані може хоч згоріти.',
        term: [{ x: 'git push -u origin feat/dashboard-churn' }, { x: 'To github.com:eleken-git/design-process-help.git', c: 'c' }, { x: ' * [new branch]  feat/dashboard-churn -> feat/dashboard-churn', c: 'ok' }] },
      { id: 'loop', t0: 61, t1: 73, num: '06', ttl: 'І так по колу: змінив → зберіг → відправив',
        cap: 'Наступна правка йде тим самим шляхом за кілька секунд. Ти кажеш Claude <b>«збережи роботу»</b> — це add + commit. <b>«Відправ на GitHub»</b> — це push. Слова прості, механіка та сама.',
        term: [{ x: '# «збережи роботу»', c: 'c' }, { x: 'git add -A && git commit -m "dashboard: StatCard і нотатки"' }, { x: '# «відправ на GitHub»', c: 'c' }, { x: 'git push' }] },
      { id: 'risk', t0: 73, t1: 84, num: '07', ttl: 'Що можна втратити, а що ні',
        cap: 'Втратити можна лише те, що ще не в коміті: незбережену правку в робочій папці або в кошику. Коміт не губиться навіть після помилкових команд — git пам’ятає його в <b>reflog</b>. Пуш дає копію поза ноутбуком.',
        term: [] },
      { id: 'summary', t0: 84, t1: 92, num: '08', ttl: 'Комітити часто, пушити щодня',
        cap: 'Маленькі коміти щогодини, push у кінці кожного відрізка роботи. Тоді фраза «я щось натиснув і все пропало» перестає бути можливою.',
        term: [{ x: '# кожні годину-дві', c: 'c' }, { x: 'git add -A && git commit -m "…"', c: 'ok' }, { x: 'git push', c: 'ok' }] }
    ];
    const DUR = 92;
    const CAM = [
      { t: 0.0, p: [0.0, 1.5, 24.0], l: [0.0, -0.5, 0.0] },
      { t: 6.5, p: [-9.2, -0.4, 10.8], l: [-9.7, -1.6, 0.0] },
      { t: 17.0, p: [-4.6, -0.4, 12.5], l: [-5.6, -1.6, 0.0] },
      { t: 27.0, p: [0.4, -0.4, 12.5], l: [-0.6, -1.6, 0.0] },
      { t: 39.0, p: [5.4, -0.4, 12.5], l: [4.4, -1.6, 0.0] },
      { t: 50.0, p: [5.4, -0.4, 12.5], l: [4.4, -1.6, 0.0] },
      { t: 61.0, p: [0.6, 0.6, 19.5], l: [0.0, -1.2, 0.0] },
      { t: 73.0, p: [0.6, 0.8, 16.5], l: [0.0, -0.6, 0.0] },
      { t: 84.0, p: [0.6, 1.0, 19.0], l: [0.0, -0.9, 0.0] },
      { t: 92.0, p: [0.6, 1.0, 19.0], l: [0.0, -0.9, 0.0] }
    ];

    /* ---------- зони ---------- */
    const ZX = [-7.5, -2.5, 2.5, 7.5], ZY = -1.4;
    const ZC = [C.yellow, C.blue, C.purple, C.green];
    const zones = ZX.map((x, i) => mk.platform(x, ZY, 4.2, 2.6, ZC[i]));
    const zoneLabels = [
      mk.label('Робоча папка', 'ноутбук Ані · файли на диску', HEX(C.yellow), ZX[0], ZY - 0.8, 4.0),
      mk.label('Кошик · staged', 'що піде в наступний коміт', HEX(C.blue), ZX[1], ZY - 0.8, 4.0),
      mk.label('Локальна історія', 'коміти на ноутбуку', HEX(C.purple), ZX[2], ZY - 0.8, 4.0),
      mk.label('GitHub', 'спільний репозиторій', HEX(C.green), ZX[3], ZY - 0.8, 4.0)
    ];

    /* ---------- файли ---------- */
    const L = (n, x, o) => Object.assign({ n, x }, o || {});
    const dashCard = (badge, color, bg, mark) => tex.codeCard({
      file: 'src/screens/dashboard/Dashboard.tsx', badge, badgeColor: color, badgeBg: bg, accent: mark ? color : null,
      lines: [L(14, '<StatCard label="MRR" />', { c: HEX(C.text) }), L(15, '<StatCard label="Активні" />', { c: HEX(C.text) }),
        mark ? L(16, '<StatCard label="Відтік" />', { c: color, bold: true, bg: 'rgba(110,118,129,.14)', bar: color }) : L(16, '', {})]
    });
    const texDash0 = dashCard('без змін', HEX(C.muted), 'rgba(110,118,129,.22)', false);
    const texDash1 = dashCard('змінено', HEX(C.yellow), 'rgba(210,153,34,.16)', true);
    const texDash2 = dashCard('у кошику', HEX(C.blue), 'rgba(56,139,253,.16)', true);
    const texNotes = tex.codeCard({ file: 'notes.md', badge: 'не відстежується', badgeColor: HEX(C.muted), badgeBg: 'rgba(110,118,129,.22)',
      lines: [L(1, '# нотатки до Dashboard', { c: HEX(C.muted) }), L(2, '- перевірити відступи карток', { c: HEX(C.text) }), L(3, '- уточнити колір дельти', { c: HEX(C.text) })] });
    const texNotes2 = tex.codeCard({ file: 'notes.md', badge: 'у кошику', badgeColor: HEX(C.blue), badgeBg: 'rgba(56,139,253,.16)', accent: HEX(C.blue),
      lines: [L(1, '# нотатки до Dashboard', { c: HEX(C.muted) }), L(2, '- перевірити відступи карток', { c: HEX(C.text) }), L(3, '- уточнити колір дельти', { c: HEX(C.text) })] });
    const texStat1 = tex.codeCard({ file: 'dashboard/components/StatCard.tsx', badge: 'новий файл', badgeColor: HEX(C.yellow), badgeBg: 'rgba(210,153,34,.16)', accent: HEX(C.yellow),
      lines: [L(1, 'export function StatCard({', { c: HEX(C.text) }), L(2, '  label, value, delta', { c: HEX(C.yellow), bold: true }), L(3, '}) {', { c: HEX(C.text) })] });
    const texStat2 = tex.codeCard({ file: 'dashboard/components/StatCard.tsx', badge: 'у кошику', badgeColor: HEX(C.blue), badgeBg: 'rgba(56,139,253,.16)', accent: HEX(C.blue),
      lines: [L(1, 'export function StatCard({', { c: HEX(C.text) }), L(2, '  label, value, delta', { c: HEX(C.blue), bold: true }), L(3, '}) {', { c: HEX(C.text) })] });

    const dash = mk.card(texDash0, ZX[0] + 0.6, 0.85, 3.2);
    const notes = mk.card(texNotes, ZX[0] - 1.4, -0.55, 2.2); notes.position.z = -0.4; notes.userData.base.z = -0.4;
    const stat = mk.card(texStat1, ZX[0] + 0.9, -0.35, 2.2); stat.position.z = -0.2; stat.userData.base.z = -0.2;

    /* ---------- коміти й GitHub ---------- */
    const c1 = mk.commit(ZX[2], -0.7, C.purple, 0.28), c2 = mk.commit(ZX[2], 0.6, C.purple, 0.28);
    const g1 = mk.commit(ZX[3], -0.7, C.green, 0.28), g2 = mk.commit(ZX[3], 0.6, C.green, 0.28);
    const m1 = mk.label('dashboard: картка відтоку', null, HEX(C.purple), ZX[2], -0.7 + 0.62, 3.6, { fill: 'rgba(13,17,23,.94)' });
    const m2 = mk.label('dashboard: StatCard і нотатки', null, HEX(C.purple), ZX[2], 0.6 + 0.62, 3.8, { fill: 'rgba(13,17,23,.94)' });
    const flight = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glowTex(C.green), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    flight.scale.set(1.6, 1.6, 1); ctx.scene.add(flight);
    const ghLine = mk.tube([[ZX[2], -0.7, 0], [ZX[3], -0.7, 0]], C.green, 0.03);
    const ghLine2 = mk.tube([[ZX[2], 0.6, 0], [ZX[3], 0.6, 0]], C.green, 0.03);
    const seeCard = (lines) => tex.codeCard({ file: 'github.com · що бачить Богдан', badge: 'feat/dashboard-churn', badgeColor: HEX(C.green), badgeBg: 'rgba(46,160,67,.16)', lines });
    const texSee0 = seeCard([L(0, '— поки нічого нового', { c: HEX(C.faint) })]);
    const texSee1 = seeCard([L(0, '3f2a1c9  dashboard: картка відтоку', { c: HEX(C.green), bold: true })]);
    const texSee2 = seeCard([L(0, '8be04d1  dashboard: StatCard і нотатки', { c: HEX(C.green), bold: true }), L(0, '3f2a1c9  dashboard: картка відтоку', { c: HEX(C.text) })]);
    const see = mk.card(texSee0, ZX[3], 1.4, 3.6);

    /* ---------- ризики (розділ 07) ---------- */
    const risk = [
      mk.label('можна втратити', 'ще не в коміті', HEX(C.red), ZX[0], 2.9, 4.2),
      mk.label('можна втратити', 'ще не в коміті', HEX(C.red), ZX[1], 2.9, 4.2),
      mk.label('не загубиться', 'git reflog пам’ятає', HEX(C.green), ZX[2], 2.9, 4.2),
      mk.label('є копія на сервері', 'переживе ноутбук', HEX(C.green), ZX[3], 2.9, 4.2)
    ];

    hud.outro(['Змінив → git add → git commit → git push. Claude робить це, коли ти кажеш «збережи і запуш».',
      'Коміт — уже безпечно: він не губиться навіть після помилкових команд.',
      'Пуш щодня: копія на GitHub переживе будь-який ноутбук.']);

    const ep = { BEATS, DUR, CAM, dim: 1 };
    const setOp = (mat, v) => { mat.opacity = clamp01(v) * ep.dim; };
    const V = (x, y, z) => new THREE.Vector3(x, y, z || 0);
    /** переліт картки між точками з дугою */
    function hop(card, from, to, t, t0, t1) {
      const k = ease(win(t, t0, t1)); card.position.lerpVectors(from, to, k); card.position.y += Math.sin(k * Math.PI) * 0.9;
    }
    function flyGlow(t, t0, t1, y) {
      const k = win(t, t0, t1); const on = k > 0 && k < 1;
      flight.material.opacity = on ? 0.9 * Math.sin(k * Math.PI) ** 0.5 : 0;
      flight.position.set(lerp(ZX[2], ZX[3], ease(k)), y + Math.sin(k * Math.PI) * 1.4, 0.3);
    }

    ep.update = function (t) {
      ep.dim = 1 - 0.7 * win(t, 84.5, 86.0);
      // зони
      zones.forEach((z, i) => {
        const k = easeOut(win(t, 6.8 + i * 0.35, 7.8 + i * 0.35));
        z.top.material.opacity = 0.35 * k; z.edge.material.opacity = 0.95 * k; z.grp.scale.set(k, 1, k);
        const ZT = [6.5, 17.0, 27.0, 39.0][i];   // підпис зони з'являється, коли камера до неї доїжджає — інакше стирчить обрізаний з краю
        setOp(zoneLabels[i].material, k * win(t, ZT - 0.2, ZT + 0.8) * (1 - 0.35 * win(t, 84.5, 86)));
      });

      // Dashboard.tsx: змінено → у кошик → у коміт
      dash.material.map = t >= 19.3 ? texDash2 : (t >= 9.5 ? texDash1 : texDash0);
      const dIn = win(t, 7.6, 8.6);
      const p0 = V(ZX[0] + 0.6, 0.85), p1 = V(ZX[1], 0.85), p2 = V(ZX[2], -0.7, 0.3);
      if (t < 19.3) dash.position.copy(p0);
      else if (t < 29.6) hop(dash, p0, p1, t, 19.3, 20.9);
      else hop(dash, p1, p2, t, 29.6, 30.8);
      dash.position.y += 0.08 * Math.sin(t * 0.9);
      const dShrink = 1 - 0.85 * ease(win(t, 30.2, 30.9));
      dash.scale.setScalar((1 + 0.06 * pulse(t, 9.3, 10.3) + 0.05 * pulse(t, 19.1, 20.1)) * dShrink);
      dash.material.opacity = dIn * (1 - win(t, 30.6, 30.95)) * ep.dim;

      // notes.md і StatCard.tsx: лишаються, потім усі разом у розділі 06
      notes.material.map = t >= 64.6 ? texNotes2 : texNotes;
      stat.material.map = t >= 64.6 ? texStat2 : texStat1;
      const n0 = V(ZX[0] - 1.4, -0.55, -0.4), n1 = V(ZX[1] - 1.0, 0.45, -0.4), n2 = V(ZX[2], 0.6, 0.3);
      const s0 = V(ZX[0] + 0.9, -0.35, -0.2), s1 = V(ZX[1] + 1.0, -0.35, -0.2);
      if (t < 63.4) notes.position.copy(n0); else if (t < 66.4) hop(notes, n0, n1, t, 63.4, 64.6); else hop(notes, n1, n2, t, 66.4, 67.4);
      if (t < 63.6) stat.position.copy(s0); else if (t < 66.4) hop(stat, s0, s1, t, 63.6, 64.8); else hop(stat, s1, n2, t, 66.4, 67.4);
      const shrink2 = 1 - 0.85 * ease(win(t, 66.9, 67.45));
      notes.scale.setScalar((1 + 0.05 * pulse(t, 63.2, 64.0)) * shrink2); stat.scale.setScalar((1 + 0.05 * pulse(t, 63.4, 64.2)) * shrink2);
      notes.material.opacity = win(t, 8.2, 9.0) * (1 - win(t, 67.2, 67.5)) * ep.dim;
      stat.material.opacity = win(t, 61.6, 62.4) * (1 - win(t, 67.2, 67.5)) * ep.dim;

      // коміти
      mk.pop(c1, t, 30.8, setOp); mk.pop(c2, t, 67.5, setOp);
      setOp(m1.material, win(t, 31.4, 32.2)); setOp(m2.material, win(t, 68.0, 68.8));
      // ризик: локальний коміт пульсує жовтим у розділі 04
      { const warn = win(t, 40.5, 41.5) * (1 - win(t, 52.0, 53.0)); const beat = 0.5 + 0.5 * Math.sin(t * 4.0);
        c1.core.material.color.setHex(warn > 0.5 ? C.yellow : C.purple); c1.glow.material.color.setHex(warn > 0.5 ? C.yellow : C.purple);
        c1.glow.material.opacity = 0.5 + warn * 0.5 * beat; }
      // push: переліт і копія на GitHub
      flyGlow(t, 52.0, 53.6, -0.7); if (t >= 69.0 && t < 71.0) flyGlow(t, 69.0, 70.6, 0.6);
      mk.revealTo(ghLine, lerp(ZX[2], ZX[3] + 0.1, easeOut(win(t, 52.0, 53.6)))); setOp(ghLine.material, win(t, 52.0, 52.4) * 0.7);
      mk.revealTo(ghLine2, lerp(ZX[2], ZX[3] + 0.1, easeOut(win(t, 69.0, 70.6)))); setOp(ghLine2.material, win(t, 69.0, 69.4) * 0.7);
      mk.pop(g1, t, 53.5, setOp); mk.pop(g2, t, 70.5, setOp);

      // що бачить Богдан
      see.material.map = t >= 70.7 ? texSee2 : (t >= 53.7 ? texSee1 : texSee0);
      see.material.opacity = win(t, 40.0, 41.0) * (1 - win(t, 72.4, 73.4)) * ep.dim;
      see.position.copy(see.userData.base); see.position.y += 0.08 * Math.sin(t * 0.8 + 1) + 0.5 * (1 - easeOut(win(t, 40.0, 41.2)));
      see.scale.setScalar(1 + 0.06 * pulse(t, 53.6, 54.6) + 0.05 * pulse(t, 70.6, 71.4));

      // ризики
      risk.forEach((r, i) => { setOp(r.material, win(t, 74.0 + i * 0.5, 74.8 + i * 0.5) * (1 - win(t, 84.0, 85.0))); r.position.y = 2.9 + 0.06 * Math.sin(t * 0.9 + i); });

      hud.legend(win(t, 7.5, 8.6) * (1 - win(t, 39.0, 40.0) + win(t, 61.0, 62.0)) * (1 - win(t, DUR - 1.5, DUR)));
      if (t >= 40.5 && t < 50.5) hud.badge('⚠ тільки на ноутбуку Ані', 'orange', win(t, 40.5, 41.2) * (1 - win(t, 49.8, 50.5)));
      else if (t >= 53.6 && t < 61.0) hud.badge('✓ коміт на GitHub', 'green', win(t, 53.6, 54.3) * (1 - win(t, 60.3, 61.0)));
      else if (t >= 70.6 && t < 73.0) hud.badge('✓ і другий теж', 'green', win(t, 70.6, 71.2) * (1 - win(t, 72.4, 73.0)));
      else hud.badge('', '', 0);
      hud.vignette(0);
      hud.outroShow(win(t, 85.5, 86.5) * (1 - win(t, DUR - 1.4, DUR - 0.2)), [0, 1, 2].map(i => win(t, 85.9 + i * 1.2, 86.7 + i * 1.2)));
    };
    return ep;
  }
});
