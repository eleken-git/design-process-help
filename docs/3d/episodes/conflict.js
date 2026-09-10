/* Епізод 00 · Конфлікт у Git */
window.EPISODES.push({
  id: 'conflict', order: 0, num: '00',
  title: 'Конфлікт у Git', kicker: 'Git для дизайнерів · епізод 00',
  subtitle: 'Двоє змінили той самий рядок. Що покаже git, як це виглядає всередині файлу і три способи це розв’язати.',
  music: 'episodes/conflict.mp3',
  legend: [{ color: '#58A6FF', text: 'Аня · feat/dashboard-title' }, { color: '#F78166', text: 'Богдан · feat/settings-title' }, { color: '#E6EDF3', text: 'main' }],
  build(ctx) {
    const { THREE, C, HEX, mk, tex, hud } = ctx;
    const { clamp, clamp01, lerp, ease, easeOut, win, pulse } = ctx.u;

    const BEATS = [
      { id: 'intro', t0: 0, t1: 6.5, num: '', ttl: '', cap: '', term: [] },
      { id: 'start', t0: 6.5, t1: 15.5, num: '01', ttl: 'Одна точка старту',
        cap: 'Аня і Богдан беруть різні задачі. Кожен просить Claude почати нову гілку від свіжого <b>main</b> — це особиста копія коду тільки для цієї задачі.',
        term: [{ x: 'git switch main && git pull' }, { x: 'git switch -c feat/dashboard-title   # Аня' }, { x: 'git switch -c feat/settings-title    # Богдан' }] },
      { id: 'file', t0: 15.5, t1: 25.5, num: '02', ttl: 'Обоє відкривають той самий файл',
        cap: 'Аня працює над Dashboard, Богдан — над Settings. Але назва продукту живе в спільному файлі-оболонці <b>src/App.tsx</b>. Обидва бачать той самий рядок 13.',
        term: [{ x: 'src/App.tsx · рядок 13', c: 'c' }, { x: '<a className="brand">Nimbus</a>' }] },
      { id: 'edits', t0: 25.5, t1: 34.5, num: '03', ttl: 'Кожен змінює той самий рядок',
        cap: 'Аня пише <b>Nimbus&nbsp;Cloud</b>, Богдан — <b>Nimbus&nbsp;Pro</b>. Поки вони в різних гілках, конфлікту немає: у кожного свій рядок 13 і свій «всесвіт».',
        term: [{ x: '# у гілці Ані', c: 'c' }, { x: 'Nimbus Cloud', c: 'p' }, { x: '# у гілці Богдана', c: 'c' }, { x: 'Nimbus Pro', c: 'p' }] },
      { id: 'merge1', t0: 34.5, t1: 44.5, num: '04', ttl: 'Аня зливає першою',
        cap: 'Богдан перевіряє її Pull Request і схвалює. Кнопка <b>Squash and merge</b> — і в <b>main</b> тепер «Nimbus Cloud». Богдан про це ще не знає: у його гілці досі старий рядок.',
        term: [{ x: 'PR #12 · feat/dashboard-title → main', c: 'c' }, { x: '✓ Approved · ✓ build passed', c: 'ok' }, { x: 'Squash and merge', c: 'ok' }] },
      { id: 'conflict', t0: 44.5, t1: 55.5, num: '05', ttl: 'Богдан підтягує main — і ось він, конфлікт',
        cap: 'Богдан каже Claude «підтягни main у мою гілку». Git бере свіжий <b>main</b> і накладає на гілку Богдана. Усі інші файли зливаються самі. Але рядок 13 змінили обидва — і тут git зупиняється.',
        term: [{ x: 'git merge main' }, { x: 'Auto-merging src/App.tsx', c: 'c' }, { x: 'CONFLICT (content): Merge conflict in src/App.tsx', c: 'err' }, { x: 'Automatic merge failed; fix conflicts and then commit the result.', c: 'err' }] },
      { id: 'markers', t0: 55.5, t1: 66, num: '06', ttl: 'Що git написав усередині файлу',
        cap: 'Це не поломка і нічого не зникло. Git просто поклав <b>обидві версії рядка</b> одна під одною і питає: чия лишається? Зверху — твоя, знизу — та, що прийшла з main.', term: [] },
      { id: 'optA', t0: 66, t1: 72.5, num: '07', chipSuffix: ' A', chip: 'Залишити своє', ttl: 'Варіант A · Залишити своє',
        cap: 'У редакторі це кнопка <b>Accept Current Change</b>. Лишається «Nimbus Pro», зміна Ані зникає. Обирай, коли твоя версія свіжіша й узгоджена з клієнтом.',
        term: [{ x: 'Accept Current Change → Nimbus Pro', c: 'p' }] },
      { id: 'optB', t0: 72.5, t1: 79, num: '07', chipSuffix: ' B', chip: 'Взяти з main', ttl: 'Варіант B · Взяти з main',
        cap: 'Кнопка <b>Accept Incoming Change</b>. Лишається «Nimbus Cloud», твоя правка зникає. Обирай, коли колега вже узгодив цю назву раніше за тебе.',
        term: [{ x: 'Accept Incoming Change → Nimbus Cloud', c: 'p' }] },
      { id: 'optC', t0: 79, t1: 86.5, num: '07', chipSuffix: ' C', chip: 'Домовитись', ttl: 'Варіант C · Домовитись і написати третє',
        cap: 'Дві хвилини в чаті — і ви пишете спільний варіант руками. Найчастіше правильний вибір, бо конфлікт тут не технічний, а про рішення: як усе-таки називається продукт.',
        term: [{ x: '# Аня: лишаємо просто Nimbus?', c: 'c' }, { x: '# Богдан: 👍', c: 'c' }, { x: 'Nimbus', c: 'ok' }] },
      { id: 'resolve', t0: 86.5, t1: 96, num: '08', ttl: 'Прибрали маркери — і злиття завершене',
        cap: 'Видаляєш рядки <b>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</b>, <b>=======</b>, <b>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</b> і зайву версію. Claude робить це за тебе, коли ти кажеш, який варіант лишити. Далі — звичайний коміт і пуш.',
        term: [{ x: 'git add -A && git commit' }, { x: "[feat/settings-title] Merge branch 'main'", c: 'ok' }, { x: 'git push' }, { x: 'PR #13 → Squash and merge', c: 'ok' }] },
      { id: 'prevent', t0: 96, t1: 106, num: '09', ttl: 'Щоб конфліктів майже не було',
        cap: 'Різні екрани — різні папки, тож 95% роботи не перетинається. Спільний код міняємо окремим маленьким PR. І щодня кажемо «підтягни main» — тоді конфлікт це один рядок, а не двісті.',
        term: [{ x: '# щоранку, у кожній гілці', c: 'c' }, { x: 'git merge main', c: 'ok' }] }
    ];
    const DUR = 106;
    const CAM = [
      { t: 0.0, p: [0.0, 2.2, 26.0], l: [0.0, 1.6, 0.0] }, { t: 6.5, p: [-4.2, 0.2, 17.0], l: [-3.6, -0.6, 0.0] },
      { t: 15.5, p: [-1.0, 0.2, 18.5], l: [-2.4, -0.2, 0.0] }, { t: 25.5, p: [-1.0, 0.2, 18.2], l: [-2.4, -0.2, 0.0] },
      { t: 34.5, p: [2.2, 1.5, 12.5], l: [1.4, 0.9, 0.0] }, { t: 44.5, p: [2.8, -0.6, 12.0], l: [2.0, -1.6, 0.0] },
      { t: 55.5, p: [-0.7, -4.5, 9.4], l: [-0.7, -5.1, 2.4] }, { t: 66.0, p: [1.4, 0.2, 19.0], l: [1.0, -1.0, 3.0] },
      { t: 72.5, p: [1.4, 0.2, 19.0], l: [1.0, -1.0, 3.0] }, { t: 79.0, p: [1.4, 0.2, 19.0], l: [1.0, -1.0, 3.0] },
      { t: 86.5, p: [-0.6, -2.0, 13.0], l: [-1.4, -3.0, 0.0] }, { t: 96.0, p: [0.6, 0.6, 27.0], l: [0.0, -0.2, 0.0] }, { t: 106, p: [0.6, 0.6, 27.0], l: [0.0, -0.2, 0.0] }
    ];

    /* ---------- граф ---------- */
    const Y_A = 2.4, Y_B = -2.4;
    const X = { base: -6, a1: -4.2, a2: -2.6, a3: -1.0, aTip: 1.6, mergeA: 3.4, bPull: 4.6, bFix: 5.6, bTip: 6.2, mergeB: 7.4 };
    const trunk = mk.tube([[-34, 0, 0], [-10, 0, 0], [10, 0, 0], [34, 0, 0]], C.text, 0.085);
    const aWork = mk.tube([[X.base, 0, 0], [-5.5, 1.0, 0], [-4.9, Y_A, 0], [-2, Y_A, 0], [X.aTip, Y_A, 0]], C.blue);
    const aMerge = mk.tube([[X.aTip, Y_A, 0], [2.5, Y_A, 0], [3.05, 1.1, 0], [X.mergeA, 0, 0]], C.blue);
    const bWork = mk.tube([[X.base, 0, 0], [-5.5, -1.0, 0], [-4.9, Y_B, 0], [-2, Y_B, 0], [X.bTip, Y_B, 0]], C.orange);
    const bMerge = mk.tube([[X.bTip, Y_B, 0], [7.0, Y_B, 0], [7.2, -1.1, 0], [X.mergeB, 0, 0]], C.orange);
    const pull = mk.tube([[X.mergeA, 0, 0], [3.9, -0.5, 0], [4.2, -1.7, 0], [X.bPull, Y_B, 0]], C.purple, 0.05);

    const cBase = mk.commit(X.base, 0, C.text, 0.2);
    const cA = [mk.commit(X.a1, Y_A, C.blue), mk.commit(X.a2, Y_A, C.blue), mk.commit(X.a3, Y_A, C.blue)];
    const cB = [mk.commit(X.a1, Y_B, C.orange), mk.commit(X.a2, Y_B, C.orange), mk.commit(X.a3, Y_B, C.orange)];
    const cMergeA = mk.commit(X.mergeA, 0, C.purple, 0.26), cPull = mk.commit(X.bPull, Y_B, C.red, 0.26), cFix = mk.commit(X.bFix, Y_B, C.green, 0.22), cMergeB = mk.commit(X.mergeB, 0, C.purple, 0.26);
    const ringA = mk.ring(X.mergeA, 0, C.purple, 0.5), ringB = mk.ring(X.mergeB, 0, C.purple, 0.5), shock = mk.ring(X.bPull, Y_B, C.red, 0.5);

    // підписи — зліва, над своїми лініями, не торкаються кривих
    const labA = mk.label('Аня', 'feat/dashboard-title', HEX(C.blue), -8.4, Y_A + 1.35, 4.0);
    const labB = mk.label('Богдан', 'feat/settings-title', HEX(C.orange), -8.4, Y_B + 1.35, 4.0);
    const labMain = mk.label('main', null, HEX(C.text), -9.6, 0.9, 2.6);

    /* ---------- картки ---------- */
    const LINE = (n, x, o) => Object.assign({ n, x }, o || {});
    const codeBase = (badge, badgeColor, badgeBg, accent, name, nameColor) => tex.codeCard({
      file: 'src/App.tsx', badge, badgeColor, badgeBg, accent,
      lines: [LINE(12, '<a className="brand" href="#/">', { c: HEX(C.muted) }),
        LINE(13, '  ' + name, { c: nameColor || HEX(C.text), bold: true, bg: nameColor ? 'rgba(110,118,129,.14)' : null, bar: nameColor }),
        LINE(14, '</a>', { c: HEX(C.muted) })]
    });
    const texA0 = codeBase('гілка Ані', HEX(C.blue), 'rgba(56,139,253,.15)', HEX(C.blue), 'Nimbus');
    const texA1 = codeBase('Аня змінила', HEX(C.blue), 'rgba(56,139,253,.15)', HEX(C.blue), 'Nimbus Cloud', HEX(C.blue));
    const texB0 = codeBase('гілка Богдана', HEX(C.orange), 'rgba(219,109,40,.18)', HEX(C.orange), 'Nimbus');
    const texB1 = codeBase('Богдан змінив', HEX(C.orange), 'rgba(219,109,40,.18)', HEX(C.orange), 'Nimbus Pro', HEX(C.orange));
    const texMain = codeBase('main', HEX(C.green), 'rgba(46,160,67,.16)', HEX(C.green), 'Nimbus Cloud', HEX(C.green));
    const texConflict = tex.codeCard({
      file: 'src/App.tsx', badge: 'CONFLICT', badgeColor: HEX(C.red), badgeBg: 'rgba(248,81,73,.16)', accent: HEX(C.red),
      lines: [LINE(12, '<a className="brand" href="#/">', { c: HEX(C.muted) }),
        LINE(13, '<<<<<<< HEAD', { c: HEX(C.orange), bold: true, bg: 'rgba(219,109,40,.13)', bar: HEX(C.orange) }),
        LINE(14, '  Nimbus Pro', { c: HEX(C.text), bg: 'rgba(219,109,40,.13)', bar: HEX(C.orange) }),
        LINE(15, '=======', { c: HEX(C.muted), bold: true }),
        LINE(16, '  Nimbus Cloud', { c: HEX(C.text), bg: 'rgba(56,139,253,.13)', bar: HEX(C.blue) }),
        LINE(17, '>>>>>>> main', { c: HEX(C.blue), bold: true, bg: 'rgba(56,139,253,.13)', bar: HEX(C.blue) }),
        LINE(18, '</a>', { c: HEX(C.muted) })],
      foot: 'зверху твоє · знизу те, що прийшло з main'
    });
    const texResolved = tex.codeCard({
      file: 'src/App.tsx', badge: "розв'язано", badgeColor: HEX(C.green), badgeBg: 'rgba(46,160,67,.16)', accent: HEX(C.green),
      lines: [LINE(12, '<a className="brand" href="#/">', { c: HEX(C.muted) }), LINE(13, '  Nimbus', { c: HEX(C.green), bold: true, bg: 'rgba(46,160,67,.13)', bar: HEX(C.green) }), LINE(14, '</a>', { c: HEX(C.muted) })],
      foot: 'маркерів немає · файл знову валідний', footC: HEX(C.green)
    });
    const cardA = mk.card(texA0, 0.9, Y_A + 2.35, 4.6), cardB = mk.card(texB0, 0.9, Y_B - 2.35, 4.6), cardMain = mk.card(texMain, 5.0, 1.1, 4.0);
    const leadA = mk.leader(0.9, Y_A + 0.25, Y_A + 0.85, C.blue), leadB = mk.leader(0.9, Y_B - 0.25, Y_B - 0.85, C.orange);

    const OPTS = [
      { key: 'A', title: 'Залишити своє', sub: 'Accept Current Change', color: HEX(C.orange), result: 'Nimbus Pro', resultLabel: 'рядок 13 стане', when: 'Твоя версія свіжіша або вже узгоджена з клієнтом.', loss: 'Зміну Ані доведеться вносити заново.', lossC: HEX(C.yellow) },
      { key: 'B', title: 'Взяти з main', sub: 'Accept Incoming Change', color: HEX(C.blue), result: 'Nimbus Cloud', resultLabel: 'рядок 13 стане', when: 'Колега вже узгодив цю назву раніше за тебе.', loss: 'Твоя правка зникає — переконайся, що не шкода.', lossC: HEX(C.yellow) },
      { key: 'C', title: 'Домовитись', sub: '2 хвилини в чаті', color: HEX(C.green), result: 'Nimbus', resultLabel: 'рядок 13 стане', when: 'Майже завжди: конфлікт не технічний, а про рішення.', loss: 'Нічого. Обидва знають, чому саме так.', lossC: HEX(C.green) }
    ];
    const optCards = OPTS.map((o, i) => { const m = mk.card(tex.optionCard(o), -5.0 + i * 5.0, 0.4, 4.3, 1); m.position.z = 6.0; m.userData.base = m.position.clone(); return m; });

    hud.outro(['Різні екрани — різні папки. 95% роботи не перетинається.', 'Спільний код — окремим маленьким PR, який дивляться обидва.', 'Щодня «підтягни main». Тоді конфлікт — один рядок, а не двісті.']);

    const ep = { BEATS, DUR, CAM, dim: 1 };
    const setOp = (mat, v) => { mat.opacity = clamp01(v) * ep.dim; };
    const ring = (t, m, t0, t1, r0, r1) => { const p = win(t, t0, t1); m.scale.setScalar(lerp(r0, r1, easeOut(p))); setOp(m.material, Math.sin(clamp01(p) * Math.PI) * 0.9); };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    ep.update = function (t) {
      ep.dim = clamp(1 - 0.86 * (win(t, 65.2, 67.0) - win(t, 86.3, 87.6)), 0.14, 1);
      mk.revealTo(trunk, lerp(-34, 34, easeOut(win(t, 6.0, 8.0))));
      mk.revealTo(aWork, t < 25 ? lerp(-6.05, -0.55, easeOut(win(t, 8.2, 11.2))) : lerp(-0.55, X.aTip, win(t, 25, 34)));
      mk.revealTo(bWork, t < 25 ? lerp(-6.05, -0.55, easeOut(win(t, 8.8, 11.8))) : (t < 88 ? lerp(-0.55, X.bPull, win(t, 25, 47)) : lerp(X.bPull, X.bTip, easeOut(win(t, 88, 93)))));
      mk.revealTo(aMerge, lerp(X.aTip, X.mergeA + .05, easeOut(win(t, 36.5, 38.6))));
      mk.revealTo(pull, lerp(X.mergeA, X.bPull + .05, easeOut(win(t, 47.0, 49.2))));
      mk.revealTo(bMerge, lerp(X.bTip, X.mergeB + .05, easeOut(win(t, 92.6, 94.2))));
      setOp(trunk.material, 0.92);
      setOp(aWork.material, win(t, 8.0, 8.6) * (1 - 0.55 * win(t, 39.5, 41.5)));
      setOp(aMerge.material, win(t, 36.3, 36.8) * (1 - 0.55 * win(t, 39.5, 41.5)));
      setOp(bWork.material, win(t, 8.6, 9.2)); setOp(bMerge.material, win(t, 92.4, 92.9));
      setOp(pull.material, win(t, 46.8, 47.3) * (0.45 + 0.55 * (1 - win(t, 88, 92))));

      mk.pop(cBase, t, 7.0, setOp);
      [11.2, 12.1, 13.0].forEach((tt, i) => mk.pop(cA[i], t, tt, setOp));
      [11.9, 12.8, 13.7].forEach((tt, i) => mk.pop(cB[i], t, tt, setOp));
      mk.pop(cMergeA, t, 38.6, setOp); mk.pop(cPull, t, 49.2, setOp); mk.pop(cFix, t, 89.6, setOp); mk.pop(cMergeB, t, 94.2, setOp);
      { const alive = win(t, 49.2, 49.8) * (1 - win(t, 88.4, 89.4)), beat = 0.5 + 0.5 * Math.sin(t * 5.0);
        setOp(cPull.glow.material, alive * (0.45 + 0.55 * beat)); cPull.glow.scale.setScalar(2.2 + 0.5 * beat);
        const col = t > 89.0 ? C.green : C.red; cPull.core.material.color.setHex(col); cPull.glow.material.color.setHex(col); }
      ring(t, ringA, 38.6, 41.0, 0.6, 2.6); ring(t, ringB, 94.2, 96.4, 0.6, 2.6); ring(t, shock, 49.2, 52.0, 0.6, 4.2);

      const labHide = win(t, 33.5, 35.0) * (1 - win(t, 95.0, 96.5));
      setOp(labA.material, win(t, 8.8, 9.8) * (1 - 0.6 * win(t, 40, 42)) * (1 - labHide));
      setOp(labB.material, win(t, 9.4, 10.4) * (1 - labHide));
      setOp(labMain.material, win(t, 6.9, 8.0) * (1 - 0.7 * labHide));

      const aIn = win(t, 16.4, 17.4) * (1 - win(t, 39.6, 41.2));
      cardA.material.opacity = clamp01(aIn) * ep.dim; cardA.material.map = t >= 27.6 ? texA1 : texA0;
      cardA.position.copy(cardA.userData.base); cardA.position.y += 0.10 * Math.sin(t * 0.8) + 0.55 * (1 - easeOut(win(t, 16.4, 17.6)));
      cardA.scale.setScalar(1 + 0.05 * pulse(t, 27.4, 28.6)); setOp(leadA.material, aIn * 0.7);

      const bIn = win(t, 17.2, 18.2) * (1 - win(t, 96.4, 98.0)) * (1 - win(t, 34.6, 35.6) * (1 - win(t, 46.6, 47.6)));
      cardB.material.map = t >= 88.4 ? texResolved : (t >= 49.4 ? texConflict : (t >= 29.6 ? texB1 : texB0));
      const focus = win(t, 55.6, 57.4) * (1 - win(t, 64.6, 66.2)), kConf = win(t, 47.0, 49.5) * (1 - win(t, 55.6, 57.4));
      cardB.position.copy(cardB.userData.base); cardB.position.lerp(V(4.5, -3.6, 1.2), ease(kConf)); cardB.position.lerp(V(0.9, -4.9, 2.4), ease(focus));
      cardB.position.y += 0.10 * Math.sin(t * 0.7 + 1.3) - 0.55 * (1 - easeOut(win(t, 17.2, 18.4)));
      cardB.scale.setScalar((1 + 0.08 * ease(focus)) * (1 + 0.05 * pulse(t, 29.4, 30.6) + 0.07 * pulse(t, 49.2, 50.6) + 0.06 * pulse(t, 88.2, 89.6)));
      cardB.material.opacity = clamp01(bIn) * (ep.dim + (1 - ep.dim) * 0.35 * focus); setOp(leadB.material, bIn * 0.7 * (1 - focus));

      cardMain.material.opacity = clamp01(win(t, 39.8, 41.0) * (1 - win(t, 86.0, 87.6))) * ep.dim;
      cardMain.position.copy(cardMain.userData.base); cardMain.position.y += 0.09 * Math.sin(t * 0.9 + 2.1) + 0.5 * (1 - easeOut(win(t, 39.8, 41.2)));

      const optWin = [[66, 72.5], [72.5, 79], [79, 86.5]];
      optCards.forEach((m, i) => {
        const shown = win(t, 66.2 + i * 0.45, 67.2 + i * 0.45) * (1 - win(t, 86.4, 87.5));
        const act = (t >= optWin[i][0] - 0.4 && t < optWin[i][1]) ? win(t, optWin[i][0] - 0.4, optWin[i][0] + 0.7) * (1 - win(t, optWin[i][1] - 0.5, optWin[i][1] + 0.3)) : 0;
        const b = m.userData.base;
        m.position.set(lerp(b.x, 1.6, ease(act)), lerp(b.y, -0.2, ease(act)) + 0.08 * Math.sin(t * 0.7 + i), lerp(b.z, 9.4, ease(act)));
        m.scale.setScalar(lerp(0.86, 1.0, ease(act)) * lerp(0.9, 1, easeOut(shown))); m.material.opacity = clamp01(shown) * lerp(0.3, 1, act);
      });

      hud.vignette(Math.max(pulse(t, 49.0, 54.0) * 0.5, 0));
      hud.legend(win(t, 7.5, 8.6) * (1 - win(t, 64.8, 66.0)) + win(t, 87.6, 88.6) * (1 - win(t, DUR - 1.5, DUR)));
      if (t >= 38.4 && t < 44.3) hud.badge('● PR #12 · merged', 'purple', win(t, 38.4, 39.0) * (1 - win(t, 43.6, 44.3)));
      else if (t >= 49.0 && t < 66.0) hud.badge('⚠ CONFLICT · src/App.tsx', 'red', win(t, 49.0, 49.7) * (1 - win(t, 65.2, 66.0)));
      else if (t >= 94.0 && t < 99.0) hud.badge('✓ PR #13 · merged', 'green', win(t, 94.0, 94.7) * (1 - win(t, 98.2, 99.0)));
      else hud.badge('', '', 0);
      hud.outroShow(win(t, 99.0, 100.0) * (1 - win(t, DUR - 1.4, DUR - 0.2)), [0, 1, 2].map(i => win(t, 99.4 + i * 1.3, 100.2 + i * 1.3)));
    };
    return ep;
  }
});
