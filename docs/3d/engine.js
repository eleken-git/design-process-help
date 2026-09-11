/* Рушій: рендерер, камера, HUD, керування, музика, епізоди. Епізоди реєструються у window.EPISODES. */
(function () {
'use strict';

/* ============================== палітра й утиліти ============================== */
const C = {
  bg: 0x0D1117, surface: 0x161B22, border: 0x30363D, borderMuted: 0x21262D,
  text: 0xE6EDF3, muted: 0x8B949E, faint: 0x6E7681,
  blue: 0x58A6FF, orange: 0xF78166, green: 0x3FB950, red: 0xF85149, purple: 0xA371F7, yellow: 0xD29922
};
const HEX = (n) => '#' + n.toString(16).padStart(6, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clamp01 = (v) => clamp(v, 0, 1);
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeOutBack = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const win = (t, a, b) => clamp01((t - a) / Math.max(1e-6, b - a));
const pulse = (t, a, b) => Math.sin(win(t, a, b) * Math.PI);
const u = { clamp, clamp01, lerp, ease, easeOut, easeOutBack, win, pulse };

/* ============================== canvas-текстури ============================== */
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
function cv(w, h) { const el = document.createElement('canvas'); el.width = w; el.height = h; return el; }
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function wrap(g, text, x, y, maxW, lh) {
  const words = String(text).split(' '); let line = '', yy = y;
  for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test; }
  if (line) g.fillText(line, x, yy);
}
function tex(el) { const t = new THREE.CanvasTexture(el); t.anisotropy = 8; return t; }

/** Картка «шматок коду» 1280×800 */
function codeCard(o) {
  const W = 1280, H = 800, el = cv(W, H), g = el.getContext('2d');
  g.fillStyle = HEX(C.surface); rr(g, 8, 8, W - 16, H - 16, 26); g.fill();
  g.strokeStyle = o.accent || HEX(C.border); g.lineWidth = o.accent ? 6 : 3; rr(g, 8, 8, W - 16, H - 16, 26); g.stroke();
  g.fillStyle = '#010409'; rr(g, 8, 8, W - 16, 100, 26); g.fill();
  g.fillStyle = HEX(C.surface); g.fillRect(8, 86, W - 16, 22);
  g.strokeStyle = HEX(C.border); g.lineWidth = 2; g.beginPath(); g.moveTo(8, 108); g.lineTo(W - 8, 108); g.stroke();
  g.font = '500 38px ' + MONO; g.fillStyle = HEX(C.muted); g.textBaseline = 'middle'; g.fillText(o.file || 'file', 44, 60);
  if (o.badge) {
    g.font = '600 30px ' + MONO; const bw = g.measureText(o.badge).width + 48;
    g.fillStyle = o.badgeBg || 'rgba(110,118,129,.22)'; rr(g, W - 44 - bw, 30, bw, 60, 30); g.fill();
    g.strokeStyle = o.badgeColor || HEX(C.muted); g.lineWidth = 2; rr(g, W - 44 - bw, 30, bw, 60, 30); g.stroke();
    g.fillStyle = o.badgeColor || HEX(C.muted); g.fillText(o.badge, W - 44 - bw + 24, 61);
  }
  const lines = o.lines || [], startY = 176, lh = 64;
  lines.forEach((ln, i) => {
    const y = startY + i * lh;
    if (ln.bg) { g.fillStyle = ln.bg; g.fillRect(24, y - lh / 2 + 6, W - 48, lh - 6); }
    if (ln.bar) { g.fillStyle = ln.bar; g.fillRect(24, y - lh / 2 + 6, 8, lh - 6); }
    g.font = '400 30px ' + MONO; g.fillStyle = HEX(C.faint); if (ln.n) g.fillText(String(ln.n).padStart(2, ' '), 56, y);
    g.font = (ln.bold ? '600 40px ' : '400 40px ') + MONO; g.fillStyle = ln.c || HEX(C.text); g.fillText(ln.x, 132, y);
  });
  if (o.foot) { g.font = '500 30px ' + SANS; g.fillStyle = o.footC || HEX(C.muted); g.fillText(o.foot, 44, H - 64); }
  return tex(el);
}
/** Картка варіанта рішення 1024×1024 */
function optionCard(o) {
  const W = 1024, H = 1024, el = cv(W, H), g = el.getContext('2d');
  g.fillStyle = HEX(C.surface); rr(g, 10, 10, W - 20, H - 20, 30); g.fill();
  g.strokeStyle = o.color; g.lineWidth = 6; rr(g, 10, 10, W - 20, H - 20, 30); g.stroke();
  g.textBaseline = 'middle';
  g.fillStyle = o.color; g.beginPath(); g.arc(96, 104, 46, 0, Math.PI * 2); g.fill();
  g.fillStyle = HEX(C.bg); g.font = '700 50px ' + SANS; g.textAlign = 'center'; g.fillText(o.key, 96, 108); g.textAlign = 'left';
  g.fillStyle = HEX(C.text); g.font = '600 48px ' + SANS; g.fillText(o.title, 168, 102);
  g.fillStyle = HEX(C.muted); g.font = '400 32px ' + MONO; g.fillText(o.sub, 168, 156);
  g.fillStyle = 'rgba(1,4,9,.75)'; rr(g, 56, 230, W - 112, 190, 20); g.fill();
  g.strokeStyle = HEX(C.border); g.lineWidth = 2; rr(g, 56, 230, W - 112, 190, 20); g.stroke();
  g.fillStyle = HEX(C.faint); g.font = '400 28px ' + MONO; g.fillText(o.resultLabel || 'результат', 88, 282);
  g.fillStyle = o.color; g.font = '600 62px ' + MONO; g.fillText(o.result, 88, 358);
  g.fillStyle = HEX(C.muted); g.font = '600 28px ' + MONO; g.fillText('КОЛИ ОБИРАТИ', 60, 486);
  g.fillStyle = HEX(C.text); g.font = '400 36px ' + SANS; wrap(g, o.when, 60, 546, W - 120, 48);
  g.fillStyle = HEX(C.muted); g.font = '600 28px ' + MONO; g.fillText('ЩО ВТРАЧАЄШ', 60, 790);
  g.fillStyle = o.lossC || HEX(C.muted); g.font = '400 36px ' + SANS; wrap(g, o.loss, 60, 850, W - 120, 48);
  return tex(el);
}
/** Плашка-підпис (назва гілки, зона, статус) */
function labelTexture(text, colorHex, sub, opts) {
  opts = opts || {};
  const W = 900, H = sub ? 220 : 136, el = cv(W, H), g = el.getContext('2d');
  g.fillStyle = opts.fill || 'rgba(13,17,23,.88)'; rr(g, 4, 4, W - 8, H - 8, H / 2); g.fill();
  g.strokeStyle = colorHex; g.lineWidth = 3; rr(g, 4, 4, W - 8, H - 8, H / 2); g.stroke();
  g.fillStyle = colorHex; g.beginPath(); g.arc(68, H / 2, 18, 0, Math.PI * 2); g.fill();
  g.textBaseline = 'middle'; g.fillStyle = opts.textColor || HEX(C.text); g.font = '600 52px ' + SANS;
  g.fillText(text, 112, sub ? H / 2 - 30 : H / 2);
  if (sub) { g.fillStyle = HEX(C.muted); g.font = '400 38px ' + MONO; g.fillText(sub, 112, H / 2 + 34); }
  return tex(el);
}
function glowTex(hexNum) {
  const S = 256, el = cv(S, S), g = el.getContext('2d'), c = new THREE.Color(hexNum);
  const r = Math.round(c.r * 255), gg = Math.round(c.g * 255), b = Math.round(c.b * 255);
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, `rgba(${r},${gg},${b},.95)`); grad.addColorStop(.25, `rgba(${r},${gg},${b},.35)`); grad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = grad; g.fillRect(0, 0, S, S); return new THREE.CanvasTexture(el);
}

/* ============================== рендерер і сцена ============================== */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setClearColor(C.bg, 1); renderer.localClippingEnabled = true;
let scene = null;
const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 200);
const camTarget = new THREE.Vector3();
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', () => { resize(); if (ep) setTime(state.t); });

/* ---------- будівельні блоки для епізодів ---------- */
const mk = {
  tubeMat: (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacity === undefined ? 1 : opacity, depthWrite: false }),
  tube(points, color, radius) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.4);
    const geo = new THREE.TubeGeometry(curve, 160, radius || 0.075, 12, false);
    const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -999);
    const mat = mk.tubeMat(color); mat.clippingPlanes = [plane];
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.plane = plane; scene.add(mesh); return mesh;
  },
  revealTo: (tube, x) => { tube.userData.plane.constant = x; },
  commit(x, y, color, size, z) {
    const g = new THREE.Group(); const r = size || 0.19;
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mk.tubeMat(color));
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 1.7, 1), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: .35, depthWrite: false }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(color), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    glow.scale.set(r * 12, r * 12, 1);
    g.add(core, shell, glow); g.position.set(x, y, z || 0); g.scale.setScalar(0); scene.add(g);
    return { g, core, shell, glow, color, x, y };
  },
  /** поява коміта з «пружинкою» + дихання */
  pop(o, t, t0, setOp) {
    const k = clamp01(easeOutBack(win(t, t0, t0 + 0.55)));
    o.g.scale.setScalar(k * (1 + 0.06 * Math.sin(t * 2.1 + o.x)));
    setOp(o.core.material, k); setOp(o.shell.material, k * 0.38); setOp(o.glow.material, k * 0.5);
    o.shell.rotation.y = t * 0.35 + o.x; o.shell.rotation.x = t * 0.2;
  },
  ring(x, y, color, r) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 8, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(x, y, 0); scene.add(m); return m;
  },
  label(text, sub, colorHex, x, y, w, opts) {
    const map = labelTexture(text, colorHex, sub, opts);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    const h = w * (sub ? 220 : 136) / 900; sp.scale.set(w, h, 1); sp.position.set(x, y, 0.2); scene.add(sp); return sp;
  },
  card(texture, x, y, w, ratio) {
    const h = w * (ratio || 800 / 1280);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(x, y, 0); m.userData.base = new THREE.Vector3(x, y, 0); scene.add(m); return m;
  },
  leader(x, y0, y1, color) {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y0, 0), new THREE.Vector3(x, y1, 0)]);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 })); scene.add(l); return l;
  },
  /** плоска платформа-«зона» з рамкою */
  platform(x, y, w, d, color) {
    const grp = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), new THREE.MeshBasicMaterial({ color: C.surface, transparent: true, opacity: 0, depthWrite: false }));
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, 0.12, d)), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }));
    grp.add(top, edge); grp.position.set(x, y, 0); scene.add(grp);
    return { grp, top, edge, x, y };
  }
};

/* ---------- атмосфера ---------- */
let grid, dust;
function buildAtmosphere() {
  grid = new THREE.GridHelper(60, 60, C.borderMuted, C.borderMuted);
  grid.position.y = -9; grid.material.transparent = true; grid.material.opacity = 0.5; scene.add(grid);
  const N = 700, pos = new Float32Array(N * 3); let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < N; i++) { pos[i * 3] = (rnd() - 0.5) * 46; pos[i * 3 + 1] = (rnd() - 0.5) * 26; pos[i * 3 + 2] = (rnd() - 0.5) * 22 - 3; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: C.faint, size: 0.055, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);
}

/* ============================== HUD ============================== */
const $ = (id) => document.getElementById(id);
const el = { chapter: $('chapter'), chNum: $('chNum'), chTtl: $('chTtl'), caption: $('caption'), term: $('term'), badge: $('badge'), legend: $('legend'),
  titlecard: $('titlecard'), tcKicker: $('tcKicker'), tcTitle: $('tcTitle'), tcSub: $('tcSub'), fade: $('fade'), pbar: $('pbar'), outro: $('outro') };
const vign = document.createElement('div');
vign.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 62% 62%, rgba(248,81,73,0) 32%, rgba(248,81,73,.30) 100%)';
$('hud').insertBefore(vign, el.badge);
const hudApi = {
  badge(txt, cls, op) { el.badge.className = 'badge-big ' + (cls || ''); el.badge.textContent = txt || ''; el.badge.style.opacity = String(clamp01(op || 0)); },
  vignette(op) { vign.style.opacity = String(clamp01(op)); },
  outro(rows) { el.outro.innerHTML = rows.map((x, i) => `<div class="o" data-i="${i}"><span class="n">0${i + 1}</span><span>${x}</span></div>`).join(''); },
  outroShow(op, rowOps) {
    el.outro.style.opacity = String(clamp01(op));
    el.outro.querySelectorAll('.o').forEach((r, i) => { const v = clamp01(rowOps[i] || 0); r.style.opacity = String(v); r.style.transform = `translateX(${lerp(16, 0, easeOut(v))}px)`; });
  },
  legend(op) { el.legend.style.opacity = String(clamp01(op)); }
};
function fadeBeat(t, b, delayIn) {
  const a = win(t, b.t0 + (delayIn || 0.25), b.t0 + (delayIn || 0.25) + 0.55), o = 1 - win(t, b.t1 - 0.45, b.t1 - 0.05); return a * o;
}
let lastBeatId = null, lastTermId = null;
function updateHUD(t) {
  const B = ep.BEATS, DUR = ep.DUR;
  const b = B.find(x => t >= x.t0 && t < x.t1) || B[B.length - 1];
  const isIntro = b.id === 'intro';
  const titleOn = (1 - win(t, 4.9, 6.3)) * easeOut(win(t, 0.35, 1.6));
  el.titlecard.style.opacity = String(titleOn);
  el.titlecard.style.transform = `translateY(${lerp(14, 0, easeOut(win(t, 0.35, 1.8)))}px) scale(${lerp(1.03, 1, easeOut(win(t, 0.35, 2.4)))})`;
  el.fade.style.opacity = String(Math.max(1 - easeOut(win(t, 0, 0.5)), win(t, DUR - 1.2, DUR)));
  if (b.id !== lastBeatId) {
    lastBeatId = b.id;
    if (!isIntro) { el.chNum.textContent = b.num; el.chTtl.innerHTML = b.ttl; el.caption.innerHTML = b.cap; }
    document.querySelectorAll('#chips button').forEach(x => x.classList.toggle('on', x.dataset.id === b.id));
  }
  const k = isIntro ? 0 : fadeBeat(t, b);
  el.chapter.style.opacity = String(k);
  el.chapter.style.transform = `translateX(${lerp(-10, 0, easeOut(win(t, b.t0 + .25, b.t0 + .9)))}px)`;
  el.caption.style.opacity = String(isIntro ? 0 : fadeBeat(t, b, 0.75));
  el.caption.style.transform = `translateY(${lerp(8, 0, easeOut(win(t, b.t0 + .75, b.t0 + 1.5)))}px)`;
  const nLines = (b.term || []).length;
  if (nLines) {
    const shown = Math.min(nLines, Math.floor(win(t, b.t0 + 1.0, b.t0 + Math.min(5.5, (b.t1 - b.t0) * 0.62)) * nLines) + 1);
    const key = b.id + ':' + shown;
    if (key !== lastTermId) { lastTermId = key; el.term.innerHTML = b.term.slice(0, shown).map(l => `<span class="${l.c || ''}">${l.x.replace(/</g, '&lt;')}</span>`).join('\n'); }
    el.term.style.opacity = String(fadeBeat(t, b, 0.9));
  } else { el.term.style.opacity = '0'; el.term.innerHTML = ''; lastTermId = null; }
  el.term.hidden = !nLines;
  el.pbar.style.width = (t / DUR * 100) + '%';
}

/* ============================== камера ============================== */
function updateCamera(t) {
  const CAM = ep.CAM; let i = 0; while (i < CAM.length - 2 && t >= CAM[i + 1].t) i++;
  const k0 = CAM[i], k1 = CAM[i + 1];
  const span = Math.max(0.001, k1.t - k0.t), tr = Math.min(2.2, span * 0.45);
  const p = ease(clamp01((t - (k1.t - tr)) / tr));
  const wob = Math.sin(t * 0.31) * 0.14, wob2 = Math.cos(t * 0.24) * 0.1;
  camera.position.set(lerp(k0.p[0], k1.p[0], p) + wob, lerp(k0.p[1], k1.p[1], p) + wob2, lerp(k0.p[2], k1.p[2], p));
  camTarget.set(lerp(k0.l[0], k1.l[0], p), lerp(k0.l[1], k1.l[1], p), lerp(k0.l[2], k1.l[2], p));
  camera.lookAt(camTarget);
}

/* ============================== стан і кадр ============================== */
const state = { t: 0, playing: true };
let ep = null, epDef = null;
function setTime(t) {
  if (!ep) return;
  t = clamp(t, 0, ep.DUR); state.t = t;
  ep.update(t);
  dust.rotation.y = t * 0.006; dust.rotation.z = Math.sin(t * 0.05) * 0.02;
  const dim = ep.dim === undefined ? 1 : ep.dim;
  dust.material.opacity = 0.5 * dim; grid.material.opacity = 0.45 * dim * (0.4 + 0.6 * win(t, 5, 8));
  updateCamera(t); updateHUD(t); renderer.render(scene, camera);
}

/* ============================== епізоди ============================== */
const params = new URLSearchParams(location.search);
const CAPTURE = params.get('capture') === '1';
if (CAPTURE) document.body.classList.add('capture');
const EPS = window.EPISODES.slice().sort((a, b) => a.order - b.order);

function disposeScene() {
  if (!scene) return;
  scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
    mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
  });
  scene = null;
}
function loadEpisode(id, autoplay) {
  const def = EPS.find(e => e.id === id) || EPS[0];
  epDef = def;
  disposeScene();
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(C.bg, 15, 40);
  buildAtmosphere();
  lastBeatId = null; lastTermId = null;
  el.tcKicker.textContent = def.kicker || ''; el.tcTitle.textContent = def.title; el.tcSub.textContent = def.subtitle || '';
  el.legend.innerHTML = (def.legend || []).map(r => `<span class="row"><i style="background:${r.color}"></i>${r.text}</span>`).join('');
  hudApi.badge('', '', 0); hudApi.vignette(0); el.outro.innerHTML = ''; el.outro.style.opacity = '0';
  const ctx = { THREE, scene, camera, C, HEX, u, tex: { codeCard, optionCard, labelTexture, glowTex }, mk, hud: hudApi };
  ep = def.build(ctx);
  // розділи
  const chips = $('chips'); chips.innerHTML = '';
  ep.BEATS.filter(b => b.id !== 'intro').forEach(b => {
    const btn = document.createElement('button'); btn.dataset.id = b.id;
    btn.textContent = b.num + (b.chipSuffix || '') + ' · ' + (b.chip || b.ttl);
    btn.onclick = () => { setTime(b.t0 + 0.05); syncAudio(true); chips.hidden = true; btnChapters.classList.remove('on'); };
    chips.appendChild(btn);
  });
  document.querySelectorAll('#eplist button').forEach(x => x.classList.toggle('on', x.dataset.id === def.id));
  // музика епізоду
  bgm.src = def.music || ''; bgm.load();
  try { history.replaceState(null, '', '?ep=' + def.id + (CAPTURE ? '&capture=1' : '')); } catch (e) {}
  setTime(0);
  setPlaying(autoplay !== false && !CAPTURE);
  window.__deck = { setTime, DUR: ep.DUR, beats: ep.BEATS, ready: true, episode: def.id, scene, camera, load: (id) => loadEpisode(id, false) };
}

/* ============================== керування ============================== */
const btnPlay = $('btnPlay'), scrub = $('scrub'), tlabel = $('tlabel'), btnChapters = $('btnChapters'), btnEp = $('btnEp'), eplist = $('eplist'), chips = $('chips');
const btnNext = $('btnNext'), backlog = $('backlog');
const stage = $('stage'), flash = $('flash'), toast = $('toast'), btnFull = $('btnFull'), controls = document.querySelector('.controls');
const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

// панель ховається через 2.6 с без руху миші, поки епізод грає (як у YouTube); пауза, меню або наведення повертають її
let idleTimer = 0, controlsHover = false;
function wake() {
  document.body.classList.remove('idle'); clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (state.playing && eplist.hidden && chips.hidden && backlog.hidden && !controlsHover) document.body.classList.add('idle'); }, 2600);
}
['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, wake, { passive: true }));
controls.addEventListener('pointerenter', () => { controlsHover = true; wake(); });
controls.addEventListener('pointerleave', () => { controlsHover = false; wake(); });

function setPlaying(v) { state.playing = v; btnPlay.textContent = v ? '❚❚' : '▶'; btnPlay.classList.toggle('on', !v); syncAudio(true); wake(); }
function flashIcon(txt, small) { flash.textContent = txt; flash.classList.toggle('sm', !!small); flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); }
function togglePlay(show) { setPlaying(!state.playing); if (show) flashIcon(state.playing ? '▶' : '❚❚'); }
function seek(d, show) { setTime(state.t + d); syncAudio(true); if (show) flashIcon((d > 0 ? '+' : '−') + Math.abs(d) + ' с', true); }
function closePops() { eplist.hidden = true; chips.hidden = true; backlog.hidden = true; btnEp.classList.remove('on'); btnChapters.classList.remove('on'); btnNext.classList.remove('on'); }
let toastTimer = 0;
function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800); }

// повний екран: кнопка, F, подвійний клік по відео
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;
function toggleFullscreen() {
  const root = document.documentElement;
  if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
  const req = root.requestFullscreen || root.webkitRequestFullscreen;
  const fail = () => showToast('Повний екран тут недоступний — відкрий плеєр окремою вкладкою браузера');
  if (!req) { fail(); return; }
  try { const p = req.call(root); if (p && p.catch) p.catch(fail); } catch (e) { fail(); }
}
function onFsChange() {
  const on = !!fsEl(); btnFull.classList.toggle('on', on); btnFull.title = on ? 'Вийти з повного екрана · F або Esc' : 'На весь екран · F або двічі клікнути по відео'; document.body.classList.toggle('fs', on); wake();
  // деякі браузери не встигають (або не встигають вчасно) кинути 'resize' саме на зміну fullscreen —
  // без цього камера й рендерер лишаються зі старими розмірами і сцену «розриває»
  resize(); if (ep) setTime(state.t);
  setTimeout(() => { resize(); if (ep) setTime(state.t); }, 120);
}
document.addEventListener('fullscreenchange', onFsChange); document.addEventListener('webkitfullscreenchange', onFsChange);
btnFull.onclick = toggleFullscreen;
$('btnHome').onclick = () => { location.href = '../'; };

// клік по відео — пауза/плей; подвійний — повний екран (два кліки повертають стан гри, як у YouTube)
if (!CAPTURE) {
  stage.addEventListener('click', () => { if (!eplist.hidden || !chips.hidden || !backlog.hidden) { closePops(); return; } togglePlay(true); });
  stage.addEventListener('dblclick', (e) => { e.preventDefault(); flash.classList.remove('go'); toggleFullscreen(); });
}

btnPlay.onclick = () => togglePlay(false);
$('btnBack').onclick = () => seek(-5);
$('btnFwd').onclick = () => seek(5);
$('btnRestart').onclick = () => { setTime(0); setPlaying(true); };
scrub.oninput = () => { setPlaying(false); setTime(Number(scrub.value) / 1000 * ep.DUR); syncAudio(true); };
btnChapters.onclick = () => { const open = chips.hidden; closePops(); chips.hidden = !open; btnChapters.classList.toggle('on', !chips.hidden); };
btnEp.onclick = () => { const open = eplist.hidden; closePops(); eplist.hidden = !open; btnEp.classList.toggle('on', !eplist.hidden); };
btnNext.onclick = () => { const open = backlog.hidden; closePops(); backlog.hidden = !open; btnNext.classList.toggle('on', !backlog.hidden); };

// «Наступні»: список тем з backlog.js; клік копіює готовий запит для Claude Code
(function buildBacklog() {
  const list = $('backlogList'), groups = window.BACKLOG || [];
  let total = 0;
  groups.forEach((g) => {
    const h = document.createElement('div'); h.className = 'grp'; h.textContent = g.title; list.appendChild(h);
    g.items.forEach((it) => {
      total++;
      const b = document.createElement('button'); b.type = 'button';
      const t = document.createElement('span'); t.textContent = it.n + ' · ' + it.t;
      const d = document.createElement('small'); d.textContent = it.d;
      b.append(t, d);
      b.onclick = async () => {
        const ask = 'Зроби епізод ' + it.n + ' «' + it.t + '» для 3D-плеєра, як описано в ANIMATIONS.md';
        let copied = false;
        try { await navigator.clipboard.writeText(ask); copied = true; } catch (e) {}
        showToast((copied ? 'Скопійовано для Claude: ' : 'Запит для Claude: ') + ask);
      };
      list.appendChild(b);
    });
  });
  $('backlogCount').textContent = String(total);
})();
EPS.forEach(def => {
  const b = document.createElement('button'); b.dataset.id = def.id;
  b.innerHTML = `<span>${def.num} · ${def.title}</span><small>${def.subtitle || ''}</small>`;
  b.onclick = () => { eplist.hidden = true; btnEp.classList.remove('on'); loadEpisode(def.id, true); };
  eplist.appendChild(b);
});
// клавіші як у YouTube; e.code — щоб працювало і в українській розкладці
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || !ep) return;
  const tag = e.target && e.target.tagName, k = e.code;
  if (tag === 'BUTTON' && (k === 'Space' || k === 'Enter')) return;   // кнопка у фокусі обробляє сама
  if (k === 'Space' || k === 'KeyK') { e.preventDefault(); togglePlay(true); }
  else if (k === 'ArrowRight') { e.preventDefault(); seek(5, true); }
  else if (k === 'ArrowLeft') { e.preventDefault(); seek(-5, true); }
  else if (k === 'KeyL') seek(10, true);
  else if (k === 'KeyJ') seek(-10, true);
  else if (k === 'KeyF') { e.preventDefault(); toggleFullscreen(); }
  else if (k === 'KeyM') btnMusic.click();
  else if (k === 'Home' || k === 'Digit0' || k === 'Numpad0') { setTime(0); syncAudio(true); }
  else if (/^Digit[1-9]$/.test(k)) { setTime(ep.DUR * Number(k.slice(5)) / 10); syncAudio(true); }
  else if (k === 'Escape') closePops();
});

/* ============================== музика ============================== */
const bgm = $('bgm'), btnMusic = $('btnMusic');
let musicOn = true, audioBlocked = false, playPending = false;
try { musicOn = localStorage.getItem('git3d-music') !== 'off'; } catch (e) {}
bgm.volume = 0.85;
function updateMusicBtn() {
  btnMusic.classList.toggle('muted', !musicOn); btnMusic.classList.toggle('unlock', musicOn && audioBlocked);
  btnMusic.textContent = musicOn && audioBlocked ? '♪ Увімкнути звук' : '♪ Музика';   // вимкнена — перекреслена класом .muted, без слова
}
// чи можна перемотати трек на цей час: сервер без Range-запитів віддає порожній seekable, і тоді
// присвоєння currentTime скидає трек на 0 — краще лишити музику грати, ніж перезапускати її щокадру
function audioSeekable(t) {
  const r = bgm.seekable;
  for (let i = 0; i < r.length; i++) if (t >= r.start(i) - 0.05 && t <= r.end(i) + 0.05) return true;
  return false;
}
// один запуск за раз: pause() під час незавершеного play() кидає AbortError — це не блокування автоплею
function startAudio() {
  if (playPending || !bgm.paused) return;
  playPending = true;
  const p = bgm.play();
  if (!p || !p.then) { playPending = false; return; }
  p.then(() => { playPending = false; audioBlocked = false; updateMusicBtn(); })
   .catch((e) => { playPending = false; if (e && e.name === 'NotAllowedError') { audioBlocked = true; updateMusicBtn(); } });
}
// force — явна дія користувача (плей, пауза, перемотка): підганяємо трек під час анімації.
// Щокадру (без force) трек не перемотуємо: поки він грає, анімація сама іде за ним (див. loop).
function syncAudio(force) {
  if (CAPTURE || !ep) return;
  if (!musicOn || !state.playing) { if (!bgm.paused) bgm.pause(); updateMusicBtn(); return; }
  if (force && Math.abs(bgm.currentTime - state.t) > 0.35 && audioSeekable(state.t)) {
    try { bgm.currentTime = Math.min(state.t, Math.max(0, (bgm.duration || 999) - 0.05)); } catch (e) {}
  }
  if (bgm.paused) startAudio();
}
// поки трек грає і збігається з анімацією — він годинник: мʼяко підтягуємо час анімації до звуку
function audioClock(nt) {
  if (!musicOn || audioBlocked || bgm.paused || bgm.seeking || bgm.readyState < 3) return nt;
  const d = bgm.currentTime - nt;
  return Math.abs(d) < 1 ? nt + d * 0.15 : nt;
}
btnMusic.onclick = () => {
  if (musicOn && audioBlocked) { audioBlocked = false; syncAudio(true); updateMusicBtn(); return; }  // «Увімкнути звук» — саме вмикає
  musicOn = !musicOn; audioBlocked = false;
  try { localStorage.setItem('git3d-music', musicOn ? 'on' : 'off'); } catch (e) {}
  syncAudio(true); updateMusicBtn();
};
document.addEventListener('pointerdown', (e) => { if (musicOn && audioBlocked && !btnMusic.contains(e.target)) syncAudio(true); }, { passive: true });
updateMusicBtn();

/* ============================== цикл ============================== */
resize();
let prev = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
  if (ep && state.playing) { let nt = audioClock(state.t + dt); if (nt >= ep.DUR) { nt = ep.DUR; setPlaying(false); } setTime(nt); }
  if (ep) { if (state.playing) syncAudio(false); scrub.value = String(Math.round(state.t / ep.DUR * 1000)); tlabel.textContent = fmt(state.t) + ' / ' + fmt(ep.DUR); }
  requestAnimationFrame(loop);
}
loadEpisode(params.get('ep') || EPS[0].id, !CAPTURE);
if (!CAPTURE) requestAnimationFrame(loop);
})();
