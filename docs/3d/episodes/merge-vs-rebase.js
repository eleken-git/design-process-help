/* Епізод 05 · merge main vs rebase main */
window.EPISODES.push({
  id: 'merge-vs-rebase', order: 5, num: '05',
  title: 'merge main vs rebase main', kicker: 'Git для дизайнерів · епізод 05',
  subtitle: 'Два способи взяти свіжий main у свою гілку. Merge додає вузол, rebase переписує твої коміти — і чому друге не роблять у гілці, яку вже бачив колега.',
  music: 'episodes/merge-vs-rebase.mp3',
  legend: [{ color: '#58A6FF', text: 'Аня · feat/dashboard-churn' }, { color: '#E6EDF3', text: 'main · PR #14 Богдана злитий' }, { color: '#A371F7', text: 'merge commit' }, { color: '#F78166', text: 'Богдан · від гілки Ані' }],
  build(ctx) {
    const { THREE, C, HEX, mk, tex, hud } = ctx;
    const { clamp, clamp01, lerp, ease, easeOut, win, pulse } = ctx.u;

    const BEATS = [
      { id: 'intro', t0: 0, t1: 6.5, num: '', ttl: '', cap: '', term: [] },
      { id: 'start', t0: 6.5, t1: 17, num: '01', ttl: 'Поки ти працювала, main пішов далі',
        cap: 'Аня три дні робить картку відтоку в гілці <b>feat/dashboard-churn</b>: три коміти. Тим часом PR Богдана злили — у <b>main</b> два нові коміти, яких у її гілці ще немає.',
        term: [{ x: 'git switch -c feat/dashboard-churn' }, { x: '# коміти Ані: a1 a2 a3', c: 'c' }, { x: '# тим часом у main злито PR #14 Богдана: m1 m2', c: 'c' }] },
      { id: 'two', t0: 17, t1: 27, num: '02', ttl: 'Два способи взяти свіжий main',
        cap: 'Аня хоче ці зміни собі в гілку: перевірити, що все працює разом, і щоб PR потім злився без сюрпризів. Способів два, і вони дають <b>різну історію</b>. Подивимось обидва паралельно: зверху merge, знизу rebase.',
        term: [{ x: 'git merge main    # спосіб 1' }, { x: 'git rebase main   # спосіб 2' }] },
      { id: 'merge', t0: 27, t1: 41, num: '03', ttl: 'merge main: додається вузол, твої коміти ті самі',
        cap: 'Git бере верхівку <b>main</b> і зшиває її з твоєю гілкою одним новим комітом — <b>merge commit</b>. Твої a1, a2, a3 не змінилися: ті самі ідентифікатори, ті самі дати. Історія каже правду: тут дві лінії зійшлися.',
        term: [{ x: 'git merge main' }, { x: "Merge made by the 'ort' strategy.", c: 'c' }, { x: '# a1 a2 a3 без змін · + merge commit e4f', c: 'ok' }] },
      { id: 'rebase', t0: 41, t1: 57, num: '04', ttl: 'rebase main: твої коміти переписуються заново',
        cap: 'Git «знімає» твої коміти, переставляє гілку на нову верхівку <b>main</b> і накладає їх знову, один за одним. Це <b>нові</b> коміти з новими ідентифікаторами, старі зникають. Історія — пряма лінія, ніби ти починала від свіжого main.',
        term: [{ x: 'git rebase main' }, { x: 'Rewinding head to replay your work on top of it...', c: 'c' }, { x: 'Applying: dashboard: картка відтоку  (×3)', c: 'c' }, { x: '# a1 a2 a3 → b7 c2 d9. Старих більше немає', c: 'p' }] },
      { id: 'compare', t0: 57, t1: 67, num: '05', ttl: 'Дві історії однієї роботи',
        cap: 'Код у файлах однаковий в обох випадках. Різниця тільки в історії: merge лишає вузол і правду про те, як було; rebase малює пряму лінію, але переписує минуле. Поки гілка тільки твоя — це лише питання смаку.', term: [] },
      { id: 'danger', t0: 67, t1: 83, num: '06', ttl: 'Чому rebase не роблять у гілці, яку хтось бачив',
        cap: 'Богдан учора відгалузився від твого a3, щоб допомогти з карткою. Після rebase твоїх a1–a3 більше немає: його гілка тримається за коміти-привиди. Його PR ламається, а твій push не приймають, бо історії розійшлися. Лишається force push, який перепише те, що він уже бачив.',
        term: [{ x: 'git push' }, { x: '! [rejected]  feat/dashboard-churn (non-fast-forward)', c: 'err' }, { x: 'git push --force   # перепише історію, яку бачив Богдан', c: 'err' }] },
      { id: 'rule', t0: 83, t1: 94, num: '07', ttl: 'Правило команди',
        cap: 'Гілка тільки твоя і ще не запушена — rebase можна, історія буде чистішою. Гілку вже бачив хтось інший — тільки <b>merge main</b>. У цьому проєкті просто кажемо Claude «підтягни main», і це завжди merge.',
        term: [{ x: '# у CLAUDE.md', c: 'c' }, { x: 'git merge main    # «підтягни main»', c: 'ok' }, { x: '# rebase — лише у своїй незапушеній гілці', c: 'c' }] },
      { id: 'summary', t0: 94, t1: 104, num: '08', ttl: 'Merge зшиває, rebase переписує', cap: '', term: [] }
    ];
    const DUR = 104;
    // текст епізоду живе знизу ліворуч (до 40 % висоти), тож обидва світи тримаємо у верхній частині кадру
    const CAM = [
      { t: 0.0, p: [1.4, 3.0, 30.0], l: [1.4, 2.0, 0.0] }, { t: 6.5, p: [-1.0, 5.4, 15.0], l: [-1.2, 4.2, 0.0] },
      { t: 17.0, p: [1.6, 2.4, 23.5], l: [1.4, 1.0, 0.0] }, { t: 27.0, p: [-0.4, 5.4, 14.0], l: [-0.8, 4.2, 0.0] },
      { t: 41.0, p: [0.8, 1.2, 15.0], l: [0.4, 0.2, 0.0] }, { t: 57.0, p: [3.0, 3.0, 21.5], l: [2.8, 1.6, 0.0] },
      { t: 67.0, p: [1.0, 1.2, 14.5], l: [0.6, 0.2, 0.0] }, { t: 83.0, p: [1.4, 0.2, 19.0], l: [1.0, -1.0, 3.0] },
      { t: 94.0, p: [1.6, 3.4, 27.0], l: [1.4, 1.0, 0.0] }, { t: 104, p: [1.6, 3.4, 27.0], l: [1.4, 1.0, 0.0] }
    ];

    // бирка ідентифікатора коміта: 256×112, великий моношрифт — читається навіть з далекої камери
    function tag(text, colorHex, x, y) {
      const el = document.createElement('canvas'); el.width = 256; el.height = 112; const g = el.getContext('2d');
      g.fillStyle = 'rgba(13,17,23,.9)'; g.beginPath(); g.roundRect(4, 4, 248, 104, 52); g.fill();
      g.strokeStyle = colorHex; g.lineWidth = 4; g.stroke();
      g.fillStyle = colorHex; g.font = '600 62px ui-monospace, SFMono-Regular, Menlo, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 60);
      const map = new THREE.CanvasTexture(el); map.anisotropy = 8;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
      sp.scale.set(1.0, 0.4375, 1); sp.position.set(x, y, 0.2); ctx.scene.add(sp); return sp;
    }

    /* ---------- два світи: зверху merge, знизу rebase ---------- */
    const X = { base: -5.2, a1: -3.4, a2: -2.2, a3: -1.0, m1: -3.0, m2: -1.4, merge: 1.0, n1: 0.6, n2: 1.8, n3: 3.0, b1: 0.4, b2: 1.4 };
    function world(Y0) {
      const trunkY = Y0 - 1.1, branchY = Y0 + 1.1;
      const w = { Y0, trunkY, branchY };
      w.trunk = mk.tube([[-30, trunkY, 0], [-9, trunkY, 0], [9, trunkY, 0], [30, trunkY, 0]], C.text, 0.085);
      w.branch = mk.tube([[X.base, trunkY, 0], [-4.7, trunkY + 0.55, 0], [-4.1, branchY, 0], [X.a3, branchY, 0], [X.merge, branchY, 0], [3.4, branchY, 0]], C.blue);
      w.cBase = mk.commit(X.base, trunkY, C.text, 0.2);
      w.cA = [X.a1, X.a2, X.a3].map(x => mk.commit(x, branchY, C.blue));
      w.cM = [X.m1, X.m2].map(x => mk.commit(x, trunkY, C.text, 0.2));
      w.tagA = ['a1', 'a2', 'a3'].map((s, i) => tag(s, HEX(C.blue), [X.a1, X.a2, X.a3][i], branchY + 0.62));
      // підписи ліворуч, між лініями: там гілка ще не піднялася, і в крупному плані вони не ріжуться краєм кадру
      w.labA = mk.label('Аня', 'feat/dashboard-churn', HEX(C.blue), -6.9, branchY - 0.8, 3.9);
      w.labMain = mk.label('main', null, HEX(C.text), -7.0, trunkY + 0.62, 2.4);
      return w;
    }
    const TOP = world(5.0), BOT = world(0.4);
    // merge-світ: шов від верхівки main до гілки і merge commit
    const seam = mk.tube([[X.m2, TOP.trunkY, 0], [-0.6, TOP.trunkY + 0.5, 0], [0.4, TOP.branchY - 0.4, 0], [X.merge, TOP.branchY, 0]], C.purple, 0.06);
    const cMerge = mk.commit(X.merge, TOP.branchY, C.purple, 0.26), ringMerge = mk.ring(X.merge, TOP.branchY, C.purple, 0.5);
    const tagMerge = tag('e4f', HEX(C.purple), X.merge, TOP.branchY + 0.62);
    // rebase-світ: нова гілка від верхівки main, нові коміти; стара гілка стає привидом
    const fresh = mk.tube([[X.m2, BOT.trunkY, 0], [-0.9, BOT.trunkY + 0.55, 0], [-0.3, BOT.branchY, 0], [X.n1, BOT.branchY, 0], [X.n3, BOT.branchY, 0], [3.6, BOT.branchY, 0]], C.blue);
    const cN = [X.n1, X.n2, X.n3].map(x => mk.commit(x, BOT.branchY, C.blue));
    const tagN = ['b7', 'c2', 'd9'].map((s, i) => tag(s, HEX(C.blue), [X.n1, X.n2, X.n3][i], BOT.branchY + 0.62));
    // Богдан відгалузився від старого a3 — після rebase його гілка тримається за привидів
    const bY = BOT.Y0 + 2.3;
    const bogTube = mk.tube([[X.a3, BOT.branchY + 0.9, 0], [-0.7, BOT.branchY + 1.15, 0], [-0.2, bY, 0], [X.b1, bY, 0], [X.b2, bY, 0], [2.2, bY, 0]], C.orange);
    const cB = [X.b1, X.b2].map(x => mk.commit(x, bY, C.orange));
    const labB = mk.label('Богдан', 'від гілки Ані', HEX(C.orange), 4.4, bY, 3.9);   // праворуч від його гілки, подалі від тексту
    const shock = mk.ring(X.b2, bY, C.red, 0.5);
    // підписи світів
    const labTop = mk.label('merge main', null, HEX(C.purple), -6.9, TOP.Y0 + 2.4, 3.6);
    const labBot = mk.label('rebase main', null, HEX(C.yellow), -6.9, BOT.Y0 + 2.4, 3.6);

    /* ---------- картки ---------- */
    const LINE = (n, x, o) => Object.assign({ n, x }, o || {});
    const logMerge = tex.codeCard({
      file: 'git log --oneline · після merge main', badge: 'вузол', badgeColor: HEX(C.purple), badgeBg: 'rgba(163,113,247,.16)', accent: HEX(C.purple),
      lines: [LINE('', "e4f  Merge 'main' into feat/dashboard-churn", { c: HEX(C.purple), bold: true, bar: HEX(C.purple), bg: 'rgba(163,113,247,.12)' }),
        LINE('', 'a3   dashboard: картка відтоку — дельта', { c: HEX(C.blue) }), LINE('', 'a2   dashboard: картка відтоку — значення', { c: HEX(C.blue) }),
        LINE('', 'a1   dashboard: картка відтоку — каркас', { c: HEX(C.blue) }), LINE('', 'm2   settings: безпека (PR #14)', { c: HEX(C.text) }),
        LINE('', 'm1   settings: двофакторка (PR #14)', { c: HEX(C.text) }), LINE('', '9c1  main до початку роботи', { c: HEX(C.muted) })],
      foot: 'твої коміти ті самі · плюс один вузол'
    });
    const logRebase = tex.codeCard({
      file: 'git log --oneline · після rebase main', badge: 'пряма лінія', badgeColor: HEX(C.yellow), badgeBg: 'rgba(210,153,34,.16)', accent: HEX(C.yellow),
      lines: [LINE('', 'd9   dashboard: картка відтоку — дельта', { c: HEX(C.blue), bold: true, bar: HEX(C.yellow), bg: 'rgba(210,153,34,.12)' }),
        LINE('', 'c2   dashboard: картка відтоку — значення', { c: HEX(C.blue), bold: true, bar: HEX(C.yellow), bg: 'rgba(210,153,34,.12)' }),
        LINE('', 'b7   dashboard: картка відтоку — каркас', { c: HEX(C.blue), bold: true, bar: HEX(C.yellow), bg: 'rgba(210,153,34,.12)' }),
        LINE('', 'm2   settings: безпека (PR #14)', { c: HEX(C.text) }), LINE('', 'm1   settings: двофакторка (PR #14)', { c: HEX(C.text) }),
        LINE('', '9c1  main до початку роботи', { c: HEX(C.muted) })],
      foot: 'a1 a2 a3 більше не існують', footC: HEX(C.yellow)
    });
    const cardMerge = mk.card(logMerge, 8.0, TOP.Y0 + 0.1, 7.0), cardRebase = mk.card(logRebase, 8.0, BOT.Y0 + 0.1, 7.0);

    const OPTS = [
      { key: 'M', title: 'merge main', sub: 'git merge main', color: HEX(C.green), result: 'вузол', resultLabel: 'історія', when: 'Гілку вже бачив хтось інший: колега, PR, перевірки. У цьому проєкті — завжди.', loss: 'Пряму лінію в історії. Нічого страшного.', lossC: HEX(C.green) },
      { key: 'R', title: 'rebase main', sub: 'git rebase main', color: HEX(C.yellow), result: 'пряма лінія', resultLabel: 'історія', when: 'Гілка тільки твоя і ще не запушена.', loss: 'Старі коміти. І колегу, якщо він від них відгалузився.', lossC: HEX(C.red) }
    ];
    const optCards = OPTS.map((o, i) => { const m = mk.card(tex.optionCard(o), -2.7 + i * 5.4, 0.5, 4.3, 1); m.position.z = 6.0; m.userData.base = m.position.clone(); return m; });

    hud.outro(['Merge зшиває дві лінії вузлом. Твої коміти лишаються твоїми.', 'Rebase переписує коміти заново. Старих більше немає.', 'Гілку бачив хтось інший — тільки merge. «Підтягни main» у цьому проєкті і є merge.']);

    const ep = { BEATS, DUR, CAM, dim: 1 };
    const setOp = (mat, v) => { mat.opacity = clamp01(v) * ep.dim; };
    const ring = (t, m, t0, t1, r0, r1) => { const p = win(t, t0, t1); m.scale.setScalar(lerp(r0, r1, easeOut(p))); setOp(m.material, Math.sin(clamp01(p) * Math.PI) * 0.9); };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    function drawWorld(w, t, vis, ghostOld) {
      // vis — наскільки світ видимий; ghostOld — наскільки стара гілка Ані стала привидом (тільки rebase-світ)
      const g = 1 - 0.78 * ghostOld;
      mk.revealTo(w.trunk, lerp(-30, 30, easeOut(win(t, 6.0, 8.0))));
      mk.revealTo(w.branch, lerp(X.base - 0.05, X.a3 + 0.05, easeOut(win(t, 8.4, 11.2))) + (w === TOP ? lerp(0, X.merge - X.a3, easeOut(win(t, 30.0, 32.4))) : 0));
      setOp(w.trunk.material, 0.92 * vis); setOp(w.branch.material, win(t, 8.2, 8.8) * vis * g);
      mk.pop(w.cBase, t, 7.0, (m, v) => setOp(m, v * vis));
      [10.2, 11.0, 11.8].forEach((tt, i) => { mk.pop(w.cA[i], t, tt, (m, v) => setOp(m, v * vis * g)); w.cA[i].g.position.y = w.branchY + 0.9 * ease(ghostOld); });
      [13.2, 14.1].forEach((tt, i) => mk.pop(w.cM[i], t, tt, (m, v) => setOp(m, v * vis)));
      w.tagA.forEach((s, i) => { setOp(s.material, win(t, 10.6 + i * 0.8, 11.2 + i * 0.8) * vis * (1 - ghostOld)); s.position.y = w.branchY + 0.62 + 0.9 * ease(ghostOld); });
      setOp(w.labA.material, win(t, 9.0, 10.0) * vis * (1 - 0.7 * ghostOld) * (1 - win(t, 56.5, 58)));
      setOp(w.labMain.material, win(t, 7.0, 8.0) * vis * (1 - win(t, 56.5, 58)));
    }

    ep.update = function (t) {
      ep.dim = clamp(1 - 0.86 * (win(t, 82.4, 84.0) - win(t, 93.6, 94.6)) - 0.65 * win(t, 95.2, 96.4), 0.14, 1);
      const ghost = win(t, 44.0, 46.2);                       // старі коміти Ані стають привидами в розділі 04
      // у крупних планах видно лише один світ: верхній ховаємо в розділах 04 і 06, нижній — у розділі 03
      const topVis = clamp01(1 - win(t, 41.0, 42.6) + win(t, 56.2, 57.6) - win(t, 67.0, 68.6) + win(t, 82.6, 84.0));
      const botIn = win(t, 17.6, 19.8) * clamp01(1 - win(t, 27.0, 28.4) + win(t, 40.2, 41.6));   // нижній світ з'являється в розділі 02
      drawWorld(TOP, t, topVis, 0);
      drawWorld(BOT, t, botIn, ghost);

      // merge-світ
      mk.revealTo(seam, lerp(X.m2, X.merge + 0.05, easeOut(win(t, 30.0, 32.4))));
      setOp(seam.material, win(t, 29.8, 30.3) * topVis);
      mk.pop(cMerge, t, 32.4, (m, v) => setOp(m, v * topVis)); ring(t, ringMerge, 32.4, 34.8, 0.6, 2.8);
      setOp(tagMerge.material, win(t, 33.0, 33.6) * topVis);
      TOP.tagA.forEach((s, i) => { const k = 1 + 0.14 * pulse(t, 35.0 + i * 0.6, 36.4 + i * 0.6); s.scale.set(1.0 * k, 0.4375 * k, 1); });   // «ті самі» — коротко пульсують

      // rebase-світ
      mk.revealTo(fresh, lerp(X.m2, X.n3 + 0.6, easeOut(win(t, 46.0, 49.0))));
      setOp(fresh.material, win(t, 45.8, 46.3) * botIn);
      [47.2, 48.0, 48.8].forEach((tt, i) => mk.pop(cN[i], t, tt, (m, v) => setOp(m, v * botIn)));
      tagN.forEach((s, i) => setOp(s.material, win(t, 47.6 + i * 0.8, 48.2 + i * 0.8) * botIn));

      // Богдан і зламаний PR
      const bogIn = win(t, 68.6, 69.4);
      mk.revealTo(bogTube, lerp(X.a3, 2.25, easeOut(win(t, 68.8, 71.0))));
      setOp(bogTube.material, bogIn * (1 - 0.35 * win(t, 75.0, 76.0)) * botIn);
      [71.0, 71.9].forEach((tt, i) => mk.pop(cB[i], t, tt, (m, v) => setOp(m, v * botIn)));
      setOp(labB.material, win(t, 69.4, 70.4) * botIn);
      ring(t, shock, 74.6, 77.6, 0.6, 4.0);
      { const alive = win(t, 74.6, 75.2) * (1 - win(t, 82.4, 83.2)), beat = 0.5 + 0.5 * Math.sin(t * 5.0);
        cB[1].glow.material.color.setHex(t >= 74.6 ? C.red : C.orange); cB[1].core.material.color.setHex(t >= 74.6 ? C.red : C.orange);
        cB[1].glow.material.opacity = clamp01((t >= 74.6 ? alive * (0.45 + 0.55 * beat) : cB[1].glow.material.opacity)) * ep.dim; }
      // привиди, за які тримається Богдан, мерехтять
      BOT.cA.forEach((o) => { const bl = win(t, 74.6, 75.4) * (1 - win(t, 82.4, 83.2)); o.shell.material.opacity = clamp01(0.12 + 0.25 * bl * (0.5 + 0.5 * Math.sin(t * 6 + o.x))) * ep.dim * botIn; });

      // підписи світів — з розділу 02, зникають на порівнянні
      // назви світів — лише в широких кадрах (розділи 02 і 05): у крупних планах вони лягали б на заголовок
      const worldLab = win(t, 18.2, 19.2) * (1 - win(t, 26.0, 27.0)) + win(t, 56.8, 57.8) * (1 - win(t, 66.2, 67.2));
      setOp(labTop.material, worldLab * topVis);
      setOp(labBot.material, worldLab * botIn);

      // картки історій — розділ 05
      const cmp = win(t, 57.8, 59.2) * (1 - win(t, 66.2, 67.2));
      [cardMerge, cardRebase].forEach((m, i) => { m.material.opacity = clamp01(cmp) * ep.dim; m.position.copy(m.userData.base); m.position.y += 0.08 * Math.sin(t * 0.7 + i) + 0.5 * (1 - easeOut(win(t, 57.8, 59.4))); m.scale.setScalar(lerp(0.9, 1, easeOut(cmp))); });

      // правило — дві картки над пригашеним графом
      optCards.forEach((m, i) => {
        const shown = win(t, 83.2 + i * 0.5, 84.2 + i * 0.5) * (1 - win(t, 93.4, 94.4));
        const b = m.userData.base; m.position.set(b.x, b.y + 0.08 * Math.sin(t * 0.7 + i), b.z);
        m.scale.setScalar(lerp(0.9, 1, easeOut(shown))); m.material.opacity = clamp01(shown);
      });

      hud.vignette(Math.max(pulse(t, 74.4, 80.0) * 0.45, 0));
      hud.legend(win(t, 18.4, 19.4) * (1 - win(t, 56.4, 57.6)) + win(t, 67.6, 68.6) * (1 - win(t, 82.2, 83.2)));
      if (t >= 32.6 && t < 40.6) hud.badge('● merge commit e4f · a1 a2 a3 без змін', 'purple', win(t, 32.6, 33.2) * (1 - win(t, 39.9, 40.6)));
      else if (t >= 49.2 && t < 56.6) hud.badge('↻ 3 нові коміти · старі зникли', 'yellow', win(t, 49.2, 49.8) * (1 - win(t, 55.9, 56.6)));
      else if (t >= 75.0 && t < 82.6) hud.badge('✗ PR #15 Богдана · історії розійшлися', 'red', win(t, 75.0, 75.6) * (1 - win(t, 81.9, 82.6)));
      else hud.badge('', '', 0);
      hud.outroShow(win(t, 95.4, 96.4) * (1 - win(t, DUR - 1.4, DUR - 0.2)), [0, 1, 2].map(i => win(t, 95.8 + i * 1.3, 96.6 + i * 1.3)));
    };
    return ep;
  }
});
