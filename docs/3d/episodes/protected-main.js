/* Епізод 03 · Чому main захищений */
window.EPISODES.push({
  id: 'protected-main', order: 3, num: '03',
  title: 'Чому main захищений', kicker: 'Git для дизайнерів · епізод 03',
  subtitle: 'Спроба запушити напряму — і червона стіна. Далі зміна Ані проходить чотири правила, і видно, від чого кожне рятує.',
  music: 'episodes/protected-main.mp3',
  legend: [{ color: '#58A6FF', text: 'Аня · fix/dashboard-title' }, { color: '#3FB950', text: 'правила ruleset для main' }, { color: '#F85149', text: 'блокування' }, { color: '#E6EDF3', text: 'main' }],
  build(ctx) {
    const { THREE, C, HEX, mk, hud } = ctx;
    const { clamp01, lerp, ease, easeOut, win, pulse } = ctx.u;

    const BEATS = [
      { id: 'intro', t0: 0, t1: 6.5, num: '', ttl: '', cap: '', term: [] },
      { id: 'push', t0: 6.5, t1: 17.5, num: '01', ttl: 'Спроба запушити просто в main',
        cap: 'Аня виправила одрук у заголовку Dashboard і поспішає: «запуш це в main». GitHub відповідає червоним: гілка захищена, зміни приймаються лише через Pull Request. Нічого не зламалось — просто не пустили.',
        term: [{ x: 'git push origin main' }, { x: 'remote: error: GH006: Protected branch update failed for refs/heads/main', c: 'err' }, { x: 'remote: Changes must be made through a pull request.', c: 'err' }] },
      { id: 'what', t0: 17.5, t1: 27.5, num: '02', ttl: 'Що таке захищений main',
        cap: '<b>main</b> — це те, що бачить клієнт і від чого всі створюють гілки. Розробник один раз вмикає <b>ruleset</b>: набір умов, які кожна зміна має пройти. Вони стоять на шляху як ворота — і пам’ятає їх GitHub, а не ти.',
        term: [{ x: 'Settings → Rules → New branch ruleset · main', c: 'c' }, { x: '☐ Require a pull request   ☐ 1 approval   ☐ Code Owners' }, { x: '☐ Status checks: build     ☐ Block force pushes' }] },
      { id: 'g1', t0: 27.5, t1: 37.5, num: '03', ttl: 'Правило 1 · тільки через Pull Request',
        cap: 'Та сама зміна їде правильним шляхом: гілка <b>fix/dashboard-title</b> і PR. Тепер у неї є сторінка з описом, скриншотом і історією. Рятує від змін «нізвідки», які ніхто не бачив і не зможе пояснити через місяць.',
        term: [{ x: 'git switch -c fix/dashboard-title && git push -u origin fix/dashboard-title' }, { x: 'gh pr create --title "dashboard: одрук у заголовку"' }, { x: '→ PR #23', c: 'ok' }] },
      { id: 'g2', t0: 37.5, t1: 48.5, num: '04', ttl: 'Правило 2 · хоча б один Approve',
        cap: 'Ворота стоять жовтими, доки друга пара очей не подивиться. Богдан відкриває PR, дивиться скриншот і схвалює. Рятує від помилок, які автор не бачить, бо дивиться на екран уже двадцятий раз.',
        term: [{ x: 'Reviewer: Богдан', c: 'c' }, { x: '● waiting for review → ✓ Approved', c: 'ok' }] },
      { id: 'g3', t0: 48.5, t1: 59.5, num: '05', ttl: 'Правило 3 · Code Owners для спільного коду',
        cap: 'Файл <b>CODEOWNERS</b> каже: усе в <b>src/components</b> і <b>src/tokens</b> схвалюють обидва. Зміна Ані торкається лише екрана, тому ворота пропускають одразу. Якби вона зачепила Button — чекала б на другий Approve. Рятує від зламаних спільних компонентів.',
        term: [{ x: '# .github/CODEOWNERS', c: 'c' }, { x: '/src/components/   @bohdan @anya' }, { x: '/src/tokens/       @bohdan @anya' }, { x: 'PR #23 торкається тільки src/screens → пропущено', c: 'ok' }] },
      { id: 'g4', t0: 59.5, t1: 70.5, num: '06', ttl: 'Правило 4 · зелений check: проєкт збирається',
        cap: 'Робот бере гілку, встановлює залежності й збирає проєкт. Червоний build — і кнопка merge сіра, скільки б Approve не було. Рятує від «у мене все працювало»: те, що збирається на ноутбуку, має зібратись і на сервері.',
        term: [{ x: 'GitHub Actions · check' }, { x: 'npm ci && npm run typecheck && npm run build', c: 'c' }, { x: '● running… → ✓ build passed', c: 'ok' }] },
      { id: 'merge', t0: 70.5, t1: 81.5, num: '07', ttl: 'Усі ворота зелені — і щит на історії',
        cap: 'Squash and merge: зміна потрапляє в <b>main</b> одним записом. І останнє правило — <b>заборона force push</b>: ніхто не може переписати історію main, навіть випадково. Рятує від зникнення чужих комітів.',
        term: [{ x: 'Squash and merge', c: 'ok' }, { x: 'main ← "dashboard: одрук у заголовку (#23)"', c: 'p' }, { x: 'git push --force origin main → відхилено', c: 'err' }] },
      { id: 'daily', t0: 81.5, t1: 92.5, num: '08', ttl: 'Що це дає щодня',
        cap: 'main завжди можна показати клієнтові — у будь-яку хвилину. Помилка в гілці — не катастрофа, бо до main вона не дійде. І правила не треба тримати в голові: їх тримає GitHub, а Claude знає їх із CLAUDE.md.',
        term: [] },
      { id: 'summary', t0: 92.5, t1: 104, num: '09', ttl: 'П’ять галочок, які вмикає розробник один раз',
        cap: 'Require a pull request · 1 approval · Require review from Code Owners · Require status checks: build · Block force pushes. Це і є весь «захист» — п’ять хвилин налаштувань, які роками тримають main робочим.',
        term: [] }
    ];
    const DUR = 104;
    const CAM = [
      { t: 0.0, p: [0.0, 1.0, 22.0], l: [0.0, -0.4, 0.0] },
      { t: 6.5, p: [-4.4, 0.4, 11.5], l: [-4.6, -0.6, 0.0] },
      { t: 17.5, p: [0.6, 0.6, 16.5], l: [0.4, -0.2, 0.0] },
      { t: 27.5, p: [-1.4, 0.7, 10.5], l: [-2.2, 0.1, 0.0] },
      { t: 37.5, p: [0.2, 0.7, 10.5], l: [-0.5, 0.1, 0.0] },
      { t: 48.5, p: [2.0, 0.7, 10.5], l: [1.3, 0.1, 0.0] },
      { t: 59.5, p: [3.8, 0.7, 10.5], l: [3.1, 0.1, 0.0] },
      { t: 70.5, p: [4.6, 0.2, 12.0], l: [4.0, -0.6, 0.0] },
      { t: 81.5, p: [0.6, 0.8, 17.0], l: [0.4, -0.2, 0.0] },
      { t: 92.5, p: [0.6, 1.0, 18.5], l: [0.4, -0.2, 0.0] },
      { t: 104, p: [0.6, 1.0, 18.5], l: [0.4, -0.2, 0.0] }
    ];

    /* ---------- текстури ворот ---------- */
    const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    function cv(w, h) { const el = document.createElement('canvas'); el.width = w; el.height = h; return el; }
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function wrap(g, text, x, y, maxW, lh) {
      const words = String(text).split(' '); let line = '', yy = y;
      for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test; }
      if (line) g.fillText(line, x, yy);
    }
    const T = (el) => { const t = new THREE.CanvasTexture(el); t.anisotropy = 8; return t; };
    const STATE = { wait: [HEX(C.muted), 'rgba(110,118,129,.14)', 'чекає'], check: [HEX(C.yellow), 'rgba(210,153,34,.14)', 'перевіряє'], pass: [HEX(C.green), 'rgba(46,160,67,.14)', 'пропускає'], block: [HEX(C.red), 'rgba(248,81,73,.16)', 'блокує'] };
    function gateTex(o, state) {
      const W = 1024, H = 1024, el = cv(W, H), g = el.getContext('2d');
      const [col, bg, word] = STATE[state];
      g.fillStyle = HEX(C.surface); rr(g, 10, 10, W - 20, H - 20, 34); g.fill();
      g.fillStyle = bg; rr(g, 10, 10, W - 20, H - 20, 34); g.fill();
      g.strokeStyle = col; g.lineWidth = 8; rr(g, 10, 10, W - 20, H - 20, 34); g.stroke();
      g.textBaseline = 'middle'; g.textAlign = 'center';
      g.fillStyle = col; g.font = '700 44px ' + MONO; g.fillText('ПРАВИЛО ' + o.n, W / 2, 92);
      g.fillStyle = col; g.font = '700 180px ' + SANS; g.fillText(o.glyph, W / 2, 300);
      g.fillStyle = HEX(C.text); g.font = '600 56px ' + SANS; wrap(g, o.title, W / 2, 470, W - 120, 66);
      g.fillStyle = HEX(C.muted); g.font = '600 30px ' + MONO; g.fillText('РЯТУЄ ВІД', W / 2, 640);
      g.fillStyle = HEX(C.text); g.font = '400 40px ' + SANS; wrap(g, o.saves, W / 2, 700, W - 120, 50);
      // стан
      g.font = '600 34px ' + MONO; const sw = g.measureText(word).width + 56;
      g.fillStyle = col; rr(g, W / 2 - sw / 2, H - 132, sw, 64, 32); g.fill();
      g.fillStyle = HEX(C.bg); g.fillText(word, W / 2, H - 100);
      return T(el);
    }
    const GATES = [
      { n: 1, glyph: 'PR', title: 'Тільки через Pull Request', saves: 'змін нізвідки: без опису, скриншота й історії', x: -2.6 },
      { n: 2, glyph: '1✓', title: 'Хоча б один Approve', saves: 'помилок, які автор уже не бачить', x: -0.8 },
      { n: 3, glyph: 'CO', title: 'Code Owners для спільного коду', saves: 'зламаного Button на всіх екранах', x: 1.0 },
      { n: 4, glyph: '⚙', title: 'Зелений check: build', saves: '«у мене все працювало»', x: 2.8 }
    ];
    const gateTexes = GATES.map(gt => ({ wait: gateTex(gt, 'wait'), check: gateTex(gt, 'check'), pass: gateTex(gt, 'pass'), block: gateTex(gt, 'block') }));
    const Y_B = 0.6, Y_M = -1.8;
    const gates = GATES.map((gt, i) => { const m = mk.card(gateTexes[i].wait, gt.x, Y_B + 0.55, 2.3, 1); m.position.z = 0; return m; });

    /* стіна прямого пушу */
    function wallTex() {
      const W = 1024, H = 200, el = cv(W, H), g = el.getContext('2d');
      g.fillStyle = 'rgba(248,81,73,.22)'; rr(g, 6, 6, W - 12, H - 12, 40); g.fill();
      g.strokeStyle = HEX(C.red); g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 40); g.stroke();
      g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = HEX(C.red); g.font = '700 52px ' + MONO;
      g.fillText('GH006 · protected branch', W / 2, 78); g.font = '500 40px ' + SANS; g.fillStyle = HEX(C.text); g.fillText('зміни лише через Pull Request', W / 2, 140);
      return T(el);
    }
    const wall = mk.card(wallTex(), -5.2, -0.55, 3.6, 200 / 1024);
    const wallGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.tex.glowTex(C.red), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    wallGlow.scale.set(5, 5, 1); wallGlow.position.set(-5.2, -0.55, 0.2); ctx.scene.add(wallGlow);

    /* щит над історією main */
    function shieldTex() {
      const W = 1024, H = 300, el = cv(W, H), g = el.getContext('2d');
      g.fillStyle = 'rgba(46,160,67,.16)'; rr(g, 6, 6, W - 12, H - 12, 40); g.fill();
      g.strokeStyle = HEX(C.green); g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 40); g.stroke();
      g.textBaseline = 'middle'; g.textAlign = 'center';
      g.fillStyle = HEX(C.green); g.font = '700 44px ' + MONO; g.fillText('ПРАВИЛО 5 · Block force pushes', W / 2, 80);
      g.fillStyle = HEX(C.text); g.font = '500 40px ' + SANS; g.fillText('історію main не можна переписати', W / 2, 150);
      g.fillStyle = HEX(C.muted); g.font = '400 34px ' + SANS; g.fillText('рятує від зникнення чужих комітів', W / 2, 220);
      return T(el);
    }
    const shield = mk.card(shieldTex(), 5.6, Y_M + 1.15, 4.4, 300 / 1024);

    /* ---------- граф ---------- */
    const trunk = mk.tube([[-34, Y_M, 0], [-10, Y_M, 0], [10, Y_M, 0], [34, Y_M, 0]], C.text, 0.085);
    const branch = mk.tube([[-8.0, Y_B, 0], [-2, Y_B, 0], [4.4, Y_B, 0], [4.9, Y_B - 1.2, 0], [5.6, Y_M, 0]], C.blue);
    const direct = mk.tube([[-5.2, Y_B, 0], [-5.2, -0.3, 0]], C.red, 0.06);
    const cBase = mk.commit(-7.0, Y_M, C.text, 0.2);
    const cFix = mk.commit(-6.6, Y_B, C.blue, 0.22);
    const cMerge = mk.commit(5.6, Y_M, C.purple, 0.28);
    const ring = mk.ring(5.6, Y_M, C.purple, 0.5);
    const labA = mk.label('Аня', 'fix/dashboard-title', HEX(C.blue), -7.4, Y_B + 1.2, 4.0);
    const labMain = mk.label('main', 'те, що бачить клієнт', HEX(C.text), -8.6, Y_M + 0.85, 4.0);
    // «пакет» зміни, що подорожує
    const pkt = mk.commit(-6.6, Y_B, C.blue, 0.24); pkt.g.position.z = 0.35;

    hud.outro(['Require a pull request — зміни лише через PR.', '1 approval + Code Owners — друга пара очей, для спільного коду дві.', 'Status checks + Block force pushes — робот збирає, історію не переписати.']);

    const ep = { BEATS, DUR, CAM, dim: 1 };
    const setOp = (mat, v) => { mat.opacity = clamp01(v) * ep.dim; };
    const V = (x, y, z) => new THREE.Vector3(x, y, z || 0);
    /** стан воріт у момент t */
    const gateState = (i, t) => {
      const T0 = [27.5, 37.5, 48.5, 59.5][i], TP = [30.5, 44.0, 52.0, 66.5][i];   // початок перевірки · момент проходження
      if (t < 18.0 + i * 0.6) return null;
      if (t < T0) return 'wait';
      if (t < TP) return 'check';
      return 'pass';
    };

    ep.update = function (t) {
      ep.dim = 1 - 0.65 * win(t, 93.0, 94.5);
      mk.revealTo(trunk, lerp(-34, 34, easeOut(win(t, 6.0, 8.0))));
      mk.revealTo(branch, t < 27.5 ? lerp(-8.05, -5.6, easeOut(win(t, 8.0, 9.5))) : lerp(-5.6, 5.65, win(t, 27.5, 74.0)));
      setOp(trunk.material, 0.92); setOp(branch.material, win(t, 7.8, 8.4));
      // пряма спроба: червоний відрізок вниз до стіни
      // вертикальна труба відкривається зверху вниз: нормаль +y лишає точки з y >= -constant
      direct.userData.plane.normal.set(0, 1, 0);
      direct.userData.plane.constant = -lerp(0.65, -0.35, easeOut(win(t, 9.5, 10.8)));
      setOp(direct.material, win(t, 9.4, 9.8) * (1 - win(t, 17.0, 18.5)));
      mk.pop(cBase, t, 7.0, setOp); mk.pop(cFix, t, 8.6, setOp);
      // стіна
      const hit = win(t, 10.4, 10.8);
      wall.material.opacity = clamp01(win(t, 10.3, 10.7) * (1 - win(t, 17.0, 18.5))) * ep.dim;
      wall.position.copy(wall.userData.base); wall.position.y += 0.06 * Math.sin(t * 6) * pulse(t, 10.6, 12.0);
      wall.scale.setScalar(1 + 0.12 * pulse(t, 10.5, 11.3));
      wallGlow.material.opacity = (0.9 * pulse(t, 10.5, 13.0) + 0.25 * hit * (1 - win(t, 16.5, 18.0))) * ep.dim;
      hud.vignette(pulse(t, 10.4, 15.0) * 0.45);
      // пакет: падає на стіну, відскакує; потім їде по гілці через ворота; в кінці — у main
      let px = -6.6, py = Y_B, pop = win(t, 8.8, 9.4);
      if (t < 27.5) {
        const down = ease(win(t, 9.6, 10.6)), back = easeOut(win(t, 10.6, 11.6));
        px = -6.6 + 1.4 * ease(win(t, 9.2, 9.9)); py = lerp(Y_B, -0.35, down) + 0.95 * back * (1 - 0.0);
        if (t > 11.6) { px = -5.2 + (-6.6 + 5.2) * ease(win(t, 12.0, 13.5)); py = Y_B; }
      } else {
        const stops = [-6.6, GATES[0].x, GATES[1].x, GATES[2].x, GATES[3].x, 4.6, 5.6];
        const times = [27.5, 29.5, 37.5, 39.0, 48.5, 50.0, 59.5, 61.0, 70.5, 72.5, 73.5, 74.5];
        // рух між зупинками у вікнах [times[2k], times[2k+1]]
        px = stops[0];
        for (let k = 0; k < 6; k++) { const s = ease(win(t, times[2 * k], times[2 * k + 1])); px = lerp(stops[k], stops[k + 1], s); if (t < times[2 * k + 1]) break; }
        py = t < 73.5 ? Y_B : lerp(Y_B, Y_M, ease(win(t, 73.5, 74.5)));
        pop = 1 - win(t, 74.4, 74.9);
      }
      pkt.g.position.set(px, py, 0.35); pkt.g.scale.setScalar(pop * (1 + 0.08 * Math.sin(t * 3)));
      setOp(pkt.core.material, pop); setOp(pkt.shell.material, 0.38 * pop); setOp(pkt.glow.material, 0.6 * pop);
      // ворота
      gates.forEach((m, i) => {
        const st = gateState(i, t);
        m.material.opacity = st ? clamp01(win(t, 18.0 + i * 0.6, 19.0 + i * 0.6) * (1 - win(t, 92.0, 93.0))) * ep.dim : 0;
        if (st) m.material.map = gateTexes[i][st];
        m.position.copy(m.userData.base); m.position.y += 0.05 * Math.sin(t * 0.8 + i) + 0.4 * (1 - easeOut(win(t, 18.0 + i * 0.6, 19.2 + i * 0.6)));
        const TP = [30.5, 44.0, 52.0, 66.5][i]; m.scale.setScalar(1 + 0.06 * pulse(t, TP - 0.2, TP + 0.9));
      });
      // злиття і щит
      mk.pop(cMerge, t, 74.6, setOp);
      { const p = win(t, 74.6, 77.0); ring.scale.setScalar(lerp(0.6, 2.8, easeOut(p))); setOp(ring.material, Math.sin(clamp01(p) * Math.PI) * 0.9); }
      shield.material.opacity = clamp01(win(t, 76.0, 77.2) * (1 - win(t, 92.0, 93.0))) * ep.dim;
      shield.position.copy(shield.userData.base); shield.position.y += 0.05 * Math.sin(t * 0.9) + 0.4 * (1 - easeOut(win(t, 76.0, 77.4)));
      shield.scale.setScalar(1 + 0.05 * pulse(t, 78.5, 79.7));
      // підписи
      const hideL = win(t, 26.5, 27.5) * (1 - win(t, 70.5, 71.5));   // на крупних планах воріт підписи не потрібні
      setOp(labA.material, win(t, 8.8, 9.8) * (1 - hideL) * (1 - win(t, 92.0, 93.0)));
      setOp(labMain.material, win(t, 6.9, 8.0) * (1 - hideL) * (1 - win(t, 92.0, 93.0)));

      hud.legend(win(t, 7.5, 8.6) * (1 - win(t, DUR - 1.5, DUR)));
      if (t >= 10.6 && t < 17.5) hud.badge('⛔ GH006 · main захищений', 'red', win(t, 10.6, 11.2) * (1 - win(t, 16.8, 17.5)));
      else if (t >= 30.5 && t < 37.0) hud.badge('✓ PR #23 відкрито', 'green', win(t, 30.5, 31.2) * (1 - win(t, 36.3, 37.0)));
      else if (t >= 44.0 && t < 48.0) hud.badge('✓ Approve · Богдан', 'green', win(t, 44.0, 44.7) * (1 - win(t, 47.3, 48.0)));
      else if (t >= 52.0 && t < 59.0) hud.badge('✓ Code Owners · не стосується, пропущено', 'green', win(t, 52.0, 52.7) * (1 - win(t, 58.3, 59.0)));
      else if (t >= 61.0 && t < 66.5) hud.badge('● build · running', 'orange', win(t, 61.0, 61.7) * (1 - win(t, 65.8, 66.5)));
      else if (t >= 66.5 && t < 70.0) hud.badge('✓ build · passed', 'green', win(t, 66.5, 67.2) * (1 - win(t, 69.3, 70.0)));
      else if (t >= 74.6 && t < 81.0) hud.badge('● PR #23 · merged · force push заблоковано', 'purple', win(t, 74.6, 75.3) * (1 - win(t, 80.3, 81.0)));
      else hud.badge('', '', 0);
      hud.outroShow(win(t, 94.0, 95.0) * (1 - win(t, DUR - 1.4, DUR - 0.2)), [0, 1, 2].map(i => win(t, 94.4 + i * 1.2, 95.2 + i * 1.2)));
    };
    return ep;
  }
});
