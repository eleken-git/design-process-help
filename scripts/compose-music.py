#!/usr/bin/env python3
"""
Композитор фортепіанних треків для 3D-епізодів → docs/3d/episodes/<id>.mp3

У кожного епізоду своя тональність, темп, розмір, фактура і «кімната» реверберації,
щоб треки не звучали як один патерн:

  00 conflict        ре мінор,  60 bpm, 4/4 — бас і один тон акорду на такт, повільна мелодія;
                     напруга в середині (домінантовий педаль, зменшений акорд), мажорна каденція
  01 file-states     до мажор,  80 bpm, 3/4 — «музична скринька»: три тихі ноти на такт у верхньому
                     регістрі, мʼякий бас, рідка контрмелодія
  02 pull-request    фа мажор,  ♩.≈56, 6/8 — хвиля з трьох нот на такт у лівій руці, довгі фрази
  03 protected-main  ля мажор,  54 bpm, 4/4 — хорал: акорд на весь такт, октавний бас, рідка мелодія

Фонова музика: пед — основа, фортепіано далеко й тихо (мʼяка атака, зріз верху 2.5 кГц, реверберація 60–70 %),
близько однієї ноти на секунду, RMS −23 dBFS.

Запуск: python3 scripts/compose-music.py [conflict file-states pull-request protected-main]
Потрібні: numpy, lame (brew install lame). Тривалість треків дорівнює тривалості епізодів.
"""
import functools
import math
import os
import struct
import subprocess
import sys
import wave

import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'docs', '3d', 'episodes'))

MAJOR = [0, 2, 4, 5, 7, 9, 11]
MINOR = [0, 2, 3, 5, 7, 8, 10]


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ------------------------------------------------------------------ фортепіано
@functools.lru_cache(maxsize=None)
def piano_note(midi, vel_q, dur_q):
    """Одна нота: гармоніки з негармонійністю, двоступеневе затухання, удар молоточка, демпфер."""
    vel = vel_q / 20.0
    dur = dur_q / 10.0
    f0 = midi_hz(midi)
    t60 = float(np.interp(midi, [30, 48, 60, 72, 84, 96], [7.0, 5.5, 3.8, 2.6, 1.6, 1.0]))
    length = dur + min(t60, 3.5)
    n = int(length * SR)
    t = np.arange(n) / SR
    p = 2.8 - 1.0 * vel                      # тихіше — темніше; фонове фортепіано без дзвінкого верху
    B = 0.00015 + 0.0006 * max(0.0, (midi - 40) / 60)
    k = 6.9 / t60
    y = np.zeros(n)
    nh = int(min(8, (SR * 0.45) // f0))
    for h in range(1, nh + 1):
        fh = h * f0 * math.sqrt(1 + B * h * h)
        if fh > SR * 0.45:
            break
        a = (1 / h ** p) * (0.55 + 0.45 * abs(math.sin(h * math.pi * 0.14)))
        env = np.exp(-t * k * (1 + 0.2 * (h - 1))) * (0.7 + 0.3 * np.exp(-t * 9))
        ph = (h * 1.7) % 6.283
        y += a * env * (np.sin(2 * math.pi * fh * t + ph) + 0.5 * np.sin(2 * math.pi * fh * 1.0009 * t))
    y *= 1 - np.exp(-t / 0.014)   # повільна атака: нота «випливає», а не бʼє
    hn = int(0.006 * SR)
    hammer = np.random.RandomState(midi).randn(hn) * np.exp(-np.arange(hn) / (0.0015 * SR))
    hammer = np.convolve(hammer, np.ones(8) / 8, mode='same')
    y[:hn] += hammer * 0.04 * vel
    i0 = int(dur * SR)
    if i0 < n:
        y[i0:] *= np.exp(-(t[i0:] - dur) * 9)
    peak = max(1e-9, float(np.max(np.abs(y[: min(n, 4000)]))))
    return (y / peak * (0.3 + 0.7 * vel ** 1.4)).astype(np.float32)


def render_piano(events, duration):
    n = int(duration * SR) + SR
    L = np.zeros(n)
    R = np.zeros(n)
    for t0, midi, dur, vel in events:
        y = piano_note(int(midi), int(round(min(1.0, max(0.05, vel)) * 20)), int(round(min(dur, 8.0) * 10)))
        i = int(t0 * SR)
        j = min(n, i + len(y))
        if j <= i:
            continue
        pan = 0.5 + max(-0.32, min(0.32, (midi - 62) / 64))
        L[i:j] += y[: j - i] * math.sqrt(1 - pan)
        R[i:j] += y[: j - i] * math.sqrt(pan)
    return L, R


# ------------------------------------------------------------------ ембіент-пед
def render_pad(pads, duration, level):
    """Мʼякі витримані акорди (синуси октавою нижче) — космічний фон під фортепіано."""
    n = int(duration * SR) + SR
    L = np.zeros(n)
    R = np.zeros(n)
    tt = np.arange(n) / SR
    for t0, t1, notes in pads:
        i = int(t0 * SR)
        j = min(n, int((t1 + 2.5) * SR))
        t = tt[i:j] - t0
        seg = t1 - t0
        env = (1 - np.exp(-t / 1.6)) * np.where(t < seg, 1.0, np.exp(-(t - seg) / 1.3))
        yl = np.zeros(j - i)
        yr = np.zeros(j - i)
        for m in notes:
            f = midi_hz(m - 12)
            yl += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t + 0.7)
            yr += np.sin(2 * np.pi * f * 1.0025 * t + 1.3) + 0.3 * np.sin(2 * np.pi * 2 * f * 0.999 * t)
        L[i:j] += yl * env / len(notes)
        R[i:j] += yr * env / len(notes)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * tt + 1)
    return L * lfo * level, R * lfo * level


# ------------------------------------------------------------------ реверберація
def reverb(L, R, rt60, wet, predelay=0.018):
    n_ir = int(rt60 * SR)
    t = np.arange(n_ir) / SR

    def ir(seed):
        noise = np.random.RandomState(seed).randn(n_ir) * np.exp(-6.9 * t / rt60)
        noise = np.convolve(noise, np.ones(7) / 7, mode='same')  # темніший хвіст
        early = np.zeros(n_ir)
        for d, g in [(0.011, 0.55), (0.017, 0.45), (0.023, 0.4), (0.031, 0.32), (0.043, 0.25)]:
            early[int(d * SR)] += g
        return np.concatenate([np.zeros(int(predelay * SR)), noise * 0.09 + early])

    def conv(x, h):
        N = 1 << int(np.ceil(np.log2(len(x) + len(h))))
        return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(h, N), N)[: len(x)]

    hl, hr = ir(11), ir(23)
    wl = conv(0.8 * L + 0.2 * R, hl)
    wr = conv(0.8 * R + 0.2 * L, hr)
    return L + wet * wl, R + wet * wr


# ------------------------------------------------------------------ композиція
class Piece:
    def __init__(self, root, scale, bpm, beats, duration, seed):
        self.root, self.scale, self.bpm, self.beats, self.duration = root, scale, bpm, beats, duration
        self.spb = 60.0 / bpm
        self.rng = np.random.RandomState(seed)
        self.events = []
        self.pads = []
        self.cur = None  # поточна нота мелодії

    def bar_t(self, bar):
        return bar * self.beats * self.spb

    def note(self, t, midi, dur, vel):
        self.events.append((t, int(midi), max(0.05, dur), vel + self.rng.uniform(-0.03, 0.03)))

    def tones(self, chord, lo, hi):
        pcs = {(self.root + c) % 12 for c in chord}
        return [m for m in range(lo, hi + 1) if m % 12 in pcs]

    def scale_notes(self, lo, hi, chord=None):
        pcs = {(self.root + s) % 12 for s in self.scale}
        if chord:
            pcs |= {(self.root + c) % 12 for c in chord}
        return [m for m in range(lo, hi + 1) if m % 12 in pcs]

    def pad(self, bar, bars, chord, octave=4):
        base = self.root + 12 * (octave - 4)
        notes = [base + c for c in chord[:3]]
        self.pads.append((self.bar_t(bar), self.bar_t(bar + bars), notes))

    # мелодія: кроки по гаммі, на сильних долях — тон акорду, фрази по 4 такти, повтор ритму мотиву
    def melody_bar(self, bar, chord, lo, hi, cell, vel, strong_pos):
        rng = self.rng
        pos = 0.0
        center = (lo + hi) / 2
        for d in cell:
            if d < 0:
                pos += -d
                continue
            strong = any(abs(pos - s) < 1e-6 for s in strong_pos)
            if self.cur is None:
                self.cur = min(self.tones(chord, lo, hi), key=lambda m: abs(m - center))
            if strong:
                cands = self.tones(chord, lo, hi)
                bias = -1 if self.cur > center + 4 else (1 if self.cur < center - 4 else 0)
                target = self.cur + rng.choice([-4, -2, 0, 2, 3, 4]) + bias * 2
                nxt = min(cands, key=lambda m: abs(m - target) + (0.6 if m == self.cur else 0))
            else:
                sc = self.scale_notes(lo, hi, chord)
                i = min(range(len(sc)), key=lambda k: abs(sc[k] - self.cur))
                step = rng.choice([-2, -1, -1, 1, 1, 2, 0], p=[0.12, 0.28, 0.1, 0.28, 0.1, 0.1, 0.02])
                if self.cur > center + 5:
                    step = -abs(step) or -1
                if self.cur < center - 5:
                    step = abs(step) or 1
                nxt = sc[max(0, min(len(sc) - 1, i + step))]
            self.cur = nxt
            self.note(self.bar_t(bar) + pos * self.spb, nxt, d * self.spb * 0.98, vel + (0.02 if strong else 0))
            pos += d


def compose(cfg):
    pc = Piece(cfg['root'], cfg['scale'], cfg['bpm'], cfg['beats'], cfg['duration'], cfg['seed'])
    bars = []
    for section in cfg['form']:
        for chord in section['chords']:
            bars.append((chord, section))
    total_bars = len(bars)
    end_t = pc.bar_t(total_bars)
    assert end_t + 3.5 <= cfg['duration'] + 0.6, f"{cfg['id']}: форма {end_t:.1f}s довша за трек {cfg['duration']}s"

    motif = {}
    for bar, (chord, sec) in enumerate(bars):
        vel = sec['vel']
        pc.pad(bar, 1, chord, octave=cfg.get('pad_octave', 4))
        cfg['texture'](pc, bar, chord, vel, sec)
        every = cfg.get('melody_every', 1)  # мелодія не в кожному такті — більше повітря
        if sec.get('melody') and bar % every == 0:
            ph = (bar // every) % 4
            if ph == 0:
                motif = {}
            if ph == 3:
                cell = [pc.beats]
            else:
                if ph not in motif:
                    motif[ph] = cfg['cells'][pc.rng.randint(len(cfg['cells']))]
                cell = motif[ph]
            lo, hi = cfg['melody_range']
            pc.melody_bar(bar, chord, lo, hi, cell, vel + 0.02, cfg['strong'])

    # фінальний акорд і хвіст
    final = cfg['final']
    t = end_t
    for m in final['lh']:
        pc.note(t, cfg['root'] + m, 6.0, 0.4)
    for k, m in enumerate(final['rh']):
        pc.note(t + 0.03 * k, cfg['root'] + m, 6.0, 0.38)
    pc.pads.append((t, cfg['duration'] - 2.5, [cfg['root'] + m for m in final['rh']]))
    return pc


# фактури -------------------------------------------------------------------
def tex_broken(pc, bar, chord, vel, sec):
    """4/4: бас на весь такт і один тон акорду на третій долі — дві ноти на такт."""
    t0 = pc.bar_t(bar)
    pc.note(t0, pc.root - 24 + chord[0], pc.spb * 4, vel)
    tones = pc.tones(chord, pc.root - 12, pc.root + 4)
    pc.note(t0 + 2 * pc.spb, tones[1 % len(tones)], pc.spb * 2, vel - 0.1)


def tex_musicbox(pc, bar, chord, vel, sec):
    """3/4: три тихі короткі ноти у верхньому регістрі й мʼякий бас на першій долі."""
    t0 = pc.bar_t(bar)
    pc.note(t0, pc.root - 24 + chord[0], pc.spb * 2.5, vel - 0.08)
    tones = pc.tones(chord, pc.root, pc.root + 19)   # середній регістр, без дзвінких верхів
    pattern = [0, 1, 2] if bar % 2 == 0 else [2, 1, 3]
    for k, idx in enumerate(pattern):
        pc.note(t0 + k * pc.spb, tones[idx % len(tones)], pc.spb * 1.1, vel - 0.12 + (0.03 if k == 0 else 0))


def tex_rolling(pc, bar, chord, vel, sec):
    """6/8: три ноти на такт — основа, квінта, децима — кожна на дві вісімки."""
    t0 = pc.bar_t(bar)
    r = pc.root - 24 + chord[0]
    third = chord[1] - chord[0]
    for k, m in enumerate([r, r + 7, r + 12 + third]):
        pc.note(t0 + 2 * k * pc.spb, m, pc.spb * 3.0, vel - 0.1 + (0.05 if k == 0 else 0))


def tex_chorale(pc, bar, chord, vel, sec):
    """4/4: октавний бас і тісний тризвук на весь такт, без повторів."""
    t0 = pc.bar_t(bar)
    r = pc.root - 24 + chord[0]
    pc.note(t0, r, pc.spb * 4, vel)
    pc.note(t0 + 0.02, r + 12, pc.spb * 4, vel - 0.1)
    tones = pc.tones(chord, pc.root - 3, pc.root + 9)[:3]
    for k, m in enumerate(tones):
        pc.note(t0 + 0.04 + 0.03 * k, m, pc.spb * 3.9, vel - 0.14)


# акорди як зсуви від тоніки -------------------------------------------------
I, ii, iii, IV, V, vi = [0, 4, 7], [2, 5, 9], [4, 7, 11], [5, 9, 12], [7, 11, 14], [9, 12, 16]
Iadd9, IVadd9 = [0, 4, 7, 14], [5, 9, 12, 19]
i_m, iv_m, VI_m, III_m, VII_m, V_m, iio, V7_m, I_pic = (
    [0, 3, 7], [5, 8, 12], [8, 12, 15], [3, 7, 10], [10, 14, 17], [7, 11, 14], [2, 5, 8], [7, 11, 14, 17], [0, 4, 7])


def sec(chords, vel, **kw):
    d = {'chords': chords, 'vel': vel}
    d.update(kw)
    return d


EPISODES = {
    'conflict': dict(
        id='conflict', root=62, scale=MINOR, bpm=60, beats=4, duration=107.5, seed=7,
        texture=tex_broken, cells=[[4], [2, 2], [3, 1], [2, -2], [-1, 3]], strong=[0, 2],
        melody_range=(62, 76), pad_octave=4, room=(3.6, 0.7), pad_level=0.22, melody_every=2,
        form=[
            sec([i_m, i_m], 0.26),
            sec([i_m, VI_m, III_m, VII_m, i_m, iv_m, V_m, i_m], 0.34, melody=True),
            sec([iv_m, iio, V7_m, V7_m, VI_m, iio, V7_m, V7_m], 0.42, melody=True, tension=True),
            sec([i_m, VI_m, iv_m, V_m, i_m, VI_m, V_m, I_pic], 0.32, melody=True),
        ],
        final=dict(lh=[-24, -12], rh=[0, 4, 7, 12]),
    ),
    'file-states': dict(
        id='file-states', root=60, scale=MAJOR, bpm=80, beats=3, duration=93.5, seed=11,
        texture=tex_musicbox, cells=[[3], [2, 1], [1, 2], [2, -1]], strong=[0], melody_every=2,
        melody_range=(55, 67), pad_octave=4, room=(2.8, 0.6), pad_level=0.2,
        form=[
            sec([I, I], 0.28),
            sec([I, V, vi, IV, I, V, ii, V], 0.36),
            sec([I, V, vi, IV, I, V, ii, V], 0.38, melody=True),
            sec([vi, iii, IV, I, ii, V, I, I], 0.40, melody=True),
            sec([I, V, vi, IV, I, V, ii, V], 0.36, melody=True),
            sec([IVadd9, I, V, I, I, I], 0.30),
        ],
        final=dict(lh=[-24, -12], rh=[4, 7, 12, 16]),
    ),
    'pull-request': dict(
        id='pull-request', root=65, scale=MAJOR, bpm=168, beats=6, duration=102.5, seed=23,  # пульс вісімок; чвертка з крапкою = 56
        texture=tex_rolling, cells=[[6], [3, 3], [4, 2], [3, -3], [2, 4]], strong=[0, 3], melody_every=2,
        melody_range=(62, 74), pad_octave=4, room=(3.2, 0.65), pad_level=0.2,
        form=[
            sec([I, I], 0.28),
            sec([I, IV, I, V, vi, IV, ii, V], 0.36),
            sec([I, IV, I, V, vi, IV, ii, V], 0.38, melody=True),
            sec([IV, V, iii, vi, ii, V, I, I], 0.42, melody=True),
            sec([I, IV, I, V, vi, IV, ii, V], 0.38, melody=True),
            sec([IV, I, IV, I, ii, V, Iadd9, Iadd9], 0.32, melody=True),
            sec([I, I, I, I], 0.28),
        ],
        final=dict(lh=[-24, -12], rh=[0, 4, 7, 12]),
    ),
    'protected-main': dict(
        id='protected-main', root=57, scale=MAJOR, bpm=54, beats=4, duration=105.5, seed=31,
        texture=tex_chorale, cells=[[4], [2, 2], [3, 1], [-2, 2]], strong=[0, 2],
        melody_range=(62, 74), pad_octave=4, room=(4.0, 0.7), pad_level=0.24, melody_every=2,
        form=[
            sec([I, I], 0.26),
            sec([I, V, vi, IV, I, IV, V, I], 0.34),
            sec([vi, IV, I, V, ii, V, I, I], 0.40, melody=True),
            sec([IV, I, V, I], 0.34, melody=True),
        ],
        final=dict(lh=[-24, -12], rh=[0, 4, 7, 12]),
    ),
}


def write_mp3(L, R, path, target_rms_db=-23.0, ceiling=0.6):
    """Однакова гучність для всіх епізодів (RMS −23 dBFS, рівень фону під голос) і мʼякий лімітер."""
    x = np.stack([L, R], axis=1)
    rms = math.sqrt(float(np.mean(x ** 2))) + 1e-9
    x *= 10 ** (target_rms_db / 20) / rms
    x = ceiling * np.tanh(x / ceiling)
    wav = path[:-4] + '.wav'
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    subprocess.run(['lame', '--quiet', '-b', '128', '-q', '2', wav, path], check=True)
    os.remove(wav)


def lowpass(x, fc=2500.0):
    """Мʼякий зріз верху (2-й порядок) через FFT — фортепіано відходить на задній план."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))


def build(ep_id):
    cfg = EPISODES[ep_id]
    pc = compose(cfg)
    dur = cfg['duration']
    L, R = render_piano(pc.events, dur)
    L, R = lowpass(L), lowpass(R)
    L, R = reverb(L, R, *cfg['room'])                     # далеке фортепіано
    pl, pr = render_pad(pc.pads, dur, level=cfg.get('pad_level', 0.055))
    L, R = L + pl, R + pr                                  # пед сухий і попереду
    n = int(dur * SR)
    L, R = L[:n], R[:n]
    fade_in = np.minimum(1, np.arange(n) / (0.6 * SR))
    fade_out = np.minimum(1, (n - np.arange(n)) / (2.5 * SR))
    L, R = L * fade_in * fade_out, R * fade_in * fade_out
    path = os.path.join(OUT, f'{ep_id}.mp3')
    write_mp3(L, R, path)
    print(f'{ep_id:16s} {len(pc.events):4d} нот  {dur:.1f}s  → {path}')


if __name__ == '__main__':
    ids = sys.argv[1:] or list(EPISODES)
    for ep in ids:
        build(ep)
