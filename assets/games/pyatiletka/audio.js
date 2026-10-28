// Фоновая музыка и звуки кнопок: 8-битные обработки народных мелодий, звук синтезируется в браузере.
// Мелодии: «Коробейники» и «茉莉花» (Жасмин) — народные; «两只老虎» (Два тигра) — напев Frère Jacques;
// мелодия меню — своя, в китайском духе. Чужих записей и аранжировок здесь нет.
(function (root) {
  'use strict';
  const SEMI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  const hz = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (12 * (+m[2] + 1) + SEMI[m[1]] - 69) / 12); };
  const parse = s => s.trim().split(/\s+/).map(tok => { const [n, b] = tok.split(':'); return [n, +b]; });
  // Бас октавами восьмыми (корень снизу — корень сверху) и «ум-па» четвертями; такт = 4 доли.
  const octaves = (roots, o) => roots.map(r => `${r}${o}:.5 ${r}${o + 1}:.5 `.repeat(4)).join(' ');
  const oomPah = bars => bars.map(([a, b]) => `${a}:1 ${b}:1 ${a}:1 ${b}:1`).join(' ');
  const arp = { C: 'C3:1 G3:1 E3:1 G3:1', Am: 'A2:1 E3:1 C3:1 E3:1', Cend: 'C3:1 G3:1 C3:2' };

  // Каждый голос — 32 доли, поэтому голоса идут в лад и зацикливаются вместе.
  const SONGS = {
    // Своя мелодия в китайском духе: пятиступенный лад и «деревянная коробочка».
    menu: { bpm: 132, voices: [
      { type: 'square', vol: .2, notes: 'E5:.5 G5:.5 A5:.5 G5:.5 E5:.5 D5:.5 C5:1  D5:.5 E5:.5 G5:.5 E5:.5 D5:1 r:1  E5:.5 G5:.5 A5:.5 C6:.5 A5:.5 G5:.5 E5:1  G5:.5 A5:.5 G5:.5 E5:.5 D5:2  C6:.5 A5:.5 G5:.5 A5:.5 C6:1 A5:1  G5:.5 E5:.5 D5:.5 E5:.5 G5:2  A5:.5 G5:.5 E5:.5 D5:.5 C5:.5 D5:.5 E5:1  D5:.5 E5:.5 D5:.5 A4:.5 C5:2' },
      { type: 'triangle', vol: .45, notes: oomPah([['C3', 'G2'], ['G2', 'D3'], ['C3', 'G2'], ['G2', 'D3'], ['A2', 'E3'], ['C3', 'G2'], ['A2', 'E3'], ['G2', 'C3']]) },
      { type: 'noise', vol: .08, notes: 'x:1 x:.5 x:.5 r:1 x:1 '.repeat(8) }
    ] },
    korob: { bpm: 132, voices: [
      { type: 'square', vol: .2, notes: 'E5:1 B4:.5 C5:.5 D5:1 C5:.5 B4:.5  A4:1 A4:.5 C5:.5 E5:1 D5:.5 C5:.5  B4:1.5 C5:.5 D5:1 E5:1  C5:1 A4:1 A4:1 r:1  r:.5 D5:1 F5:.5 A5:1 G5:.5 F5:.5  E5:1.5 C5:.5 E5:1 D5:.5 C5:.5  B4:1 B4:.5 C5:.5 D5:1 E5:1  C5:1 A4:1 A4:1 r:1' },
      { type: 'triangle', vol: .45, notes: octaves(['E', 'A', 'E', 'A', 'D', 'C', 'E', 'A'], 2) },
      { type: 'noise', vol: .05, notes: 'r:.5 x:.5 '.repeat(32) }
    ] },
    jasmine: { bpm: 84, voices: [
      { type: 'triangle', vol: .38, notes: 'E5:.5 E5:.5 G5:.5 A5:.5 C6:.5 C6:.5 A5:.5 G5:.5  G5:.5 A5:.5 G5:2 r:1  E5:.5 E5:.5 G5:.5 A5:.5 C6:.5 C6:.5 A5:.5 G5:.5  G5:.5 A5:.5 G5:2 r:1  G5:.5 G5:.5 G5:.5 E5:.5 G5:1 A5:.5 A5:.5  G5:2 r:2  E5:.5 D5:.5 E5:.5 G5:.5 E5:.5 D5:.5 C5:1  C5:.5 D5:.5 C5:2 r:1' },
      { type: 'sine', vol: .32, notes: ['C', 'C', 'C', 'C', 'C', 'Am', 'C', 'Cend'].map(c => arp[c]).join(' ') }
    ] },
    tigers: { bpm: 126, voices: [
      { type: 'square', vol: .2, notes: 'C5:1 D5:1 E5:1 C5:1  C5:1 D5:1 E5:1 C5:1  E5:1 F5:1 G5:2  E5:1 F5:1 G5:2  G5:.5 A5:.5 G5:.5 F5:.5 E5:1 C5:1  G5:.5 A5:.5 G5:.5 F5:.5 E5:1 C5:1  C5:1 G4:1 C5:2  C5:1 G4:1 C5:2' },
      { type: 'triangle', vol: .45, notes: oomPah(new Array(8).fill(['C3', 'G2'])) },
      { type: 'noise', vol: .06, notes: 'r:1 x:1 '.repeat(16) }
    ] }
  };
  Object.values(SONGS).forEach(s => s.voices.forEach(v => { v.seq = parse(v.notes); }));

  let ctx = null, master = null, noiseBuf = null, timer = null;
  let track = null, voices = [], muted = false;

  function ensure() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return true;
  }
  function tone(type, f, t, dur, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.setValueAtTime(vol, t + Math.max(0.014, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function hit(t, vol) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 5000;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.06);
  }
  function restart() {
    if (!ctx || !track) return;
    const t0 = ctx.currentTime + 0.08;
    voices = SONGS[track].voices.map(v => ({ v, i: 0, t: t0 }));
  }
  // Планировщик: раз в 120 мс ставит ноты на ближайшие 0,35 с.
  function tick() {
    if (!ctx || !track || muted || ctx.state !== 'running') return;
    const spb = 60 / SONGS[track].bpm, until = ctx.currentTime + 0.35;
    voices.forEach(V => {
      if (V.t < ctx.currentTime - 1) V.t = ctx.currentTime + 0.05; // вкладка спала — не догоняем
      while (V.t < until) {
        const [n, b] = V.v.seq[V.i], dur = b * spb;
        if (n === 'x') hit(V.t, V.v.vol);
        else if (n !== 'r') tone(V.v.type, hz(n), V.t, dur * 0.9, V.v.vol);
        V.t += dur; V.i = (V.i + 1) % V.v.seq.length;
      }
    });
  }

  const Music = {
    // Вызывать из нажатия: браузеры включают звук только после действия пользователя.
    unlock() {
      if (!ensure()) return;
      if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
      if (!timer) { timer = setInterval(tick, 120); restart(); }
    },
    setTrack(name) {
      if (name === track) return;
      track = name;
      restart();
    },
    setMuted(m) {
      muted = !!m;
      if (!ctx) return;
      master.gain.setTargetAtTime(muted ? 0 : 0.5, ctx.currentTime, 0.05);
      if (!muted) restart();
    },
    sfx(kind) {
      if (!ctx || muted || ctx.state !== 'running') return;
      const t = ctx.currentTime + 0.01;
      const seq = { buy: [['E6', .05], ['A6', .08]], undo: [['A5', .05], ['E5', .08]], nope: [['C4', .07], ['C4', .1]], fanfare: [['C5', .08], ['E5', .08], ['G5', .08], ['C6', .2]] }[kind] || [];
      let at = t;
      seq.forEach(([n, d]) => { tone('square', hz(n), at, d, .16); at += d; });
    },
    SONGS
  };
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (timer) ctx.resume().then(restart);
  });

  root.Music = Music;
  if (typeof module !== 'undefined' && module.exports) module.exports = Music;
})(typeof window !== 'undefined' ? window : this);
