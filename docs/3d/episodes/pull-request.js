/* Епізод 02 · Життєвий цикл Pull Request */
window.EPISODES.push({
  id: 'pull-request', order: 2, num: '02',
  title: 'Життєвий цикл Pull Request', kicker: 'Git для дизайнерів · епізод 02',
  subtitle: 'Очима рев’юерки: Богдан відкриває PR, Аня дивиться diff і скриншоти, коментує на рядку, схвалює і зливає.',
  music: 'episodes/pull-request.mp3',
  legend: [{ color: '#58A6FF', text: 'Аня · рев’юерка · дивиться, коментує, схвалює, зливає' }, { color: '#F78166', text: 'Богдан · автор PR · feat/settings-notifications' }, { color: '#E6EDF3', text: 'main' }],
  build(ctx) {
    const { THREE, C, HEX, mk, hud } = ctx;
    const { clamp01, lerp, ease, easeOut, win, pulse } = ctx.u;

    const BEATS = [
      { id: 'intro', t0: 0, t1: 6.5, num: '', ttl: '', cap: '', term: [] },
      { id: 'branch', t0: 6.5, t1: 16, num: '01', ttl: 'Богдан: гілка, два коміти, push',
        cap: 'Богдан робить сповіщення в Settings у своїй гілці. Два коміти вже на GitHub. Аня поки нічого не мусить: гілка сама по собі нікого не зобов’язує.',
        term: [{ x: 'git switch -c feat/settings-notifications' }, { x: 'git commit -m "settings: сповіщення"' }, { x: 'git push -u origin feat/settings-notifications' }] },
      { id: 'draft', t0: 16, t1: 26, num: '02', ttl: 'Draft PR: Аня бачить роботу, рев’ю ще не просять',
        cap: 'Богдан відкриває <b>Pull Request</b> як <b>Draft</b>. Це Review and merge з Figma, але з розмовою, історією й автоперевіркою. Аня може заглянути, але злити не можна і запиту на рев’ю ще немає.',
        term: [{ x: 'gh pr create --draft --title "settings: сповіщення"' }, { x: '→ github.com/eleken-git/design-process-help/pull/22', c: 'c' }] },
      { id: 'ready', t0: 26, t1: 36, num: '03', ttl: 'Ready for review: Аню запрошено',
        cap: 'Богдан знімає Draft і просить Аню глянути. <b>GitHub Actions</b> — автоперевірка, описана в репозиторії, — одразу запускає збірку: поки check жовтий, PR чекає; зелений означає «проєкт збирається». Тепер хід Ані.',
        term: [{ x: 'gh pr ready 22' }, { x: 'Reviewer: Аня', c: 'c' }, { x: '● build · pending → ✓ passed', c: 'ok' }] },
      { id: 'comment', t0: 36, t1: 48, num: '04', ttl: 'Аня лишає коментар до рядка 42',
        cap: 'Аня відкриває <b>Files changed</b>: diff і скриншоти. Бачить кнопку Зберегти, яка завжди активна, і пише коментар просто на рядку 42. Статус <b>Changes requested</b> — не відмова, а запит на ще один коміт.',
        term: [{ x: 'Аня · Settings.tsx:42', c: 'c' }, { x: '«Зберегти має бути неактивною, поки у формі нічого не змінено»' }, { x: 'Request changes', c: 'err' }] },
      { id: 'fix', t0: 48, t1: 60, num: '05', ttl: 'Богдан відповідає комітом у ту саму гілку',
        cap: 'Богдан просить Claude додати стан disabled і запушити. Новий коміт сам з’являється у PR — нічого не треба перевідкривати. Аня бачить <b>Resolved</b> і повторний зелений check.',
        term: [{ x: 'git commit -m "settings: disabled для Зберегти"' }, { x: 'git push' }, { x: 'PR #22 · 3 commits · ✓ build passed', c: 'ok' }] },
      { id: 'approve', t0: 60, t1: 70, num: '06', ttl: 'Approve: Аня схвалює',
        cap: 'Аня перевіряє скриншот після виправлення і натискає <b>Approve</b>. Тепер виконані обидві умови захищеного <b>main</b>: Approve і зелений check. Кнопка <b>Squash and merge</b> активна — і натискає її Аня як рев’юерка.',
        term: [{ x: 'Аня · Approve ✓', c: 'ok' }, { x: 'Squash and merge — доступно', c: 'ok' }] },
      { id: 'merge', t0: 70, t1: 82, num: '07', ttl: 'Squash and merge: Аня зливає',
        cap: 'Аня натискає Squash and merge: три коміти Богдана склеюються в один запис в історії <b>main</b> з назвою PR. Гілка видаляється автоматично. Історія main читається як список задач, а не як чернетки.',
        term: [{ x: 'Аня · Squash and merge' }, { x: 'main ← "settings: сповіщення (#22)"', c: 'p' }, { x: 'гілку feat/settings-notifications видалено', c: 'c' }] },
      { id: 'roles', t0: 82, t1: 92, num: '08', ttl: 'Що бачить рев’юерка, що бачить автор',
        cap: 'Аня бачить Files changed — diff і скриншоти — і кнопки Approve / Request changes, а після Approve — зелений Squash and merge. Богдан бачить checks, коментарі й сіру кнопку merge, доки Аня не схвалила. Сторінка одна, рішення — за рев’юеркою.',
        term: [] },
      { id: 'summary', t0: 92, t1: 101, num: '09', ttl: 'Три звички рев’юерки',
        cap: 'Дивись Files changed і скриншоти, а не лише опис PR. Коментуй на рядку — тоді автор точно знає, що змінити. Зливай сама після Approve і зеленого check.',
        term: [] }
    ];
    const DUR = 101;
    const CAM = [
      { t: 0.0, p: [0.0, 1.2, 22.0], l: [0.0, 0.0, 0.0] },
      { t: 6.5, p: [-1.4, 0.0, 14.5], l: [-0.8, -0.4, 0.0] },
      { t: 16.0, p: [0.6, 0.4, 14.5], l: [0.8, 0.2, 0.0] },
      { t: 26.0, p: [0.6, 0.4, 14.5], l: [0.8, 0.2, 0.0] },
      { t: 36.0, p: [-0.6, 0.8, 12.5], l: [-0.4, 0.9, 0.0] },
      { t: 48.0, p: [0.2, 0.3, 14.5], l: [0.4, 0.0, 0.0] },
      { t: 60.0, p: [0.6, 0.4, 14.5], l: [0.8, 0.2, 0.0] },
      { t: 70.0, p: [0.8, 0.2, 14.5], l: [0.8, -0.2, 0.0] },
      { t: 82.0, p: [0.6, 0.5, 16.0], l: [0.6, 0.1, 0.0] },
      { t: 92.0, p: [0.6, 0.6, 18.0], l: [0.6, 0.1, 0.0] },
      { t: 101, p: [0.6, 0.6, 18.0], l: [0.6, 0.1, 0.0] }
    ];

    /* ---------- canvas-картки PR і коментаря ---------- */
    const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    function cv(w, h) { const el = document.createElement('canvas'); el.width = w; el.height = h; return el; }
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function pill(g, x, y, text, color, bg, font) {
      g.font = font || '600 30px ' + MONO; const w = g.measureText(text).width + 44;
      g.fillStyle = bg; rr(g, x, y, w, 56, 28); g.fill(); g.strokeStyle = color; g.lineWidth = 2; rr(g, x, y, w, 56, 28); g.stroke();
      g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(text, x + 22, y + 29); return w;
    }
    function wrap(g, text, x, y, maxW, lh) {
      const words = String(text).split(' '); let line = '', yy = y;
      for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test; }
      if (line) g.fillText(line, x, yy); return yy;
    }
    const T = (el) => { const t = new THREE.CanvasTexture(el); t.anisotropy = 8; return t; };

    /** Сторінка PR: state = draft | open | changes | approved | merged ; checks = none | pending | passed ; commits ; conv = 0|open|resolved */
    function prCard(o) {
      const W = 1280, H = 800, el = cv(W, H), g = el.getContext('2d');
      const STATES = {
        draft: ['Draft', HEX(C.muted), 'rgba(110,118,129,.22)'], open: ['Open', HEX(C.green), 'rgba(46,160,67,.18)'],
        changes: ['Changes requested', HEX(C.orange), 'rgba(219,109,40,.18)'], approved: ['Approved', HEX(C.green), 'rgba(46,160,67,.18)'],
        merged: ['Merged', HEX(C.purple), 'rgba(163,113,247,.18)']
      };
      const [stText, stColor, stBg] = STATES[o.state];
      g.fillStyle = HEX(C.surface); rr(g, 8, 8, W - 16, H - 16, 26); g.fill();
      g.strokeStyle = stColor; g.lineWidth = 6; rr(g, 8, 8, W - 16, H - 16, 26); g.stroke();
      g.textBaseline = 'middle';
      // заголовок
      g.fillStyle = HEX(C.text); g.font = '600 46px ' + SANS; g.fillText('settings: сповіщення', 44, 70);
      g.fillStyle = HEX(C.muted); g.font = '400 40px ' + SANS; g.fillText('#22', 44 + g.measureText('settings: сповіщення ').width + 14, 72);
      pill(g, W - 44 - (g.font = '600 30px ' + MONO, g.measureText(stText).width + 44), 42, stText, stColor, stBg);
      // мета
      g.fillStyle = HEX(C.muted); g.font = '400 30px ' + SANS;
      g.fillText(o.state === 'merged' ? `Аня злила ${o.commits} коміти Богдана як один у main` : `Богдан хоче злити ${o.commits} коміти з feat/settings-notifications у main`, 44, 132);
      g.strokeStyle = HEX(C.border); g.lineWidth = 2; g.beginPath(); g.moveTo(24, 172); g.lineTo(W - 24, 172); g.stroke();
      // рядки статусу
      const rows = [
        ['Рев’юерка', o.state === 'draft' ? '— ще не запрошено' : (o.state === 'open' ? 'Аня · дивиться' : (o.state === 'changes' ? 'Аня · Changes requested' : 'Аня · Approved ✓')),
          o.state === 'draft' ? HEX(C.faint) : (o.state === 'changes' ? HEX(C.orange) : (o.state === 'open' ? HEX(C.muted) : HEX(C.green)))],
        ['Checks', o.checks === 'none' ? '— не запускались' : (o.checks === 'pending' ? '● build · pending' : '✓ build · passed'), o.checks === 'none' ? HEX(C.faint) : (o.checks === 'pending' ? HEX(C.yellow) : HEX(C.green))],
        ['Коментарі', o.conv === 0 ? '— немає' : (o.conv === 'open' ? '1 · не вирішено' : '1 · resolved ✓'), o.conv === 0 ? HEX(C.faint) : (o.conv === 'open' ? HEX(C.orange) : HEX(C.green))],
        ['Коміти', String(o.commits), HEX(C.text)]
      ];
      rows.forEach(([k, v, col], i) => {
        const y = 226 + i * 76;
        g.fillStyle = HEX(C.muted); g.font = '400 30px ' + SANS; g.fillText(k, 44, y);
        g.fillStyle = col; g.font = '500 32px ' + MONO; g.fillText(v, 300, y);
      });
      // кнопка merge
      const ready = o.state === 'approved' && o.checks === 'passed';
      const label = o.state === 'merged' ? 'Merged · гілку видалено' : (o.state === 'draft' ? 'Ready for review' : 'Squash and merge');
      const bx = 44, by = H - 150, bw = 620, bh = 88;
      g.fillStyle = o.state === 'merged' ? 'rgba(163,113,247,.2)' : (ready ? HEX(C.green) : (o.state === 'draft' ? HEX(C.border) : 'rgba(110,118,129,.25)'));
      rr(g, bx, by, bw, bh, 14); g.fill();
      g.strokeStyle = o.state === 'merged' ? HEX(C.purple) : (ready ? HEX(C.green) : HEX(C.border)); g.lineWidth = 2; rr(g, bx, by, bw, bh, 14); g.stroke();
      g.fillStyle = o.state === 'merged' ? HEX(C.purple) : (ready || o.state === 'draft' ? HEX(C.text) : HEX(C.faint)); g.font = '600 34px ' + SANS; g.fillText(label, bx + 30, by + bh / 2);
      g.fillStyle = HEX(C.faint); g.font = '400 26px ' + SANS;
      g.fillText(o.state === 'merged' ? 'один коміт у main: "settings: сповіщення (#22)"' : (ready ? 'усі умови виконані · натискає Аня' : (o.state === 'draft' ? 'чернетка: злиття заблоковано' : 'потрібні Approve і зелений check')), bx + bw + 30, by + bh / 2);
      return T(el);
    }
    /** Коментар рев’юера до рядка */
    function commentCard(resolved) {
      const W = 1280, H = 800, el = cv(W, H), g = el.getContext('2d');
      const col = resolved ? HEX(C.green) : HEX(C.blue);
      g.fillStyle = HEX(C.surface); rr(g, 8, 8, W - 16, H - 16, 26); g.fill();
      g.strokeStyle = col; g.lineWidth = 6; rr(g, 8, 8, W - 16, H - 16, 26); g.stroke();
      g.textBaseline = 'middle';
      g.fillStyle = HEX(C.blue); g.beginPath(); g.arc(80, 76, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = HEX(C.bg); g.font = '700 34px ' + SANS; g.textAlign = 'center'; g.fillText('А', 80, 78); g.textAlign = 'left';
      g.fillStyle = HEX(C.text); g.font = '600 38px ' + SANS; g.fillText('Аня', 136, 60);
      g.fillStyle = HEX(C.muted); g.font = '400 28px ' + MONO; g.fillText('коментар · src/screens/settings/Settings.tsx : 42', 136, 100);
      pill(g, W - 44 - (g.font = '600 28px ' + MONO, g.measureText(resolved ? 'Resolved ✓' : 'Open').width + 44), 46, resolved ? 'Resolved ✓' : 'Open', col, resolved ? 'rgba(46,160,67,.18)' : 'rgba(56,139,253,.18)', '600 28px ' + MONO);
      // рядок коду
      g.fillStyle = '#010409'; rr(g, 44, 150, W - 88, 84, 14); g.fill();
      g.fillStyle = HEX(C.faint); g.font = '400 28px ' + MONO; g.fillText('42', 68, 192);
      g.fillStyle = HEX(C.text); g.font = '400 32px ' + MONO; g.fillText('<Button>Зберегти</Button>', 130, 192);
      // текст
      g.fillStyle = HEX(C.text); g.font = '400 36px ' + SANS;
      wrap(g, 'Кнопка Зберегти має бути неактивною, поки у формі нічого не змінено — інакше незрозуміло, чи є що зберігати.', 44, 292, W - 88, 50);
      if (resolved) {
        g.fillStyle = 'rgba(46,160,67,.12)'; rr(g, 44, 470, W - 88, 210, 16); g.fill();
        g.fillStyle = HEX(C.orange); g.beginPath(); g.arc(90, 522, 26, 0, Math.PI * 2); g.fill();
        g.fillStyle = HEX(C.bg); g.font = '700 26px ' + SANS; g.textAlign = 'center'; g.fillText('Б', 90, 524); g.textAlign = 'left';
        g.fillStyle = HEX(C.text); g.font = '600 32px ' + SANS; g.fillText('Богдан', 134, 522);
        g.fillStyle = HEX(C.muted); g.font = '400 30px ' + SANS; wrap(g, 'Додав disabled і підказку, поки форма без змін. Коміт 8be04d1 у цій же гілці.', 134, 580, W - 200, 42);
      } else {
        g.fillStyle = HEX(C.muted); g.font = '400 28px ' + SANS; g.fillText('Request changes · чекаємо на коміт від автора', 44, 720);
      }
      return T(el);
    }
    /** Дві точки зору (розділ 08) */
    function viewCard(who) {
      const W = 1280, H = 800, el = cv(W, H), g = el.getContext('2d');
      const author = who === 'author'; const col = author ? HEX(C.orange) : HEX(C.blue);
      g.fillStyle = HEX(C.surface); rr(g, 8, 8, W - 16, H - 16, 26); g.fill();
      g.strokeStyle = col; g.lineWidth = 6; rr(g, 8, 8, W - 16, H - 16, 26); g.stroke();
      g.textBaseline = 'middle';
      g.fillStyle = col; g.beginPath(); g.arc(80, 76, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = HEX(C.bg); g.font = '700 34px ' + SANS; g.textAlign = 'center'; g.fillText(author ? 'Б' : 'А', 80, 78); g.textAlign = 'left';
      g.fillStyle = HEX(C.text); g.font = '600 40px ' + SANS; g.fillText(author ? 'Богдан · автор PR' : 'Аня · рев’юерка', 136, 76);
      const items = author
        ? [['Conversation', 'коментарі рев’юера, кожен прив’язаний до рядка'], ['Checks', 'чи збирається проєкт після кожного коміту'], ['Merge', 'сіра кнопка, доки Аня не схвалила'], ['Що робити', 'відповідати комітами в ту саму гілку']]
        : [['Files changed', 'diff і скриншоти до / після'], ['Add comment', 'коментар просто на рядку коду'], ['Review', 'Approve або Request changes'], ['Squash and merge', 'зелена після Approve і зеленого check — натискає сама']];
      items.forEach(([k, v], i) => {
        const y = 176 + i * 140;
        g.fillStyle = col; g.font = '600 32px ' + MONO; g.fillText(k, 44, y);
        g.fillStyle = HEX(C.text); g.font = '400 32px ' + SANS; wrap(g, v, 44, y + 50, W - 88, 42);
      });
      return T(el);
    }

    /* ---------- граф ---------- */
    const Y_M = -1.8, Y_B = 0.0;
    const X = { base: -6.0, c1: -4.6, c2: -3.2, c3: 0.6, tip: 4.8, merge: 6.2 };
    const trunk = mk.tube([[-34, Y_M, 0], [-10, Y_M, 0], [10, Y_M, 0], [34, Y_M, 0]], C.text, 0.085);
    const work = mk.tube([[X.base, Y_M, 0], [-5.5, Y_M + 0.9, 0], [-5.0, Y_B, 0], [-2, Y_B, 0], [X.tip, Y_B, 0]], C.orange);
    const mergeT = mk.tube([[X.tip, Y_B, 0], [5.5, Y_B, 0], [5.9, Y_M + 0.9, 0], [X.merge, Y_M, 0]], C.orange);
    const cBase = mk.commit(X.base, Y_M, C.text, 0.2);
    const cs = [mk.commit(X.c1, Y_B, C.orange), mk.commit(X.c2, Y_B, C.orange), mk.commit(X.c3, Y_B, C.orange)];
    const cMerge = mk.commit(X.merge, Y_M, C.purple, 0.28);
    const ring = mk.ring(X.merge, Y_M, C.purple, 0.5);
    const labA = mk.label('Богдан · автор', 'feat/settings-notifications', HEX(C.orange), -6.2, Y_B + 1.15, 4.6);
    const labMain = mk.label('main', null, HEX(C.text), -7.0, Y_M + 0.85, 2.6);
    const labPush = mk.label('на GitHub', 'origin', HEX(C.green), -1.9, Y_B - 0.95, 3.0);

    /* ---------- картки ---------- */
    const texPR = {
      draft: prCard({ state: 'draft', checks: 'none', commits: 2, conv: 0 }),
      openPending: prCard({ state: 'open', checks: 'pending', commits: 2, conv: 0 }),
      openPassed: prCard({ state: 'open', checks: 'passed', commits: 2, conv: 0 }),
      changes: prCard({ state: 'changes', checks: 'passed', commits: 2, conv: 'open' }),
      fixPending: prCard({ state: 'changes', checks: 'pending', commits: 3, conv: 'resolved' }),
      fixPassed: prCard({ state: 'changes', checks: 'passed', commits: 3, conv: 'resolved' }),
      approved: prCard({ state: 'approved', checks: 'passed', commits: 3, conv: 'resolved' }),
      merged: prCard({ state: 'merged', checks: 'passed', commits: 3, conv: 'resolved' })
    };
    const pr = mk.card(texPR.draft, 2.6, 1.95, 6.2);
    const texC0 = commentCard(false), texC1 = commentCard(true);
    const cmt = mk.card(texC0, -3.4, 2.7, 3.9);
    const lineToCode = mk.leader(0, 0, 0, C.blue); // замінимо геометрію під час кадру
    const viewA = mk.card(viewCard('reviewer'), -2.6, 2.2, 4.6), viewB = mk.card(viewCard('author'), 3.2, 2.2, 4.6);

    hud.outro(['Дивись Files changed і скриншоти до / після, а не лише опис PR.',
      'Коментуй просто на рядку: автор відповідає комітом у ту саму гілку.',
      'Після Approve і зеленого check натискай Squash and merge сама.']);

    const ep = { BEATS, DUR, CAM, dim: 1 };
    const setOp = (mat, v) => { mat.opacity = clamp01(v) * ep.dim; };
    const V = (x, y, z) => new THREE.Vector3(x, y, z || 0);
    function updateLeader(line, ax, ay, bx, by) {
      const pos = line.geometry.attributes.position; pos.setXYZ(0, ax, ay, 0.1); pos.setXYZ(1, bx, by, 0.1); pos.needsUpdate = true;
    }

    ep.update = function (t) {
      ep.dim = 1 - 0.65 * win(t, 92.5, 94.0);
      // труби
      mk.revealTo(trunk, lerp(-34, 34, easeOut(win(t, 6.0, 8.0))));
      mk.revealTo(work, t < 48 ? lerp(-6.05, -2.4, easeOut(win(t, 8.0, 10.5))) : lerp(-2.4, X.tip, win(t, 48, 52)));
      mk.revealTo(mergeT, lerp(X.tip, X.merge + .05, easeOut(win(t, 72.5, 74.5))));
      const gone = win(t, 76.5, 79.5);   // гілку видалено
      setOp(trunk.material, 0.92);
      setOp(work.material, win(t, 7.8, 8.4) * (1 - gone));
      setOp(mergeT.material, win(t, 72.3, 72.8) * (1 - gone));

      // коміти: c1, c2 рано; c3 після коментаря; на squash усі три стягуються в merge-коміт
      const squash = ease(win(t, 74.5, 76.5));
      mk.pop(cBase, t, 7.0, setOp);
      [9.4, 10.3, 51.5].forEach((tt, i) => {
        mk.pop(cs[i], t, tt, setOp);
        const base = V([X.c1, X.c2, X.c3][i], Y_B);
        cs[i].g.position.lerpVectors(base, V(X.merge, Y_M), squash);
        cs[i].g.scale.multiplyScalar(1 - 0.85 * squash);
        setOp(cs[i].core.material, (1 - squash)); setOp(cs[i].shell.material, 0.38 * (1 - squash)); setOp(cs[i].glow.material, 0.5 * (1 - squash) + 0.5 * pulse(t, 74.3, 76.8));
      });
      mk.pop(cMerge, t, 76.2, setOp);
      { const p = win(t, 76.2, 78.6); ring.scale.setScalar(lerp(0.6, 2.8, easeOut(p))); setOp(ring.material, Math.sin(clamp01(p) * Math.PI) * 0.9); }

      // підписи
      setOp(labA.material, win(t, 8.6, 9.6) * (1 - win(t, 34.5, 36)) + win(t, 47.5, 48.5) * (1 - win(t, 80.5, 82)));
      setOp(labMain.material, win(t, 6.9, 8.0) * (1 - win(t, 35.5, 36.5) * (1 - win(t, 47.5, 48.5))) * (1 - win(t, 80.5, 82)));
      setOp(labPush.material, win(t, 12.0, 13.0) * (1 - win(t, 16.5, 18.0)));
      labPush.position.y = Y_B - 0.95 - 0.5 * (1 - easeOut(win(t, 12.0, 13.2)));

      // PR-картка: стани
      pr.material.map = t < 27.5 ? texPR.draft : t < 30.5 ? texPR.openPending : t < 40.5 ? texPR.openPassed : t < 52.5 ? texPR.changes : t < 55.5 ? texPR.fixPending : t < 62.5 ? texPR.fixPassed : t < 75.5 ? texPR.approved : texPR.merged;
      const prIn = win(t, 17.0, 18.2) * (1 - win(t, 81.0, 82.5));
      pr.material.opacity = clamp01(prIn) * ep.dim;
      pr.position.copy(pr.userData.base); pr.position.y += 0.08 * Math.sin(t * 0.8) + 0.5 * (1 - easeOut(win(t, 17.0, 18.4)));
      // під час коментаря PR-картка відсувається праворуч і вглиб, щоб дати місце коментарю
      const cmtFocus = win(t, 36.5, 38.0) * (1 - win(t, 46.5, 48.0));
      pr.position.x += 0.9 * ease(cmtFocus); pr.position.z -= 1.2 * ease(cmtFocus);
      pr.scale.setScalar(1 + 0.05 * (pulse(t, 27.3, 28.5) + pulse(t, 40.3, 41.5) + pulse(t, 62.3, 63.5) + pulse(t, 75.3, 76.7)));

      // коментар: з'являється в 04, стає Resolved у 05, зникає перед 06
      cmt.material.map = t >= 55.0 ? texC1 : texC0;
      const cIn = win(t, 37.5, 38.7) * (1 - win(t, 59.0, 60.0));
      cmt.material.opacity = clamp01(cIn) * ep.dim;
      cmt.position.copy(cmt.userData.base); cmt.position.y += 0.08 * Math.sin(t * 0.9 + 1) + 0.5 * (1 - easeOut(win(t, 37.5, 38.9)));
      cmt.scale.setScalar(1 + 0.06 * pulse(t, 54.8, 56.0));
      // лінія від коментаря до місця в гілці, де з'явиться коміт-відповідь
      updateLeader(lineToCode, cmt.position.x + 1.2, cmt.position.y - 1.2, X.c3, Y_B + 0.35);
      lineToCode.material.color.setHex(t >= 55.0 ? C.green : C.blue);
      setOp(lineToCode.material, cIn * 0.6);

      // дві точки зору (08)
      const vIn = win(t, 82.8, 84.0) * (1 - win(t, 91.5, 92.5));
      [viewA, viewB].forEach((m, i) => {
        m.material.opacity = clamp01(win(t, 82.8 + i * 0.5, 84.0 + i * 0.5) * (1 - win(t, 91.5, 92.5))) * ep.dim;
        m.position.copy(m.userData.base); m.position.y += 0.07 * Math.sin(t * 0.8 + i) + 0.5 * (1 - easeOut(win(t, 82.8 + i * 0.5, 84.2 + i * 0.5)));
      });

      hud.legend(win(t, 7.5, 8.6) * (1 - win(t, DUR - 1.5, DUR)));
      if (t >= 17.5 && t < 26.0) hud.badge('◌ Draft · злиття заблоковано', '', win(t, 17.5, 18.2) * (1 - win(t, 25.3, 26.0)));
      else if (t >= 30.5 && t < 36.0) hud.badge('✓ build · passed', 'green', win(t, 30.5, 31.2) * (1 - win(t, 35.3, 36.0)));
      else if (t >= 40.5 && t < 48.0) hud.badge('● Changes requested від Ані', 'blue', win(t, 40.5, 41.2) * (1 - win(t, 47.3, 48.0)));
      else if (t >= 55.5 && t < 60.0) hud.badge('✓ Resolved · build passed', 'green', win(t, 55.5, 56.2) * (1 - win(t, 59.3, 60.0)));
      else if (t >= 62.5 && t < 70.0) hud.badge('✓ Approved · Аня зливає', 'green', win(t, 62.5, 63.2) * (1 - win(t, 69.3, 70.0)));
      else if (t >= 76.0 && t < 82.0) hud.badge('● PR #22 · merged', 'purple', win(t, 76.0, 76.7) * (1 - win(t, 81.3, 82.0)));
      else hud.badge('', '', 0);
      hud.vignette(0);
      hud.outroShow(win(t, 93.5, 94.5) * (1 - win(t, DUR - 1.4, DUR - 0.2)), [0, 1, 2].map(i => win(t, 93.9 + i * 1.2, 94.7 + i * 1.2)));
    };
    return ep;
  }
});
