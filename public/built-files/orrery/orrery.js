// Orrery - the Sun and its eight planets, in true order, at true relative speeds.
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

let W = 0, H = 0, cx = 0, cy = 0, scale = 1;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  cx = W / 2; cy = H / 2;
  scale = Math.min(W, H) / 2 * 0.92;
}
window.addEventListener('resize', resize);
resize();

// a = orbit radius in AU (squeezed with a sqrt so Neptune still fits on screen)
// period = orbital period in Earth years
const PLANETS = [
  { name: 'Mercury', a: 0.387, period: 0.241, r: 2.2, color: '#b8b0a4', facts: ['Smallest planet, and the fastest around the Sun.', 'A year lasts 88 Earth days.', 'Its day is longer than its year.'] },
  { name: 'Venus',   a: 0.723, period: 0.615, r: 3.4, color: '#e8cda2', facts: ['Hottest planet: about 465 degrees C at the surface.', 'Spins backwards compared with most planets.', 'A year is 225 Earth days; a day is 243.'] },
  { name: 'Earth',   a: 1.000, period: 1.000, r: 3.6, color: '#4f8fd6', facts: ['The only planet known to have life.', 'One orbit takes 365.25 days.', 'One moon.'] },
  { name: 'Mars',    a: 1.524, period: 1.881, r: 2.8, color: '#c1552f', facts: ['Home of Olympus Mons, the tallest volcano known.', 'A year is 687 Earth days.', 'Two small moons: Phobos and Deimos.'] },
  { name: 'Jupiter', a: 5.203, period: 11.862, r: 8.0, color: '#d8b48a', facts: ['The largest planet; over 1,300 Earths would fit inside.', 'The Great Red Spot is a storm wider than Earth.', 'A year is about 11.9 Earth years.'] },
  { name: 'Saturn',  a: 9.537, period: 29.457, r: 7.0, color: '#e3d3a0', facts: ['Famous for its bright rings of ice and rock.', 'Least dense planet: it would float in water.', 'A year is about 29.5 Earth years.'] },
  { name: 'Uranus',  a: 19.19, period: 84.017, r: 5.4, color: '#9fd8e0', facts: ['Tipped on its side; it rolls around the Sun.', 'A year is about 84 Earth years.', 'Discovered in 1781.'] },
  { name: 'Neptune', a: 30.07, period: 164.79, r: 5.2, color: '#4a6fd4', facts: ['Farthest planet from the Sun.', 'Winds reach about 2,000 km/h.', 'A year is about 165 Earth years.'] }
];

// squeeze the radii so the outer orbits fit: r = sqrt(a) normalised
const MAXA = Math.sqrt(PLANETS[PLANETS.length - 1].a);
for (const p of PLANETS) p.orbit = Math.sqrt(p.a) / MAXA;

// days since J2000 epoch, 2000-01-01 12:00 UTC
const EPOCH = Date.UTC(2000, 0, 1, 12, 0, 0);
let simDays = (Date.now() - EPOCH) / 86400000;
let daysPerSecond = 5;   // time slider: simulated days per real second
let paused = false;
let last = performance.now();
let hovered = null;
let card = null;         // {planet, x, y}

function angleOf(p) {
  // mean longitude: start each planet at a spread-out angle, then advance by its period
  const start = PLANETS.indexOf(p) * 0.7;
  return start + (simDays / (p.period * 365.25)) * Math.PI * 2;
}

function posOf(p) {
  const a = angleOf(p);
  const R = p.orbit * scale;
  return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
}

function drawStars() {
  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, W, H);
  // a fixed scatter of faint stars, seeded so it does not shimmer
  let s = 12345;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() * 1.2 + 0.2;
    ctx.globalAlpha = 0.25 + rnd() * 0.5;
    ctx.fillStyle = '#cfd8ea';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawOrbits() {
  ctx.lineWidth = 1;
  for (const p of PLANETS) {
    const R = p.orbit * scale;
    ctx.strokeStyle = (hovered === p) ? 'rgba(180,205,255,0.85)' : 'rgba(120,140,190,0.35)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    // label on the orbit, at the planet's current angle so it never collides
    const a = angleOf(p);
    ctx.fillStyle = (hovered === p) ? '#eaf0ff' : 'rgba(170,190,225,0.75)';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, cx + Math.cos(a) * R, cy + Math.sin(a) * R - p.r - 6);
  }
}

function drawSun() {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
  g.addColorStop(0, '#fff6c8');
  g.addColorStop(0.4, '#ffd24a');
  g.addColorStop(1, 'rgba(255,180,40,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
}

function drawPlanets() {
  for (const p of PLANETS) {
    const { x, y } = posOf(p);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
    if (hovered === p) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, p.r + 4, 0, Math.PI * 2); ctx.stroke();
    }
  }
}

function drawHud() {
  const d = new Date(EPOCH + simDays * 86400000);
  const stamp = d.toISOString().slice(0, 10);
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(232,236,245,0.9)';
  ctx.fillText('Date: ' + stamp, 16, 26);
  ctx.fillStyle = 'rgba(170,190,225,0.75)';
  ctx.fillText((paused ? 'Paused' : 'Running') + '  |  ' + daysPerSecond + ' days / second', 16, 46);
}

function drawCard() {
  if (!card) return;
  const p = card.planet;
  const lines = [p.name, ...p.facts];
  ctx.font = '13px system-ui, sans-serif';
  let w = 0;
  for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  w += 24;
  const h = 16 + lines.length * 18;
  let x = card.x + 14, y = card.y - h / 2;
  if (x + w > W - 8) x = card.x - w - 14;
  y = Math.max(8, Math.min(y, H - h - 8));
  ctx.fillStyle = 'rgba(12,16,28,0.92)';
  ctx.strokeStyle = 'rgba(150,175,225,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, 8); } else { ctx.rect(x, y, w, h); }
  ctx.fill(); ctx.stroke();
  ctx.textAlign = 'left';
  lines.forEach((l, i) => {
    ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(200,214,238,0.9)';
    ctx.font = (i === 0 ? 'bold 14px' : '13px') + ' system-ui, sans-serif';
    ctx.fillText(l, x + 12, y + 22 + i * 18);
  });
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (!paused) simDays += dt * daysPerSecond;
  drawStars();
  drawOrbits();
  drawSun();
  drawPlanets();
  drawHud();
  drawCard();
  requestAnimationFrame(frame);
}

function pick(mx, my) {
  for (const p of PLANETS) {
    const { x, y } = posOf(p);
    if (Math.hypot(mx - x, my - y) <= p.r + 6) return p;
  }
  return null;
}

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  hovered = pick(e.clientX - r.left, e.clientY - r.top);
  canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
});

canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect();
  const p = pick(e.clientX - r.left, e.clientY - r.top);
  if (p) {
    const pos = posOf(p);
    card = { planet: p, x: pos.x, y: pos.y };
  } else {
    card = null;
  }
});

requestAnimationFrame(frame);
