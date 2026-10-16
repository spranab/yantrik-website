// Beatgrid — 16-step, 6-sound sequencer. All sound synthesised with Web Audio.
const STEPS = 16;
const ROWS = [
  { id: 'kick',  label: 'Kick' },
  { id: 'snare', label: 'Snare' },
  { id: 'hat',   label: 'Closed Hat' },
  { id: 'ohat',  label: 'Open Hat' },
  { id: 'clap',  label: 'Clap' },
  { id: 'tone',  label: 'Tone' }
];

// grid[row][step] = true/false
let grid = ROWS.map(() => new Array(STEPS).fill(false));
let ctx = null, master = null;
let playing = false, currentStep = 0;
let nextNoteTime = 0, timerId = null;
let bpm = 120;
const LOOKAHEAD_MS = 25, SCHEDULE_AHEAD = 0.1;

const gridEl = document.getElementById('grid');
const playBtn = document.getElementById('play');
const bpmInput = document.getElementById('bpm');
const bpmRange = document.getElementById('bpmRange');
const presetSel = document.getElementById('presets');
const clearBtn = document.getElementById('clear');

function buildGrid() {
  gridEl.innerHTML = '';
  ROWS.forEach((row, r) => {
    const lab = document.createElement('div');
    lab.className = 'label';
    lab.textContent = row.label;
    gridEl.appendChild(lab);
    for (let s = 0; s < STEPS; s++) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (s % 4 === 0 ? ' beat' : '') + (row.id === 'tone' ? ' tone' : '');
      cell.dataset.row = r;
      cell.dataset.step = s;
      cell.addEventListener('pointerdown', () => toggle(r, s));
      gridEl.appendChild(cell);
    }
  });
  paint();
}

function cellAt(r, s) {
  return gridEl.querySelector('.cell[data-row="' + r + '"][data-step="' + s + '"]');
}

function toggle(r, s) {
  grid[r][s] = !grid[r][s];
  paint();
}

function paint() {
  for (let r = 0; r < ROWS.length; r++) {
    for (let s = 0; s < STEPS; s++) {
      const c = cellAt(r, s);
      if (c) c.classList.toggle('on', grid[r][s]);
    }
  }
}

function paintPlayhead(step) {
  for (let r = 0; r < ROWS.length; r++) {
    for (let s = 0; s < STEPS; s++) {
      const c = cellAt(r, s);
      if (c) c.classList.toggle('playing', s === step);
    }
  }
}

// ---- audio ----
function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function noiseBuffer(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function env(gain, t, peak, attack, decay) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function kick(t) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  env(g, t, 1.0, 0.002, 0.28);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + 0.35);
}

function snare(t) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(0.25);
  const bp = ctx.createBiquadFilter(); bp.type = 'highpass'; bp.frequency.value = 1200;
  const g = ctx.createGain();
  env(g, t, 0.7, 0.002, 0.16);
  src.connect(bp).connect(g).connect(master);
  src.start(t); src.stop(t + 0.25);
  const o = ctx.createOscillator(), og = ctx.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(190, t);
  env(og, t, 0.35, 0.002, 0.1);
  o.connect(og).connect(master);
  o.start(t); o.stop(t + 0.15);
}

function hat(t, open) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(open ? 0.5 : 0.12);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
  const g = ctx.createGain();
  env(g, t, 0.35, 0.001, open ? 0.4 : 0.05);
  src.connect(hp).connect(g).connect(master);
  src.start(t); src.stop(t + (open ? 0.5 : 0.12));
}

function clap(t) {
  for (let i = 0; i < 3; i++) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(0.08);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.2;
    const g = ctx.createGain();
    env(g, t + i * 0.012, 0.5, 0.001, 0.06);
    src.connect(bp).connect(g).connect(master);
    src.start(t + i * 0.012); src.stop(t + i * 0.012 + 0.09);
  }
}

function tone(t) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(440, t);
  env(g, t, 0.22, 0.005, 0.18);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + 0.25);
}

const VOICES = { kick, snare, hat: (t) => hat(t, false), ohat: (t) => hat(t, true), clap, tone };

function playStep(step, t) {
  ROWS.forEach((row, r) => {
    if (grid[r][step]) VOICES[row.id](t);
  });
}

function scheduler() {
  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
    const step = currentStep;
    playStep(step, nextNoteTime);
    const delay = Math.max(0, (nextNoteTime - ctx.currentTime) * 1000);
    setTimeout(() => { if (playing) paintPlayhead(step); }, delay);
    nextNoteTime += 60 / bpm / 4; // sixteenth notes
    currentStep = (currentStep + 1) % STEPS;
  }
}

function start() {
  ensureAudio();
  playing = true;
  currentStep = 0;
  nextNoteTime = ctx.currentTime + 0.05;
  playBtn.textContent = 'Stop';
  playBtn.classList.add('active');
  timerId = setInterval(scheduler, LOOKAHEAD_MS);
}

function stop() {
  playing = false;
  clearInterval(timerId);
  timerId = null;
  playBtn.textContent = 'Start';
  playBtn.classList.remove('active');
  paintPlayhead(-1);
}

// ---- presets ----
const PRESETS = {
  'Four on the floor': { kick: [0,4,8,12], hat: [2,6,10,14], clap: [4,12] },
  'Backbeat': { kick: [0,10], snare: [4,12], hat: [0,2,4,6,8,10,12,14] },
  'Hip hop': { kick: [0,3,6,10], snare: [4,12], hat: [0,2,4,6,8,10,12,14], ohat: [7,15] },
  'Techno': { kick: [0,4,8,12], ohat: [2,6,10,14], clap: [4,12], tone: [0,8] }
};

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  grid = ROWS.map((row) => new Array(STEPS).fill(false));
  ROWS.forEach((row, r) => {
    (p[row.id] || []).forEach((s) => { grid[r][s] = true; });
  });
  paint();
}

// ---- wiring ----
playBtn.addEventListener('click', () => (playing ? stop() : start()));
clearBtn.addEventListener('click', () => { grid = ROWS.map(() => new Array(STEPS).fill(false)); paint(); });

function setBpm(v) {
  bpm = Math.min(240, Math.max(40, Number(v) || 120));
  bpmInput.value = bpm;
  bpmRange.value = bpm;
}
bpmInput.addEventListener('input', (e) => setBpm(e.target.value));
bpmRange.addEventListener('input', (e) => setBpm(e.target.value));

Object.keys(PRESETS).forEach((name) => {
  const o = document.createElement('option');
  o.value = name; o.textContent = name;
  presetSel.appendChild(o);
});
presetSel.addEventListener('change', (e) => applyPreset(e.target.value));

buildGrid();
